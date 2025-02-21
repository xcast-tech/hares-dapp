// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { contractAddress, mainChain } from "@/lib/constant";
import { createAppClient, viemConnector } from "@farcaster/auth-client";
import type { NextApiRequest, NextApiResponse } from "next";
import { signTypedData } from "viem/accounts";
import { Address, Commitment } from "@/lib/types";
import { getDomain } from "@/lib/utils";
import { verifyToken } from "@/lib/jwt";
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.cookies["hares-token"] ?? "";
  try {
    const payload = await verifyToken(token);
    if (!payload) {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }
    const { address } = payload;
    const { value, minOrderSize, sqrtPriceLimitX96, expired } =
      req.body as Commitment & { fcMessage: string; fcSignature: string };

    // const appClient = createAppClient({
    //   relay: 'https://relay.farcaster.xyz',
    //   ethereum: viemConnector(),
    // });
    // const { data, success, fid } = await appClient.verifySignInMessage({
    //   nonce: process.env.NEXT_PUBLIC_FARCASTER_NONCE!,
    //   domain: getDomain(),
    //   message: fcMessage,
    //   signature: fcSignature as Address,
    // });

    // if (!success || !fid) {
    //   return res.json({
    //     code: 1,
    //     message: 'Invalid farcaster signature'
    //   })
    // }

    const signature = await signTypedData({
      privateKey: process.env.PRIVATE_KEY as Address,
      domain: {
        name: "BABValidator",
        version: "1",
        chainId: mainChain.id,
        verifyingContract: contractAddress.HaresValidator,
      },
      types: {
        Commitment: [
          { name: "value", type: "uint256" },
          { name: "recipient", type: "address" },
          { name: "refundRecipient", type: "address" },
          { name: "minOrderSize", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint256" },
          { name: "expired", type: "uint256" },
        ],
      },
      primaryType: "Commitment",
      message: {
        value: BigInt(value.toString()),
        recipient: address,
        refundRecipient: address,
        minOrderSize: BigInt(minOrderSize.toString()),
        sqrtPriceLimitX96: BigInt(sqrtPriceLimitX96.toString()),
        expired: BigInt(expired.toString()),
      },
    });

    return res.json({
      code: 0,
      data: {
        signature,
        recipient: address,
        refundRecipient: address,
      },
    });
  } catch (error) {
    return res.status(401).json({ code: 401, message: "Unauthorized" });
  }
}
