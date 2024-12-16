import { createPublicClient, http } from "viem";
import { ABIs, Address, mainChain } from "./constant";

export async function getTokenInfo(address: Address) {
  const publicClient = createPublicClient({
    chain: mainChain,
    transport: http(),
  })

  const [name, symbol] = await Promise.all([
    publicClient.readContract({
      address: address,
      abi: ABIs.HaresAbi,
      functionName: 'name',
      args: [],
    }),
    publicClient.readContract({
      address: address,
      abi: ABIs.HaresAbi,
      functionName: 'symbol',
      args: [],
    }),
  ])

  return {
    name,
    symbol,
  }
}