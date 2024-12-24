import { mainChain } from "@/lib/constant";
import { TopHolder } from "@/lib/types";
import { formatTokenBalance, maskAddress } from "@/lib/utils";
import { Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import React from "react";

interface TopHoldersProps {
  list: TopHolder[];
  className?: string;
  devAddress?: string;
}

export const TopHolders = ({ list, className, devAddress = "" }: TopHoldersProps) => {
  const renderCell = (item: TopHolder, columnKey: keyof TopHolder) => {
    console.log(item, columnKey)
    const cellValue = item[columnKey] ?? "-";
    switch (columnKey) {
      case "address":
        return (
          <div className="flex items-center gap-2">
            <a
              className="text-white"
              title={cellValue as string}
              href={`${mainChain.blockExplorers.default.url}/address/${cellValue}`}
              target="_blank"
            >
              {maskAddress(cellValue as string)}
            </a>
            {devAddress.toLowerCase() === cellValue.toLowerCase() && (
              <Chip color="success" size="sm" className="h-4">
                DEV
              </Chip>
            )}
          </div>
        )

      case "balance":
        return <span className="text-white">{formatTokenBalance(cellValue)}</span>

      default:
        return cellValue;
    }
  };

  return (
    <div className="mt-8">
      <div className="font-bold mb-4">Top holders</div>
      <Table
        classNames={{
          base: "max-h-[500px] border border-[#262626] rounded-large",
          wrapper: 'p-0'
        }}
        isHeaderSticky
        aria-label="Trade history"
      >
        <TableHeader>
          <TableColumn key="address">Account</TableColumn>
          <TableColumn key="balance">Balance</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No transaction data.">
          {list.map((item) => {
            return (
              <TableRow key={item.address}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey as keyof TopHolder)}</TableCell>}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
