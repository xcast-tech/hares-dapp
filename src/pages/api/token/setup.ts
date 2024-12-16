// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabaseClient } from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse,
) {

  const { address, picture, website, twitter, telegram, desc } = req.body

  const { error } = await supabaseClient.from('TokenInfo').upsert({
    address,
    picture,
    website,
    twitter,
    telegram,
    desc
  })

  if (error) {
    res.json({
      code: 501,
      data: error
    });
  }
  
  res.json({
    code: 0,
    data: 'ok'
  });

}
