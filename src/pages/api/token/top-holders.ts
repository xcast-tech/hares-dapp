// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabaseClient } from "@/lib/supabase";
import { pick } from "lodash-es";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;
  const finalAddress = (address as string).toLowerCase();

  if (!address) {
    res.json({
      code: 400,
      data: "address is required",
    });
  }

  const topHolders = await supabaseClient.rpc("get_top_holders", {
    p_address: finalAddress,
    p_limit: 10,
  });

  res.json({
    code: 0,
    data: {
      list: topHolders?.data ?? [],
    },
  });
}
