import { supabaseClient } from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { data, error: error1 } = await supabaseClient
    .from("Trade")
    .select(
      "id,from,type,tokenAddress(name,symbol,picture),recipient,trueOrderSize,totalSupply,trueEth,timestamp"
    )
    .eq("isGraduate", 0)
    .limit(10)
    .order("timestamp", { ascending: false });

  if (error1) {
    res.json({
      code: 501,
      data: [error1 && error1.message],
    });
  }

  const list = data;

  res.json({
    code: 0,
    data: {
      list,
    },
  });
}
