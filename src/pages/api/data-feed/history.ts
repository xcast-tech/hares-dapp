// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

//   const data = {
//     s: "ok",
//     t: [1386493512, 1386493572, 1386493632, 1386493692],
//     c: [42.1, 43.4, 44.3, 42.8],
//     o: [41.0, 42.9, 43.7, 44.5],
//     h: [43.0, 44.1, 44.8, 44.5],
//     l: [40.4, 42.1, 42.8, 42.3],
//     v: [12000, 18500, 24000, 45000]
//  }
const { symbol, resolution, from, to } = req.query;
const fromTs = parseInt(from as string, 10);
const toTs = parseInt(to as string, 10);
if (toTs < new Date('2024-12-1').getTime() / 1000) {
  return res.status(200).json({ s: "no_data" });
}

 // 简单构造：在 (from, to) 区间，每隔分辨率对应的秒数生成一根K线数据。
 // 注意分辨率转化，例如 resolution="60" 表示60分钟
 // 此处仅为演示，不对各分辨率进行精确处理，默认一分钟一根K线。
 const barIntervalSec = resolution === "D" ? 86400 : parseInt(resolution as string, 10)*60 || 60;
 let current = Math.max(fromTs, new Date('2024-12-1').getTime() / 1000);
 
 const t = [];
 const o = [];
 const h = [];
 const l = [];
 const c = [];
 const v = [];

 while (current < toTs) {
   const open = Math.random() * 10000 + 1000;
   const close = open + (Math.random() - 0.5) * 200;
   const high = Math.max(open, close) + Math.random()*101;
   const low = Math.min(open, close) - Math.random()*101;
   const volume = Math.random() * 1000;

   t.push(current);
   o.push(parseFloat(open.toFixed(2)));
   h.push(parseFloat(high.toFixed(2)));
   l.push(parseFloat(low.toFixed(2)));
   c.push(parseFloat(close.toFixed(2)));
   v.push(parseFloat(volume.toFixed(2)));

   current += barIntervalSec;
 }

 if (t.length === 0) {
   return res.status(200).json({ s: "no_data" });
 }

 return res.status(200).json({
   s: "ok",
   t, o, h, l, c, v
 });

}
