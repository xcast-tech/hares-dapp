// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { decodeEventLog } from "viem";
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
import { isValidSignatureForStringBody } from "@/lib/utils";
import { ABIs, EventTopic } from "@/lib/constant";
import { Address } from "@/lib/types";
import { supabaseClient } from "@/lib/supabase";
import { handleEvents } from "@/lib/sync";

const signingKey = process.env.HARES_WEBHOOK_KEY!;

// {
//   block {
//     hash,
//     number,
//     timestamp,
//     # Replace placeholder contract address and topics to filter for logs
//     logs(filter: {topics: [["0x1b8d7365dae3cd94c61c4353507a591533f5b24569ad4792690b605287eb3399","0x53aedb61808d0c6b119592ca2d3e621372bd951061604f945887f28270c172f0","0xccd08e8d623ae7c390b796d06f88141f7f458b173dad570718c9a2716f3b2d7b","0x9d436d1d2465f3ad09e9f3badd64e111aa2ab084f06f755ee55dc8557c596f75"]]}) {
//       data,
//       topics,
//       index,
//       account {
//         address
//       },
//       transaction {
//         hash,
//         index,
//         from {
//           address
//         },
//         to {
//           address
//         },
//         value,
//         status,
//         createdContract {
//           address
//         }
//       }
//     }
//   }
// }

// const testData = { "webhookId": "wh_3u4jm2ky0uckwtjt", "id": "whevt_rogxub9aoqvdvnd2", "createdAt": "2024-12-16T06:44:58.382Z", "type": "GRAPHQL", "event": { "data": { "block": { "hash": "0x8af1ba03aca291a3c5a7e99683f24cc4239efc31e3e624c8a4085a4b542a908b", "number": 65542529, "timestamp": 1734331497, "logs": [{ "data": "0x0000000000000000000000000000000000000000008014ef8c63c9befe3ac4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001f7e7b38fbd0ea5fb30f200000000000000000000000000000000000000000001f7e7b38fbd0ea5fb30f200", "topics": ["0x1b8d7365dae3cd94c61c4353507a591533f5b24569ad4792690b605287eb3399", "0x0000000000000000000000000000000000000000000000000000000000000000", "0x000000000000000000000000003fb5d7d6ab042fa1a13ad8cd345c8843352371"], "index": 701, "account": { "address": "0x1c392906d0ff47f28e51219830a11fa9da7cccc7" }, "transaction": { "hash": "0xc6123dea2606805608088536316607768ea701c3f23070a709a1eb5d9525c396", "index": 241, "from": { "address": "0x003fb5d7d6ab042fa1a13ad8cd345c8843352371" }, "to": { "address": "0x1c392906d0ff47f28e51219830a11fa9da7cccc7" }, "value": "0xde0b6b3a7640000", "status": 1, "createdContract": null } }, { "data": "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000008014ef8c63c9befe3ac400000000000000000000000000000000000000000001f7e7b38fbd0ea5fb30f200000000000000000000000000000000000000000001f7e7b38fbd0ea5fb30f2000000000000000000000000000000000000000000000000000000000000000000", "topics": ["0x53aedb61808d0c6b119592ca2d3e621372bd951061604f945887f28270c172f0", "0x000000000000000000000000003fb5d7d6ab042fa1a13ad8cd345c8843352371", "0x000000000000000000000000003fb5d7d6ab042fa1a13ad8cd345c8843352371"], "index": 704, "account": { "address": "0x1c392906d0ff47f28e51219830a11fa9da7cccc7" }, "transaction": { "hash": "0xc6123dea2606805608088536316607768ea701c3f23070a709a1eb5d9525c396", "index": 241, "from": { "address": "0x003fb5d7d6ab042fa1a13ad8cd345c8843352371" }, "to": { "address": "0x1c392906d0ff47f28e51219830a11fa9da7cccc7" }, "value": "0xde0b6b3a7640000", "status": 1, "createdContract": null } }] } }, "sequenceNumber": "10000000012327999005", "network": "MATIC_MAINNET" } }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { body, headers } = req;
  console.log(JSON.stringify(body));
  const alchemySignature = headers["x-alchemy-signature"] as string;
  if (
    !isValidSignatureForStringBody(
      JSON.stringify(body),
      alchemySignature,
      signingKey
    )
  ) {
    res.status(401).json({
      code: 401,
    });
  }
  const { logs, number, timestamp } = body.event.data.block;
  const events = [];
  for (let i = 0; i < logs.length; i++) {
    if (Object.values(EventTopic).includes(logs[i].topics[0])) {
      const event = {
        address: logs[i].account.address,
        timeStamp: Number(timestamp),
        block: Number(number),
        hash: logs[i].transaction.hash,
        txIndex: logs[i].transaction.index,
        ...decodeEventLog({
          abi: ABIs.HaresAbi,
          data: logs[i].data as Address,
          topics: logs[i].topics as [],
        }),
      };
      events.push(event);
    }
  }

  const { error } = await supabaseClient.from("Event").upsert(
    events.map((e) => ({
      block: e.block,
      contractAddress: e.address.toLowerCase(),
      data: JSON.stringify(e.args),
      hash: e.hash,
      timestamp: e.timeStamp,
      topic: e.eventName,
      txIndex: e.txIndex,
    })),
    {
      onConflict: "topic,hash,data",
    }
  );

  if (error) {
    res.status(500).json({
      code: 500,
      message: error.message,
    });
  }

  await handleEvents();

  res.status(200).json({
    code: 0,
  });
}
