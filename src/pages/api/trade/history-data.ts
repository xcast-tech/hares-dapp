import { supabaseClient } from "@/lib/supabase";
import { formatTimestampInSecond } from "@/lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address, from, to } = req.query;
  const numberFrom = formatTimestampInSecond(Number(from)) || 0;
  const numberTo =
    formatTimestampInSecond(Number(to)) || Math.floor(Date.now() / 1000);

  const { data, error: error1 } = await supabaseClient
    .from("Trade")
    .select(
      "id,from,type,recipient,trueOrderSize,totalSupply,trueEth,timestamp"
    )
    .eq("tokenAddress", address as string)
    .eq("isGraduate", 0)
    .gt("timestamp", numberFrom)
    .lte("timestamp", numberTo)
    .limit(1000)
    .order("timestamp", { ascending: true });

  const { data: graduateTrade, error: error2 } = await supabaseClient
    .from("Trade")
    .select(
      "id,from,type,recipient,trueOrderSize,totalSupply,trueEth,timestamp"
    )
    .eq("tokenAddress", address as string)
    .eq("isGraduate", 1)
    .limit(1000)
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
    data: {
      list,
      noData: list.length < 1000,
    },
  });
}
