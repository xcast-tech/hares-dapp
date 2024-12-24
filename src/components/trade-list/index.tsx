import { mainChain } from "@/lib/constant";
import { Trade } from "@/lib/types";
import { cn, formatTokenBalance, maskAddress } from "@/lib/utils";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import dayjs from "dayjs";
import React from "react";
import { formatEther } from "viem";

interface TradeListProps {
  list: Trade[];
  symbol: string;
}

export const TradeList = ({ list, symbol }: TradeListProps) => {
  console.log("TradeList", { list, symbol });

  const renderCell = (item: Trade, columnKey: keyof Trade) => {
    const cellValue = item[columnKey] ?? "-";

    switch (columnKey) {
      case "from":
        return <a
          className="text-white"
          title={cellValue as string}
          href={`${mainChain.blockExplorers.default.url}/address/${cellValue}`}
          target="_blank"
        >{maskAddress(cellValue as string)}</a>

      case "type":
        return cellValue === 0 ? "Buy" : "Sell";

      case "trueEth":
        return <span className="text-white">{Number(formatEther(BigInt(cellValue), "wei")).toFixed(4)}</span>

      case "trueOrderSize":
        return <span className="text-white">{formatTokenBalance(cellValue as string)}</span>

      case "timestamp":
        return <span className="text-white">{dayjs().to(dayjs((cellValue as number) * 1000))}</span>

      default:
        return cellValue;
    }
  };

  return (
    <div className="mt-8">
      <div className="font-bold mb-4">Trades</div>
      <Table
        classNames={{
          base: "max-h-[500px] p-4 border border-[#262626] rounded-large",
          wrapper: 'p-0'
        }}
        isHeaderSticky
        aria-label="Trade history"
      >
        <TableHeader>
          <TableColumn key="from">Account</TableColumn>
          <TableColumn key="type">Type</TableColumn>
          <TableColumn key="trueEth">ETH</TableColumn>
          <TableColumn key="trueOrderSize">{symbol}</TableColumn>
          <TableColumn key="timestamp">Date</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No transaction data.">
          {list.map((item) => {
            return (
              <TableRow key={item.id} className={cn(item.type === 1 ? "text-[#F31260]" : "text-[#05DD6B]")}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey as keyof Trade)}</TableCell>}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
