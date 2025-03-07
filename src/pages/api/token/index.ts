// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabaseClient } from "@/lib/supabase";
import { pick } from "lodash-es";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address } = req.query;
  const finalAddress = (address as string).toLowerCase();

  if (!address) {
    res.json({
      code: 400,
      data: "address is required",
    });
  }

  const { data: token, error: tokenError } = await supabaseClient
    .from("Token")
    .select("*")
    .eq("address", finalAddress)
    .maybeSingle();

  if (tokenError) {
    res.json({
      code: 501,
      data: tokenError.message,
    });
  }
  // if (tokenInfoError) {
  //   res.json({
  //     code: 501,
  //     data: tokenInfoError.message,
  //   });
  // }

  res.json({
    code: 0,
    data: {
      ...token,
      // ...pick(tokenInfo, ["picture", "desc", "twitter", "telegram", "website"]),
    },
  });
}
