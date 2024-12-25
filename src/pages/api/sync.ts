// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { mainChain } from "@/lib/constant";
import { getConfig, updateConfig } from "@/lib/model";
import { handleEvents, syncEvents } from "@/lib/sync";
import type { NextApiRequest, NextApiResponse } from "next";
import { createPublicClient, createWalletClient, http } from "viem";
(BigInt.prototype as any).toJSON = function () { return this.toString() }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  const publicClient = createPublicClient({
    chain: mainChain,
    transport: http(),
  })

  const config = await getConfig()
  const start = parseInt(config.indexer_progress)
  const step = parseInt(config.indexer_step)
  const totalBlock = Number(await publicClient.getBlockNumber()) - 30
  const endBlock = Math.min(start + step, totalBlock)
  const events = await syncEvents(start, endBlock)
  const handled = await handleEvents()
  await updateConfig('indexer_progress', endBlock.toString())

  res.json({
    code: 0,
    data: {
      events,
      handled
    }
  });

}