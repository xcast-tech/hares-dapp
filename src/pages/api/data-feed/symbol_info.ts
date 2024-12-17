// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  const data = {
    symbol: ["Hares"],
    description: ["Hares"],
    "exchange-listed": "USDT",
    "exchange-traded": "USDT",
    minmovement: 1,
    minmovement2: 0,
    pricescale: [1, 1, 100],
    "has-dwm": true,
    "has-intraday": true,
    type: ["crypto"],
    ticker: ["HARES"],
    timezone: "America/New_York",
    "session-regular": "0900-1600",
 }

  res.json(data)
}
