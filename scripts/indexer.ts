import * as dotenv from "dotenv";
dotenv.config();
import { ABIs, mainChain } from "@/lib/constant";
import { getConfig, updateConfig } from "@/lib/model";
import { debugLog, handleEvents, syncEvents } from "@/lib/sync";
import { createPublicClient, http } from "viem";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const publicClient = createPublicClient({
  chain: mainChain,
  transport: http("https://bsc-dataseed2.binance.org/"),
});

let start = 0;
let step = 100;
let totalBlock = 0;

async function syncDataWithRange(from: number, to: number) {
  debugLog(`Syncing data from ${from} to ${to}`);
  await syncEvents(from, to);
  await handleEvents();
}

async function main() {
  const config = await getConfig();
  start = parseInt(config[`indexer_progress_${mainChain.id}`]);
  step = parseInt(config[`indexer_step_${mainChain.id}`]);
  while (true) {
    totalBlock = Number(await publicClient.getBlockNumber()) - 20;
    const endBlock = Math.min(start + step, totalBlock);
    try {
      await syncDataWithRange(start, endBlock);
      start = endBlock;
      await updateConfig(`indexer_progress_${mainChain.id}`, start.toString());
    } catch (e: any) {
      console.log(e);
      debugLog(e.toString(), "error");
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }
}

main();
