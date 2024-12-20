import { Trade } from "@/lib/types";
import { cn, formatNumber, formatThousandNumber, maskAddress } from "@/lib/utils";
import { getKeyValue, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import dayjs from "dayjs";
import React from "react";
import { formatEther, parseEther } from "viem";

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
        return maskAddress(cellValue as string);

      case "type":
        return cellValue === 0 ? "Buy" : "Sell";

      case "trueEth":
        return formatEther(BigInt(cellValue), "wei");

      case "trueOrderSize":
        return formatNumber(+cellValue / 1e18);

      case "timestamp":
        return dayjs().to(dayjs((cellValue as number) * 1000));

      default:
        return cellValue;
    }
  };

  return (
    <Table
      className="mt-6"
      classNames={{
        base: "max-h-[500px]",
      }}
      isHeaderSticky
    >
      <TableHeader>
        <TableColumn key="from">Account</TableColumn>
        <TableColumn key="type">Type</TableColumn>
        <TableColumn key="trueEth">ETH</TableColumn>
        <TableColumn key="trueOrderSize">{symbol}</TableColumn>
        <TableColumn key="timestamp">Date</TableColumn>
      </TableHeader>
      <TableBody>
        {list.map((item) => {
          return (
            <TableRow key={item.recipient} className={cn(item.type === 1 ? "text-red-500" : "text-green-500")}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey as keyof Trade)}</TableCell>}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
