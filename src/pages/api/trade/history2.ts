// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabaseClient } from "@/lib/supabase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  const { from, to, resolution, address } = req.query
  const finalAddress = (address as string).toLowerCase()

  const { data, error } = await supabaseClient.rpc('get_trade_history2', {
    p_address: finalAddress,
    p_from: Number(from),
    p_to: Number(to)
  })

  if (error) {
    return res.json({
      code: 500,
      message: error.message
    })
  }

  const prevRes = await supabaseClient.from('Trade')
  .select()
  .eq('tokenAddress', finalAddress)
  .lt('timestamp', from)
  .order('id', { ascending: false })
  .limit(1)

  console.log(prevRes)

  res.json({ 
    code: 0,
    data: {
      list: data,
      prev: prevRes?.data?.[0]
    }
  });
}
