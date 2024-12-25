import { getSignatureApi } from "@/lib/apis";
import { ABIs, contractAddress, EventTopic } from "@/lib/constant";
import { Address } from "@/lib/types";
import { getEthBuyQuote, getSqrtPriceLimitX96, getTokenSellQuote } from "@/lib/utils";
import { toast } from "react-toastify";
import { useSignInMessage } from "@farcaster/auth-kit";
import { decodeEventLog, parseEther } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

export function useContract() {
  const { address } = useAccount();
  const { message, signature } = useSignInMessage();
  const publicClient = usePublicClient();
  const { data: hash, writeContract, writeContractAsync } = useWriteContract();

  async function createToken(name: string, symbol: string, value: string = "") {
    const tx = await writeContractAsync({
      address: contractAddress.HaresFactory,
      abi: ABIs.HaresFactoryAbi,
      functionName: "createToken",
      args: [name, symbol],
      // gas,
      value: parseEther(value),
    });
    const res = await publicClient?.waitForTransactionReceipt({
      hash: tx,
    });
    const tokenCreatedEvent = res?.logs?.find((log) => log.topics[0] === EventTopic.HaresTokenCreated);
    if (tokenCreatedEvent) {
      const event = decodeEventLog({
        abi: ABIs.HaresFactoryAbi,
        data: tokenCreatedEvent.data,
        topics: tokenCreatedEvent.topics,
      });
      const tokenAddress = (event.args as any).tokenAddress;
      console.log(tokenAddress);
    }
    return res;
  }

  async function getCurrentSupply(token: Address) {
    if (!publicClient) {
      return 0;
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
      return 0;
    }

    const res = await publicClient?.readContract({
      address: token,
      abi: ABIs.HaresAbi,
      functionName: "balanceOf",
      args: [adddress],
    });
    return Number(res);
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
      return 0;
    }
    const res = await publicClient?.readContract({
      address: pool,
      abi: ABIs.UniswapV3Pool,
      functionName: "slot0",
      args: [],
    });
    return res[0];
  }

  async function buy(token: Address, eth: number, slipage: number, onTxSend: (tx: string) => void = () => { }) {
    if (!address) {
      return;
    }
    const currentSupply = await getCurrentSupply(token);
    let minOrderSize = BigInt(0);
    let sqrtPriceLimitX96 = BigInt(0);
    const buyQuote = Number(getEthBuyQuote(Number(currentSupply) / 1e18, eth));
    if (currentSupply > 8e26) {
      const poolAddress = await getTokenPoolAddress(token);
      const sqrtPriceX96 = await getCurrentSqrtPriceX96(poolAddress as Address);
      const isWETHToken0 = parseInt(contractAddress.WETH) < parseInt(token);
      sqrtPriceLimitX96 = BigInt(getSqrtPriceLimitX96(sqrtPriceX96, slipage, isWETHToken0, true));
    } else {
      minOrderSize = BigInt(Math.floor(buyQuote * (1 - slipage)));
    }
    const commitment = {
      value: parseEther(eth.toString()),
      recipient: address,
      refundRecipient: address,
      minOrderSize,
      sqrtPriceLimitX96,
      expired: BigInt(Math.floor(Date.now()) + 60 * 100),
    };
    const buySignatureRes = await getSignatureApi(message!, signature!, commitment);
    if (buySignatureRes.code !== 0) {
      toast(buySignatureRes.message);
      return
    }
    const buySignature = buySignatureRes.data;
    const gasPrice = await publicClient?.getGasPrice();
    const tx = await writeContractAsync({
      address: token,
      abi: ABIs.HaresAbi,
      functionName: "signatureBuy",
      args: [commitment, buySignature],
      value: parseEther(eth.toString()),
      gasPrice: BigInt(Math.floor(Number(gasPrice) * 1.1)),
    });
    onTxSend(tx);
    await publicClient?.waitForTransactionReceipt({
      hash: tx,
    });
    return tx;
  }

  async function sell(token: Address, tokenToSell: number, slipage: number, onTxSend: (tx: string) => void = () => { }) {
    if (!address) {
      return;
    }
    const currentSupply = await getCurrentSupply(token);
    const sellQuote = Number(getTokenSellQuote(Number(currentSupply) / 1e18, tokenToSell));

    let minOrderSize = BigInt(0);
    let sqrtPriceLimitX96 = BigInt(0);
    if (currentSupply > 8e26) {
      const poolAddress = await getTokenPoolAddress(token);
      const sqrtPriceX96 = await getCurrentSqrtPriceX96(poolAddress as Address);
      const isWETHToken0 = parseInt(contractAddress.WETH) < parseInt(token);
      sqrtPriceLimitX96 = BigInt(getSqrtPriceLimitX96(sqrtPriceX96, slipage, isWETHToken0, false));
    } else {
      minOrderSize = BigInt(Math.floor(sellQuote * (1 - slipage)));
    }
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
    sell,
    getTokenBalance,
  };
}
