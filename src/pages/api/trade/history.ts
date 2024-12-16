// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabaseClient } from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse,
) {

  const { address } = req.query

  const { data, error } = await supabaseClient.rpc('get_trade_history', {
    p_address: address as string
  })

  if (error) {
    res.json({
      code: 501,
      data: error.message
    });
  }
  
  res.json({
    code: 0,
    data
  });

}
