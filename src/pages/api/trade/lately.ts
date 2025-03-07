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
      "id,from,type,tokenAddress,recipient,trueOrderSize,totalSupply,trueEth,timestamp"
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

  const list = data || [];
  const tokenAddressList = Array.from(
    new Set(list.map((item) => item.tokenAddress))
  ) as string[];

  const tokenList = (
    await Promise.all(
      tokenAddressList.map(async (address) => {
        if (!address) return null;
        const { data: token, error: error2 } = await supabaseClient
          .from("Token")
          .select("name,symbol,address,metadata")
          .eq("address", address)
          .single();

        if (error2) {
          return null;
        }

        return token;
      })
    )
  ).filter((i) => !!i);

  res.json({
    code: 0,
    data: {
      list,
      tokenList,
    },
  });
}
