import {
  convertTradesToBarData,
  convertTradeToBars,
  groupDatasInRanges,
} from "@/lib/utils";
import { Bar, ChartTable } from "./types";
import { Trade } from "@/lib/types";

export async function getChartTable({
  pairIndex,
  from,
  to,
  range,
  token,
  trades,
  nativeTokenPrice,
}: {
  pairIndex: number;
  from: number;
  to: number;
  range: number; // minutes
  token: string;
  trades: Trade[];
  nativeTokenPrice: number;
}): Promise<ChartTable> {
  try {
    console.log("GET bars", token, "from", from, "to", to, "range", range);
    // const res = await fetch(
    //   `/chart/${pairIndex}/${from}/${to}/${range}/${token}`
    // ).then((data) => data.json());

    console.log(
      "test GET bars",
      trades,
      "from",
      from,
      "to",
      to,
      "range",
      range,
      "token",
      token
    );

    const rangeInSecond = range * 60;

    const datasInRange = groupDatasInRanges(
      trades,
      rangeInSecond,
      from,
      to
    ).filter((_) => _.length > 0);

    console.log("--- datasInRange", datasInRange);

    const barTable = datasInRange.map((trades) => {
      return convertTradesToBarData(trades, nativeTokenPrice);
    });

    // console.log("tradingchart === getch data", res);
    return { table: barTable || [] } as ChartTable;
  } catch (err) {
    return Promise.reject(new Error("Failed at fetching charts"));
  }
}
