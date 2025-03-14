// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
(BigInt.prototype as any).toJSON = function () { return this.toString() }

// const testData = {
//   "createdAt": "2024-12-14T19:06:11.578Z",
//   "event": {
//     "data": {
//       "block": {
//         "hash": "0x70eec01dbeaa7a11682ea1a5bdad4ac60047973b47c57ea09551ab22c12f73a7",
//         "logs": [
//           {
//             "account": {
//               "address": "0x623fdeeda888ad5d14d05033022ee94be8e850d6"
//             },
//             "data": "0x00000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000180000000000000000000000000003fb5d7d6ab042fa1a13ad8cd345c8843352371000000000000000000000000dd6a3990fc4e39281daa1593c2ca0aec9525a1300000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf1270000000000000000000000000c36442b4a4522e871399cd717abdd847ab11fe88000000000000000000000000e592427a0aece92de3edee1f18e0157c05861564000000000000000000000000329021c690a25217384be9cc5d7173cdfc3a18cb0000000000000000000000000000000000000000000000000000000000000fa000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003616161000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034141410000000000000000000000000000000000000000000000000000000000",
//             "index": 241,
//             "topics": [
//               "0x513260abbe38eb57e6cca56fe20a92384793c4d1192afba9e393d7c7b2ea5588",
//               "0x0000000000000000000000001c392906d0ff47f28e51219830a11fa9da7cccc7",
//               "0x000000000000000000000000003fb5d7d6ab042fa1a13ad8cd345c8843352371"
//             ],
//             "transaction": {
//               "createdContract": null,
//               "from": {
//                 "address": "0x003fb5d7d6ab042fa1a13ad8cd345c8843352371"
//               },
//               "hash": "0xf10f0320c9b2bca3cb3d15f9e3b0f72b39ae12971a5f4177e9edef7c1be114b5",
//               "index": 58,
//               "nonce": 90,
//               "status": 1,
//               "to": {
//                 "address": "0x623fdeeda888ad5d14d05033022ee94be8e850d6"
//               },
//               "value": "0x0"
//             }
//           }
//         ],
//         "number": 65483200,
//         "timestamp": 1734203169
//       }
//     },
//     "network": "MATIC_MAINNET",
//     "sequenceNumber": "10000000010895449001"
//   },
//   "id": "whevt_poq7pxzw2f5v4yq1",
//   "type": "GRAPHQL",
//   "webhookId": "wh_7bfat3c3cw5kwwkb"
// }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  const { body } = req
  console.log(body)
  console.log(body.event.data.block)
  
  res.status(200).json({ 
    code: 0,
  });
}
