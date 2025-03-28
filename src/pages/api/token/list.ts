// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { mainChain } from "@/lib/constant";
import { supabaseClient } from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    search = "",
    sort = "created_timestamp",
    direction = "desc",
  } = req.query as {
    search?: string;
    page: string;
    pageSize: string;
    sort: string;
    direction: string;
  };

  // const page = 1;
  const page = +(req.query.page || 1);
  const pageSize = +(req.query.pageSize || 10);
  const from = (page - 1) * pageSize;

  const { data: list = [], error: error1 } = await supabaseClient
    .from("Token")
    .select(
      "id,name,symbol,address,totalSupply,creatorAddress,isGraduate,tokenUri,metadata"
    )
    .eq('chain', mainChain.id)
    .or(
      `name.ilike.%${search}%,symbol.ilike.%${search}%,address.ilike.%${search}%`
    )
    .order(sort, { ascending: direction === "asc" })
    .range(from, from + pageSize - 1)
    .limit(pageSize);
  // const { data: list, error: error1 } = await supabaseClient.rpc(
  //   "get_token_list",
  //   {
  //     p_search: search,
  //     p_offset: from,
  //     p_limit: pageSize,
  //     p_sort: sort,
  //     p_direction: direction,
  //   }
  // );

  const { error: error2, count } = await supabaseClient
    .from("Token")
    .select("*", { count: "exact", head: true })
    .eq('chain', mainChain.id)
    .or(
      `name.ilike.%${search}%,symbol.ilike.%${search}%,address.ilike.%${search}%`
    );

  if (error1 || error2) {
    res.json({
      code: 501,
      message: JSON.stringify([error1?.message, error2?.message]),
    });
  }

  const _list = list || [];

  res.json({
    code: 0,
    data: {
      list: _list,
      page,
      total: count,
    },
  });
}
