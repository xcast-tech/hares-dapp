import { getSignatureApi } from "@/lib/apis";
import { ABIs, contractAddress, EventTopic, primaryMarketSupply } from "@/lib/constant";
import { Address } from "@/lib/types";
import { calcSalt, getEthBuyQuote, getSqrtPriceLimitX96, getTokenSellQuote } from "@/lib/utils";
import { toast } from "react-toastify";
import { useSignInMessage } from "@farcaster/auth-kit";
import { decodeEventLog, parseEther, zeroAddress, padBytes, bytesToHex, zeroHash } from "viem";
import { useAccount, usePublicClient, useWriteContract, useWalletClient } from "wagmi";

export function useHaresContract() {
  const { address } = useAccount();
  const { message, signature } = useSignInMessage();
  const publicClient = usePublicClient();
  const walletClient = useWalletClient();
  const { data: hash, writeContract, writeContractAsync } = useWriteContract();

  async function createToken(name: string, symbol: string, tokenUri = "", value: string = "") {
    if (!address) {
      return;
    }
    const { predictedAddress, salt } = calcSalt(name, symbol, tokenUri, contractAddress.HaresFactory, contractAddress.BABTValidatorAddress, address);
    const tx = await writeContractAsync({
      address: contractAddress.HaresFactory,
      abi: ABIs.HaresFactoryAbi,
      functionName: "createToken",
      args: [name, symbol, zeroAddress, tokenUri, salt],
      // gas,
      value: parseEther(value),
    });
    const res = await publicClient?.waitForTransactionReceipt({
      hash: tx,
    });
    return predictedAddress;
  }

  async function getCurrentSupply(token: Address) {
    if (!publicClient) {
      return BigInt(0);
    }
    const res = await publicClient?.readContract({
      address: token,
      abi: ABIs.HaresAbi,
      functionName: "totalSupply",
      args: [],
    });
    return res;
  }

  async function getTokenBalance(token: Address, adddress: Address) {
    if (!publicClient) {
      return BigInt(0);
    }

    const res = await publicClient?.readContract({
      address: token,
      abi: ABIs.HaresAbi,
      functionName: "balanceOf",
      args: [adddress],
    });
    return res;
  }

  async function getTokenPoolAddress(token: Address) {
    if (!publicClient) {
      return 0;
    }

    const res = await publicClient?.readContract({
      address: token,
      abi: ABIs.HaresAbi,
      functionName: "poolAddress",
      args: [],
    });
    return res;
  }

  async function getCurrentSqrtPriceX96(pool: Address) {
    if (!publicClient) {
      return BigInt(0);
    }
    const res = await publicClient?.readContract({
      address: pool,
      abi: ABIs.UniswapV3Pool,
      functionName: "slot0",
      args: [],
    });
    return res[0];
  }

  async function simulateBuy(token: Address, eth: number, slipage: number) {
    if (!address) {
      return;
    }
    const currentSupply = await getCurrentSupply(token);
    let minOrderSize = BigInt(0);
    let sqrtPriceLimitX96 = BigInt(0);
    const buyQuote = Number(getEthBuyQuote(Number(currentSupply) / 1e18, eth));
    const isGraduated = currentSupply > primaryMarketSupply;
    if (isGraduated) {
      // publicMarket
      const poolAddress = await getTokenPoolAddress(token);
      const sqrtPriceX96 = await getCurrentSqrtPriceX96(poolAddress as Address);
      const isWETHToken0 = parseInt(contractAddress.WETH) < parseInt(token);
      sqrtPriceLimitX96 = BigInt(getSqrtPriceLimitX96(sqrtPriceX96, slipage, isWETHToken0, true));
      // sqrtPriceLimitX96 = sqrtPriceX96;
    } else {
      // primaryMarket
      minOrderSize = BigInt(Math.floor(buyQuote * (1 - slipage)));
    }

    return publicClient?.simulateContract({
      address: token,
      abi: ABIs.HaresAbi,
      functionName: "buy",
      args: [address, address, minOrderSize, sqrtPriceLimitX96, zeroHash],
      value: parseEther(eth.toString()),
    });
  }

  async function buy(token: Address, eth: number, slipage: number, onTxSend: (tx: string) => void = () => {}) {
    if (!address) {
      return;
    }
    const currentSupply = await getCurrentSupply(token);
    let minOrderSize = BigInt(0);
    let sqrtPriceLimitX96 = BigInt(0);
    console.log("- slipage", slipage);
    const buyQuote = Number(getEthBuyQuote(Number(currentSupply) / 1e18, eth));
    const isGraduated = currentSupply > primaryMarketSupply;
    if (isGraduated) {
      // publicMarket
      const poolAddress = await getTokenPoolAddress(token);
      const sqrtPriceX96 = await getCurrentSqrtPriceX96(poolAddress as Address);
      const isWETHToken0 = parseInt(contractAddress.WETH) < parseInt(token);
      sqrtPriceLimitX96 = BigInt(getSqrtPriceLimitX96(sqrtPriceX96, slipage, isWETHToken0, true));
      // sqrtPriceLimitX96 = sqrtPriceX96;
    } else {
      // primaryMarket
      minOrderSize = BigInt(Math.floor(buyQuote * (1 - slipage)));
    }

    const gasPrice = await publicClient?.getGasPrice();

    const tx = await writeContractAsync({
      address: token,
      abi: ABIs.HaresAbi,
      functionName: "buy",
      args: [address, address, minOrderSize, sqrtPriceLimitX96, zeroHash],
      value: parseEther(eth.toString()),
      gasPrice: BigInt(Math.floor(Number(gasPrice) * 1.1)),
    });
    onTxSend(tx);
    await publicClient?.waitForTransactionReceipt({
      hash: tx,
    });
    return tx;
  }

  async function simulateSell(token: Address, tokenToSell: number, slipage: number) {
    if (!address) {
      return;
    }
    const currentSupply = await getCurrentSupply(token);
    const sellQuote = Number(getTokenSellQuote(Number(currentSupply) / 1e18, tokenToSell));

    let minOrderSize = BigInt(0);
    let sqrtPriceLimitX96 = BigInt(0);
    if (currentSupply > primaryMarketSupply) {
      const poolAddress = await getTokenPoolAddress(token);
      const sqrtPriceX96 = await getCurrentSqrtPriceX96(poolAddress as Address);
      const isWETHToken0 = parseInt(contractAddress.WETH) < parseInt(token);
      sqrtPriceLimitX96 = BigInt(getSqrtPriceLimitX96(sqrtPriceX96, slipage, isWETHToken0, false));
    } else {
      minOrderSize = BigInt(Math.floor(sellQuote * (1 - slipage)));
    }

    return publicClient?.simulateContract({
      address: token,
      abi: ABIs.HaresAbi,
      functionName: "sell",
      account: address,
      args: [parseEther(tokenToSell.toString()), address, minOrderSize, sqrtPriceLimitX96],
    });
  }

  async function sell(token: Address, tokenToSell: number, slipage: number, onTxSend: (tx: string) => void = () => {}) {
    if (!address) {
      return;
    }
    const currentSupply = await getCurrentSupply(token);
    const sellQuote = Number(getTokenSellQuote(Number(currentSupply) / 1e18, tokenToSell));

    let minOrderSize = BigInt(0);
    let sqrtPriceLimitX96 = BigInt(0);
    if (currentSupply > primaryMarketSupply) {
      const poolAddress = await getTokenPoolAddress(token);
      const sqrtPriceX96 = await getCurrentSqrtPriceX96(poolAddress as Address);
      const isWETHToken0 = parseInt(contractAddress.WETH) < parseInt(token);
      sqrtPriceLimitX96 = BigInt(getSqrtPriceLimitX96(sqrtPriceX96, slipage, isWETHToken0, false));
    } else {
      minOrderSize = BigInt(Math.floor(sellQuote * (1 - slipage)));
    }
    // const res = await walletClient?.simulateContract({
    //   address: token,
    //   abi: ABIs.HaresAbi,
    //   functionName: "sell",
    //   args: [
    //     parseEther(tokenToSell.toString()),
    //     address,
    //     minOrderSize,
    //     sqrtPriceLimitX96,
    //   ],
    // });
    // console.log("--res", res);
    // If simulation is successful, proceed with the actual transaction
    // const hash = await walletClient.writeContract(request)
    // const tx = await writeContractAsync(res?.request!);
    // const gas = await publicClient?.estimateContractGas({
    //   address: token,
    //   abi: ABIs.HaresAbi,
    //   functionName: "sell",
    //   args: [
    //     parseEther(tokenToSell.toString()),
    //     address,
    //     minOrderSize,
    //     sqrtPriceLimitX96,
    //   ],
    // });
    // console.log("--gas", gas);
    const gasPrice = await publicClient?.getGasPrice();
    const tx = await writeContractAsync({
      address: token,
      abi: ABIs.HaresAbi,
      functionName: "sell",
      args: [parseEther(tokenToSell.toString()), address, minOrderSize, sqrtPriceLimitX96],
      gasPrice: BigInt(Math.floor(Number(gasPrice) * 1.1)),
    });
    onTxSend(tx);
    await publicClient?.waitForTransactionReceipt({
      hash: tx,
    });
    return tx;
  }

  return {
    createToken,
    getCurrentSupply,
    getTokenPoolAddress,
    getCurrentSqrtPriceX96,
    buy,
    simulateBuy,
    sell,
    simulateSell,
    getTokenBalance,
  };
}
