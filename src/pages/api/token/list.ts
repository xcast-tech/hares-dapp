// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabaseClient } from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name = "" } = req.query as {
    name?: string;
    page: string;
    pageSize: string;
  };

  const page = +(req.query.page || 1);
  const pageSize = +(req.query.pageSize || 10);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const {
    data: tokenList,
    error: tokenListError,
    count: tokenCount,
  } = await supabaseClient.from("Token").select("*", { count: "exact" }).like("name", `%${name}%`).range(from, to).order("created_timestamp", { ascending: false });

  const addressList = (tokenList || []).map((item) => item.address);

  const { data: infoList, error: infoError } = await supabaseClient.from("TokenInfo").select("address,picture,twitter,telegram,website,desc").in('address', addressList);

  const error = tokenListError || infoError;

  if (error) {
    res.json({
      code: 501,
      data: error.message,
    });
  }

  const tokenInfoMap = (infoList || []).reduce((acc: Record<string, any>, token) => {
    acc[token.address] = token;
    return acc;
  }, {});

  const list = (tokenList || []).map((token) => ({
    ...token,
    ...tokenInfoMap[token.address],
  }));

  res.json({
    code: 0,
    data: {
      list,
      page,
      total: tokenCount,
    },
  });
}
