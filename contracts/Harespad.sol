// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./interfaces/INonfungiblePositionManager.sol";
import "./interfaces/IHarespadFactory.sol";
import "./interfaces/ISwapRouter.sol";
import "./interfaces/IUniswapV3Pool.sol";
import "./interfaces/IWETH.sol";
import 'hardhat/console.sol';

contract Harespad is ERC20, IERC721Receiver, ReentrancyGuard {

  event HarespadRaise(address indexed to, uint256 value);
  event HarespadGraduated();
  event HarespadClaim(address indexed to, uint256 token, uint256 refund);
  event HarespadTokenFees(address indexed tokenCreator, address indexed protocolFeeRecipient, uint256 tokenCreatorFee, uint256 protocolFee);

  uint256 internal constant PRIMARY_MARKET_SUPPLY = 750_000_000e18; // 750M tokens
  uint256 internal constant DEV_SUPPLY = 50_000_000e18; // 200M tokens
  uint256 internal constant SECONDARY_MARKET_SUPPLY = 200_000_000e18; // 200M tokens
  uint256 internal constant GRADUATE_ETH = 4.36 ether;
  uint256 internal constant UNISWAP_ETH = 4.2 ether;
  uint256 internal constant MIN_ORDER_SIZE = 0.01 ether;
  uint24 internal constant LP_FEE = 3000;
  int24 internal constant LP_TICK_LOWER = -887220;
  int24 internal constant LP_TICK_UPPER = 887220;

  uint160 internal constant POOL_SQRT_PRICE_X96_WETH_0 = 546726262810727604747011891396608;
  uint160 internal constant POOL_SQRT_PRICE_X96_TOKEN_0 = 11481251519025280662372352;

  IHarespadFactory.Config private factoryConfig;
  address private factoryAddress;
  address private poolAddress;
  uint256 private totalRaised;
  mapping(address => uint256) private raised;
  mapping(address => bool) private claimed;
  uint256 public harespadTokenId;
  uint256 public lpTokenId;

  bool private isGraduate = false;

  constructor(string memory name, string memory symbol, uint256 tokenId) ERC20(name, symbol) ReentrancyGuard() {
    harespadTokenId = tokenId;
    factoryAddress = msg.sender;
    factoryConfig = IHarespadFactory(msg.sender).getConfig();
    address token0 = factoryConfig.WETH < address(this) ? factoryConfig.WETH : address(this);
    address token1 = factoryConfig.WETH < address(this) ? address(this) : factoryConfig.WETH;
    uint160 sqrtPriceX96 = token0 == factoryConfig.WETH ? POOL_SQRT_PRICE_X96_WETH_0 : POOL_SQRT_PRICE_X96_TOKEN_0;
    poolAddress = INonfungiblePositionManager(factoryConfig.nonfungiblePositionManager).createAndInitializePoolIfNecessary(token0, token1, LP_FEE, sqrtPriceX96);
  }

  function owner() public view returns (address) {
    return IERC721(factoryAddress).ownerOf(harespadTokenId);
  }

  function raise(address to) public payable nonReentrant {
    require(!isGraduate, "Already graduate");
    require(msg.value >= MIN_ORDER_SIZE, "Cannot raise less than 0.01 eth");
    raised[to] += msg.value;
    totalRaised += msg.value;
    emit HarespadRaise(to, msg.value);
  }

  function raisedOf(address to) public view returns (uint256) {
    return raised[to];
  }

  function uniswapBuy(
    address recipient,
    uint256 minOrderSize,
    uint160 sqrtPriceLimitX96
  ) public payable nonReentrant {
    require(isGraduate, "Not graduate");
    uint256 fee = msg.value * factoryConfig.uniswapFeeBps / 10000;
    uint256 totalCost = msg.value - fee;
    _disperseFees(fee, 0);
    address WETH = factoryConfig.WETH;
    IWETH(WETH).deposit{value: totalCost}();
    IWETH(WETH).approve(factoryConfig.swapRouter, totalCost);

    ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
      tokenIn: WETH,
      tokenOut: address(this),
      fee: LP_FEE,
      recipient: recipient,
      amountIn: totalCost,
      amountOutMinimum: minOrderSize,
      sqrtPriceLimitX96: sqrtPriceLimitX96
    });

    ISwapRouter(factoryConfig.swapRouter).exactInputSingle(params);
    _handleSecondaryRewards();
  }

  function uniswapSell(
    uint256 tokensToSell,
    address recipient,
    uint256 minPayoutSize,
    uint160 sqrtPriceLimitX96
  ) public payable nonReentrant {
    require(isGraduate, "Not graduate");

    address WETH = factoryConfig.WETH;
    transfer(address(this), tokensToSell);
    this.approve(factoryConfig.swapRouter, tokensToSell);
    ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
      tokenIn: address(this),
      tokenOut: WETH,
      fee: LP_FEE,
      recipient: address(this),
      amountIn: tokensToSell,
      amountOutMinimum: minPayoutSize,
      sqrtPriceLimitX96: sqrtPriceLimitX96
    });

    uint256 payout = ISwapRouter(factoryConfig.swapRouter).exactInputSingle(params);
    IWETH(WETH).withdraw(payout);
    uint256 fee = payout * factoryConfig.uniswapFeeBps / 10000;
    uint256 payoutAfterFee = payout - fee;
    _disperseFees(fee, 0);

    (bool success, ) = recipient.call{value: payoutAfterFee}("");
    require(success, "ETH transfer failed");
  }

  function graduate() public {
    require(!isGraduate, "Already graduate");
    require(msg.sender == factoryConfig.owner, "No permission");
    require(address(this).balance >= GRADUATE_ETH, "Not able to graduate");

    isGraduate = true;
    (bool success, ) = factoryConfig.protocolFeeRecipient.call{value: GRADUATE_ETH - UNISWAP_ETH}("");
    require(success, "Protocol fee transfer failed");

    address WETH = factoryConfig.WETH;
    address nonfungiblePositionManager = factoryConfig.nonfungiblePositionManager;

    IWETH(WETH).deposit{value: UNISWAP_ETH}();

    _mint(address(this), SECONDARY_MARKET_SUPPLY);
    _mint(owner(), DEV_SUPPLY);

    IERC20(WETH).approve(address(nonfungiblePositionManager), UNISWAP_ETH);
    IERC20(this).approve(address(nonfungiblePositionManager), SECONDARY_MARKET_SUPPLY);

    bool isWethToken0 = address(WETH) < address(this);
    address token0 = isWethToken0 ? WETH : address(this);
    address token1 = isWethToken0 ? address(this) : WETH;
    uint256 amount0 = isWethToken0 ? UNISWAP_ETH : SECONDARY_MARKET_SUPPLY;
    uint256 amount1 = isWethToken0 ? SECONDARY_MARKET_SUPPLY : UNISWAP_ETH;

    uint160 currentSqrtPriceX96 = IUniswapV3Pool(poolAddress).slot0().sqrtPriceX96;
    uint160 desiredSqrtPriceX96 = isWethToken0 ? POOL_SQRT_PRICE_X96_WETH_0 : POOL_SQRT_PRICE_X96_TOKEN_0;

    if (currentSqrtPriceX96 != desiredSqrtPriceX96) {
      bool swap0To1 = currentSqrtPriceX96 > desiredSqrtPriceX96;
      IUniswapV3Pool(poolAddress).swap(address(this), swap0To1, 100, desiredSqrtPriceX96, "");
    }

    INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager.MintParams({
      token0: token0,
      token1: token1,
      fee: LP_FEE,
      tickLower: LP_TICK_LOWER,
      tickUpper: LP_TICK_UPPER,
      amount0Desired: amount0,
      amount1Desired: amount1,
      amount0Min: 0,
      amount1Min: 0,
      recipient: address(this),
      deadline: block.timestamp
    });

    (lpTokenId, , , ) = INonfungiblePositionManager(nonfungiblePositionManager).mint(params);
    emit HarespadGraduated();
  }

  function getClaim(address to) external view returns (uint256, uint256) {
    require(isGraduate, "Not graduate");
    if (raised[to] == 0) {
      return (0, 0);
    }
    uint256 token = raised[to] * PRIMARY_MARKET_SUPPLY / totalRaised;
    uint256 refund = raised[to] - token * GRADUATE_ETH / PRIMARY_MARKET_SUPPLY;
    return (token, refund);
  }

  function claim(address[] memory to) public {
    require(isGraduate, "Not graduate");
    for(uint256 i = 0; i < to.length; i++) {
      if (raised[to[i]] == 0 || claimed[to[i]]) {
        continue;
      }
      uint256 token = raised[to[i]] * PRIMARY_MARKET_SUPPLY / totalRaised;
      uint256 refund = raised[to[i]] - token * GRADUATE_ETH / PRIMARY_MARKET_SUPPLY;
      if (refund > 0) {
        (bool success, ) = to[i].call{value: refund}("");
        require(success, "Protocol fee transfer failed");
      }
      claimed[to[i]] = true;
      emit HarespadClaim(to[i], token, refund);
    }
  }

  function getClaimed(address to) public view returns (bool) {
    return claimed[to];
  }

  function _handleSecondaryRewards() internal {
    require(isGraduate, "Not graduate");

    INonfungiblePositionManager.CollectParams memory params = INonfungiblePositionManager.CollectParams({
      tokenId: lpTokenId,
      recipient: address(this),
      amount0Max: type(uint128).max,
      amount1Max: type(uint128).max
    });

    (uint256 totalAmountToken0, uint256 totalAmountToken1) = INonfungiblePositionManager(factoryConfig.nonfungiblePositionManager).collect(params);

    address token0 = factoryConfig.WETH < address(this) ? factoryConfig.WETH : address(this);
    address token1 = factoryConfig.WETH < address(this) ? address(this) : factoryConfig.WETH;

    _transferRewards(token0, totalAmountToken0);
    _transferRewards(token1, totalAmountToken1);
  }

  function claimSecondaryRewards() external {
    _handleSecondaryRewards();
  }

  function _transferRewards(address token, uint256 totalAmount) internal {
    if (totalAmount > 0) {
      if (token == factoryConfig.WETH) {
        IWETH(factoryConfig.WETH).withdraw(totalAmount);
        _disperseFees(totalAmount, factoryConfig.lpCreatorFeeBps);
      } else {
        uint256 creatorAmountToken = totalAmount * factoryConfig.lpCreatorFeeBps / 10000;
        _transfer(address(this), factoryConfig.protocolFeeRecipient, totalAmount - creatorAmountToken);
        _transfer(address(this), owner(), creatorAmountToken);
      }
    }
  }

  function _disperseFees(uint256 _fee, uint256 _tokenCreatorFeeBPS) internal {
    if (_tokenCreatorFeeBPS > 0) {
      uint256 tokenCreatorFee = _fee * _tokenCreatorFeeBPS / 10000;
      (bool success1, ) = owner().call{value: tokenCreatorFee}("");
      (bool success2, ) = factoryConfig.protocolFeeRecipient.call{value: _fee - tokenCreatorFee}("");
      require(success1 && success2, "ETH Transfer failed");
      emit HarespadTokenFees(owner(), factoryConfig.protocolFeeRecipient, tokenCreatorFee, _fee - tokenCreatorFee);
    } else {
      (bool success, ) = factoryConfig.protocolFeeRecipient.call{value: _fee}("");
      require(success, "ETH Transfer failed");
      emit HarespadTokenFees(owner(), factoryConfig.protocolFeeRecipient, 0, _fee);
    }
  }

  receive() external payable {
    if (msg.sender == factoryConfig.WETH) {
      return;
    }

    raise(msg.sender);
  }

  function onERC721Received(address, address, uint256, bytes calldata) external view returns (bytes4) {
    require(msg.sender == poolAddress, 'Only pool');
    return this.onERC721Received.selector;
  }

  function uniswapV3SwapCallback(int256 amount0Delta, int256 amount1Delta, bytes calldata) external {}

  function getIsGraduate() external view returns (bool) {
    return isGraduate;
  }

}
