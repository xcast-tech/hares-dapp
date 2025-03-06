import { decodeEventLog } from "viem";
import { ABIs, contractAddress, EventTopic, mainChain, SCAN_API_KEY } from "./constant";
import { ContractEvent } from "./types";

export async function getTokenCreateEvent(from: number, to: number) {
  const url = `${mainChain.blockExplorers.default.apiUrl}?module=logs&action=getLogs&fromBlock=${from}&toBlock=${to}&address=${contractAddress.HaresFactory}&topic0=${EventTopic.HaresTokenCreated}&apikey=${SCAN_API_KEY}`;
  const res = await fetch(url).then((res) => res.json());
  const parsed = res.result.map((v: any) => ({
    address: v.address,
    timeStamp: parseInt(v.timeStamp),
    block: parseInt(v.blockNumber),
    hash: v.transactionHash,
    txIndex: v.transactionIndex === "0x" ? 0 : parseInt(v.transactionIndex),
    ...decodeEventLog({
      abi: ABIs.HaresFactoryAbi,
      data: v.data,
      topics: v.topics,
    }),
  }));
  return parsed as ContractEvent<any>[];
}

export async function getTokenEvents(from: number, to: number, topic: string) {
  const topicHash = EventTopic[topic];
  const url = `${mainChain.blockExplorers.default.apiUrl}?module=logs&action=getLogs&fromBlock=${from}&toBlock=${to}&topic0=${topicHash}&apikey=${SCAN_API_KEY}`;
  const res = await fetch(url).then((res) => res.json());
  const parsed = res.result.map((v: any) => ({
    address: v.address,
    timeStamp: parseInt(v.timeStamp),
    block: parseInt(v.blockNumber),
    hash: v.transactionHash,
    txIndex: v.transactionIndex === "0x" ? 0 : parseInt(v.transactionIndex),
    ...decodeEventLog({
      abi: ABIs.HaresAbi,
      data: v.data,
      topics: v.topics,
    }),
  }));
  return parsed as ContractEvent<any>[];
}
