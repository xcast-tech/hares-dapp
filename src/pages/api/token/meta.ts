// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabaseClient } from "@/lib/supabase";
import { getTokenSellQuote } from "@/lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;
  const finalAddress = (address as string).toLowerCase();

  if (!address) {
    return res.json({
      code: 400,
      data: "address is required",
    });
  }

  const tokenRes = await supabaseClient.from("Token").select("*").eq("address", finalAddress).maybeSingle();

  if (tokenRes.error) {
    return res.json({
      code: 500,
      data: tokenRes.error.message,
    });
  }

  if (!tokenRes.data?.isGraduate) {
    const token = tokenRes.data;
    const metaRes = await supabaseClient.rpc("get_meta", {
      p_address: finalAddress,
      p_fromtime: Math.floor(Date.now() / 1000) - 3600 * 24,
    });

    if (metaRes.error) {
      return res.json({
        code: 500,
        data: metaRes.error.message,
      });
    }
    const liquidity = getTokenSellQuote(Number(token?.totalSupply ?? 0) / 1e18, Number(token?.totalSupply ?? 0) / 1e18);
    return res.json({
      code: 0,
      data: {
        holders: metaRes.data[0].holders,
        liquidity: liquidity.toString(),
        volumeIn24h: BigInt(metaRes.data[0].volumn || 0).toString(),
      },
    });
  }

  const aveRes = await fetch(`https://dev.ave-api.com/v2/tokens/${finalAddress}-bsc`, {
    method: "GET",
    headers: {
      "X-API-KEY": "eM7WQxveDbr7XWDvEaJJabgurkSHxHJL2TzcvsYGenwhfG52yNLMGzk2yZ7x",
    },
  }).then((res) => res.json());

  if (aveRes.msg !== "SUCCESS") {
    return res.json({
      code: 500,
      data: aveRes,
    });
  }

  const { holders, tvl, tx_volume_u_24h } = aveRes.data.token;

  res.json({
    code: 0,
    data: {
      holders,
      liquidity: tvl,
      volumeIn24h: tx_volume_u_24h,
    },
  });
}
