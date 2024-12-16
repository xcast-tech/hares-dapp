import { getSignatureApi } from "@/lib/apis";
import { ABIs, contractAddress, EventTopic } from "@/lib/constant"
import { Address } from "@/lib/types"
import { getEthBuyQuote, getTokenSellQuote } from "@/lib/utils";
import { useSignInMessage } from "@farcaster/auth-kit";
import { decodeEventLog, parseEther } from "viem"
import { useAccount, usePublicClient, useWriteContract } from "wagmi"

export function useContract() {
  
  const { address } = useAccount()
  const { message, signature } = useSignInMessage();
  const publicClient = usePublicClient()
  const { data: hash, writeContract, writeContractAsync } = useWriteContract()

  async function createToken(name: string, symbol: string) {
    const tx = await writeContractAsync({
      address: contractAddress.HaresFactory,
      abi: ABIs.HaresFactoryAbi,
      functionName: 'createToken',
      args: [name, symbol],
      // gas,
    })
    const res = await publicClient?.waitForTransactionReceipt({
      hash: tx
    })
    const tokenCreatedEvent = res?.logs?.find(log => log.topics[0] === EventTopic.TokenCreated)
    if (tokenCreatedEvent) {
      const event = decodeEventLog({
        abi: ABIs.HaresFactoryAbi,
        data: tokenCreatedEvent.data,
        topics: tokenCreatedEvent.topics
      })
      const tokenAddress = (event.args as any).tokenAddress
      console.log(tokenAddress)
    }
    return res
  }

  async function getCurrentSupply(token: Address) {
    if (!publicClient) {
      return 0
    }
    const res = await publicClient?.readContract({
      address: token,
      abi: ABIs.HaresAbi,
      functionName: 'totalSupply',
      args: [],
    })
    return res
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
    return Number(res) / 1e18;
  }

  async function buy(token: Address, eth: number, slipage: number) {
    if (!address) {
      return
    }
    const currentSupply = await getCurrentSupply(token)
    const buyQuote = Number(getEthBuyQuote(Number(currentSupply) / 1e18, eth))
    const commitment = {
      value: parseEther(eth.toString()),
      recipient: address,
      refundRecipient: address,
      minOrderSize: BigInt(Math.floor(buyQuote * (1 - slipage))),
      sqrtPriceLimitX96: BigInt(0),
      expired: BigInt(Math.floor(Date.now()) + 60 * 100)
    }
    const buySignatureRes = await getSignatureApi(message!, signature!, commitment)
    const buySignature = buySignatureRes.data
    const tx = await writeContractAsync({
      address: token,
      abi: ABIs.HaresAbi,
      functionName: 'signatureBuy',
      args: [commitment, buySignature],
      value: parseEther(eth.toString()),
      // gas,
    })
    // const res = await publicClient?.waitForTransactionReceipt({
    //   hash: tx
    // })
    return tx
  }

  async function sell(token: Address, tokenToSell: number, slipage: number) {
    if (!address) {
      return
    }
    const currentSupply = await getCurrentSupply(token)
    const sellQuote = Number(getTokenSellQuote(Number(currentSupply) / 1e18, tokenToSell))
    
    const tx = await writeContractAsync({
      address: token,
      abi: ABIs.HaresAbi,
      functionName: 'sell',
      args: [parseEther(tokenToSell.toString()), address, BigInt(Math.floor(sellQuote * (1 - slipage))), BigInt(0)],
      // gas,
    })
    // const res = await publicClient?.waitForTransactionReceipt({
    //   hash: tx
    // })
    return tx
  }

  return {
    createToken,
    getCurrentSupply,
    buy,
    sell,
    getTokenBalance,
  }
}