import { supabaseClient } from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";

export const revalidate = 3600;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { lastId } = req.query;
  const { data, error: error1 } = await supabaseClient
    .from("Trade")
    .select(
      "id,from,type,tokenAddress(name,symbol,address,picture),recipient,trueOrderSize,totalSupply,trueEth,timestamp"
    )
    .eq("isGraduate", 0)
    .gt("id", lastId as string)
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
