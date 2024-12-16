// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Address, contractAddress, mainChain } from "@/lib/constant";
import { Commitment } from "@/lib/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { signTypedData, toAccount } from 'viem/accounts'
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { value, recipient, refundRecipient, minOrderSize, sqrtPriceLimitX96, expired } = req.body as Commitment
  const signature = await signTypedData({
    privateKey: process.env.PRIVATE_KEY as Address,
    domain: {
      name: 'HaresValidator',
      version: '1',
      chainId: mainChain.id,
      verifyingContract: contractAddress.HaresValidator
    },
    types: {
      Commitment: [
        { name: 'value', type: 'uint256' },
        { name: 'recipient', type: 'address' },
        { name: 'refundRecipient', type: 'address' },
        { name: 'minOrderSize', type: 'uint256' },
        { name: 'sqrtPriceLimitX96', type: 'uint256' },
        { name: 'expired', type: 'uint256' }
      ]
    },
    primaryType: 'Commitment',
    message: {
      value: BigInt(value.toString()),
      recipient,
      refundRecipient,
      minOrderSize: BigInt(minOrderSize.toString()),
      sqrtPriceLimitX96: BigInt(sqrtPriceLimitX96.toString()),
      expired: BigInt(expired.toString()),
    }
  })
  
  res.json({
    code: 0,
    data: signature
  });

}
