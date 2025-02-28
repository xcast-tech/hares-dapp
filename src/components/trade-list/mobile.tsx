import { mainChain, tokenSymbol } from "@/lib/constant";
import { Trade } from "@/lib/types";
import { cn, formatTokenBalance, maskAddress } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { formatEther } from "viem";
import styled from "@emotion/styled";
import styles from "./index.module.scss";
import TradesIcon from "~@/icons/trades.svg";

interface TradeListProps {
  list: Trade[];
  symbol: string;
  className?: string;
}

export const MobileTradeList = ({
  list,
  symbol,
  className,
}: TradeListProps) => {
  console.log("TradeList", { list, symbol });

  const columns = useMemo(() => {
    return [
      {
        key: "from",
        title: "Account",
      },
      {
        key: "type",
        title: "Type",
      },
      {
        key: "trueEth",
        title: tokenSymbol,
      },
      {
        key: "trueOrderSize",
        title: symbol,
      },
    ];
  }, [tokenSymbol, symbol]);

  const renderCell = (item: Trade, columnKey: keyof Trade) => {
    const cellValue = item[columnKey] ?? "-";

    switch (columnKey) {
      case "from":
        return (
          <StyledAccountPanel
            title={cellValue as string}
            href={`${mainChain.blockExplorers.default.url}/address/${cellValue}`}
            target="_blank"
          >
            {maskAddress(cellValue as string)}
          </StyledAccountPanel>
        );

      case "type":
        return (
          <StyledTypePanel mode={Number(cellValue)}>
            {cellValue === 0 ? "Buy" : "Sell"}
          </StyledTypePanel>
        );

      case "trueEth":
        return (
          <StyledTextPanel>
            {Number(formatEther(BigInt(cellValue), "wei")).toFixed(4)}
          </StyledTextPanel>
        );

      case "trueOrderSize":
        return (
          <StyledTextPanel>
            {formatTokenBalance(cellValue as string)}
          </StyledTextPanel>
        );

      default:
        return cellValue;
    }
  };

  return (
    <StyledTradeList>
      <StyledTradeListHeader>
        <TradesIcon />
        <span>Trades</span>
      </StyledTradeListHeader>
      <Table
        classNames={{
          base: styles["table-base"],
          table: styles["table"],
          thead: styles["table-header"],
          tbody: styles["table-body"],
        }}
        removeWrapper
        disableAnimation
        isHeaderSticky
        aria-label="Trade history"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn className={styles["table-column"]} key={column.key}>
              {column.title}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent="No transaction data.">
          {list.map((item) => {
            return (
              <TableRow className={styles["table-row"]} key={item.id}>
                {(columnKey) => (
                  <TableCell className={styles["table-cell"]}>
                    {renderCell(item, columnKey as keyof Trade)}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </StyledTradeList>
  );
};

const StyledTradeList = styled.div`
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: transparent;
`;

const StyledTradeListHeader = styled.h1`
  padding: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  color: #eaecef;

  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%;
  svg {
    width: 20px;
    height: 20px;
    color: #eaecef;
  }
`;

const StyledAccountPanel = styled.a`
  // text-decoration-line: underline;
  // text-decoration-style: solid;
  // text-decoration-skip-ink: none;
  // text-decoration-thickness: auto;
  // text-underline-offset: auto;
  // text-underline-position: from-font;
`;

const StyledTypePanel = styled.span<{ mode: number }>`
  color: ${({ mode }) => (mode === 0 ? "#05DD6B" : "#F31260")};
`;

const StyledTextPanel = styled.span``;
