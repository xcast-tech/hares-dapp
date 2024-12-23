// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabaseClient } from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address, from } = req.query;
  const numberFrom = Number(from);

  const { data, error: error1 } = await supabaseClient
    .from("Trade")
    .select(
      "id,from,type,recipient,trueOrderSize,totalSupply,trueEth,timestamp"
    )
    .eq("tokenAddress", address as string)
    .eq("isGraduate", 0)
    .gt("timestamp", from ? Math.floor(numberFrom / 1000) : 0)
    .order("timestamp", { ascending: true });

  const { data: graduateTrade, error: error2 } = await supabaseClient
    .from("Trade")
    .select(
      "id,from,type,recipient,trueOrderSize,totalSupply,trueEth,timestamp"
    )
    .eq("tokenAddress", address as string)
    .eq("isGraduate", 1)
    .order("timestamp", { ascending: true })
    .maybeSingle();

  if (error1 || error2) {
    res.json({
      code: 501,
      data: [error1 && error1.message, error2 && error2.message],
    });
  }

  const list = data ? (graduateTrade ? [...data, graduateTrade] : data) : [];

  res.json({
    code: 0,
    data: list,
  });
}
