// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabaseClient } from "@/lib/supabase";
import { pick } from "lodash-es";
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
  } = await supabaseClient.from("Token").select("*", { count: "exact" }).ilike("name", `%${name}%`).range(from, to).order("id", { ascending: true });

  const addressList = (tokenList || []).map((item) => item.address);

  const { data: infoList, error: infoError } = await supabaseClient.from("TokenInfo").select("*").containedBy("", addressList);

  const error = tokenListError || infoError;

  if (error) {
    res.json({
      code: 501,
      data: error.message,
    });
  }

  const list = (tokenList || []).map((token) => {
    const target = (infoList || []).find((info) => info.address === token.address);

    return {
      ...token,
      ...pick(target, ["picture", "twitter", "telegram", "website", "desc"]),
    };
  });

  res.json({
    code: 0,
    data: {
      list,
      page,
      total: tokenCount,
    },
  });
}
