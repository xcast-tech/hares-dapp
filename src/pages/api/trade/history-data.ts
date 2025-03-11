import { supabaseClient } from "@/lib/supabase";
import { formatTimestampInSecond } from "@/lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";

// 在平台交易的外盘数据会被索引
// trading view 只管拿数据渲染即可
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address, from, to, limit = 20 } = req.query;
  const numberFrom = formatTimestampInSecond(Number(from)) || 0;
  const numberTo =
    formatTimestampInSecond(Number(to)) || Math.floor(Date.now() / 1000);

  const { data, error: error1 } = await supabaseClient
    .from("Trade")
    .select(
      "id,from,type,recipient,trueOrderSize,totalSupply,trueEth,timestamp"
    )
    .eq("tokenAddress", address as string)
    // .eq("isGraduate", primary)
    .gt("timestamp", numberFrom)
    .lte("timestamp", numberTo)
    .limit(limit as number)
    .order("timestamp", { ascending: true });

  const { count } = await supabaseClient
    .from("Trade")
    .select("id", { count: "exact", head: true })
    .eq("tokenAddress", address as string);
  // .eq("isGraduate", primary);

  // const {
  //   data: graduateTrade,
  //   error: error2,
  //   count: count2 = 0,
  // } = await supabaseClient
  //   .from("Trade")
  //   .select(
  //     "id,from,type,recipient,trueOrderSize,totalSupply,trueEth,timestamp",
  //     { count: "exact" }
  //   )
  //   .eq("tokenAddress", address as string)
  //   .eq("isGraduate", 1)
  //   .limit(limit as number)
  //   .order("timestamp", { ascending: true })
  //   .maybeSingle();

  if (error1) {
    res.json({
      code: 501,
      data: [error1 && error1.message],
    });
  }

  // const list = data ? (graduateTrade ? [...data, graduateTrade] : data) : [];
  const list = data || [];

  res.json({
    code: 0,
    data: {
      list,
      noData: list.length < Number(limit),
      count: count,
      // count2: count2,
    },
  });
}
