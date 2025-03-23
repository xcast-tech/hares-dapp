// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { mainChain } from "@/lib/constant";
import { supabaseClient } from "@/lib/supabase";
import { chain, pick } from "lodash-es";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address } = req.query;
  const finalAddress = (address as string).toLowerCase();

  if (!address) {
    res.json({
      code: 400,
      data: "address is required",
    });
  }

  // to do: get holders
  const holders = 10;

  // to do: get liquidity
  const liquidity = 100123918239e18;

  // to do: get volume in 24h
  const volumeIn24h = 20000e18;

  res.json({
    code: 0,
    data: {
      holders,
      liquidity,
      volumeIn24h,
    },
  });
}
