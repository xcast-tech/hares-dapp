// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabaseClient } from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address, from } = req.query;
  const numberFrom = Number(from);

  const { data, error } = await supabaseClient
    .from("Trade")
    .select(
      "id,from,type,recipient,trueOrderSize,totalSupply,trueEth,timestamp"
    )
    .eq("tokenAddress", address as string)
    .gt("timestamp", from ? Math.floor(numberFrom / 1000) : 0)
    .order("timestamp", { ascending: true });

  if (error) {
    res.json({
      code: 501,
      data: error.message,
    });
  }

  res.json({
    code: 0,
    data,
  });
}
