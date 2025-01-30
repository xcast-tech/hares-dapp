// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./interfaces/IHarespadFactory.sol";
import "./Harespad.sol";

contract HarespadFactory is IHarespadFactory, Ownable, ERC721URIStorage {

  error InsufficientFee();

  event HarespadTokenCreated(address indexed tokenAddress, address indexed creator, string name, string symbol, Config config);

  uint256 private nextTokenId = 0;
  Config private config;

  constructor(IHarespadFactory.Config memory _config) ERC721("Harespad", "HARESPAD") Ownable(msg.sender) {
    config = _config;
  }

  function createToken(string memory name, string memory symbol, string memory tokenURI) external payable returns (address) {
    if (msg.sender != owner() && msg.value < config.createTokenFee) {
      revert InsufficientFee();
    }

    _mint(msg.sender, nextTokenId);
    Harespad token = new Harespad(name, symbol, nextTokenId);
    _setTokenURI(nextTokenId, tokenURI);
    nextTokenId++;
    emit HarespadTokenCreated(address(token), msg.sender, name, symbol, config);
    return address(token);
  }

  function updateTokenURI(uint256 tokenId, string memory tokenURI) external {
    require(msg.sender == owner() || msg.sender == ownerOf(tokenId), "No permission");
    _setTokenURI(tokenId, tokenURI);
  }

  function setConfig(Config memory _config) external onlyOwner {
    config = _config;
  }

  function getConfig() public view returns (Config memory) {
    return config;
  }

  function withdraw(address to) external onlyOwner {
    (bool success, ) = to.call{value: address(this).balance}("");
    require(success, "Failed to withdraw");
  }

  receive() external payable { }

}