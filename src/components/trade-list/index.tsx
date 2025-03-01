import { mainChain, tokenSymbol } from "@/lib/constant";
import { Trade } from "@/lib/types";
import {
  cn,
  formatDecimalNumber,
  formatTokenBalance,
  maskAddress,
} from "@/lib/utils";
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

export const TradeList = ({ list, symbol, className }: TradeListProps) => {
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
      {
        key: "timestamp",
        title: "Date",
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
            {formatDecimalNumber(formatEther(BigInt(cellValue)))}
          </StyledTextPanel>
        );

      case "trueOrderSize":
        return (
          <StyledTextPanel>
            {formatTokenBalance(cellValue as string)}
          </StyledTextPanel>
        );

      case "timestamp":
        return (
          <StyledTextPanel>
            {dayjs().to(dayjs((cellValue as number) * 1000))}
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
      <StyledTradeListTable>
        <Table
          classNames={{
            base: styles["table-base"],
            table: styles["table"],
            thead: styles["table-header"],
            tbody: styles["table-body"],
            th: styles["table-column"],
            tr: styles["table-row"],
            td: styles["table-cell"],
          }}
          removeWrapper
          disableAnimation
          isHeaderSticky
          aria-label="Trade history"
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.title}</TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent="No transaction data.">
            {list.map((item) => {
              return (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>
                      {renderCell(item, columnKey as keyof Trade)}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </StyledTradeListTable>
    </StyledTradeList>
  );
};

const StyledTradeList = styled.div`
  padding: 14px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: transparent;
  @media screen and (max-width: 1024px) {
    padding: 16px 0;
  }
`;

const StyledTradeListHeader = styled.h1`
  padding: 0 16px;
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

  @media screen and (max-width: 1024px) {
    padding: 0;
  }
`;

const StyledTradeListTable = styled.div`
  width: 100%;
  @media screen and (max-width: 1024px) {
    overflow-x: auto;
  }
`;

const StyledAccountPanel = styled.a`
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-skip-ink: none;
  text-decoration-thickness: auto;
  text-underline-offset: auto;
  text-underline-position: from-font;

  @media screen and (max-width: 1024px) {
    text-decoration: none;
  }
`;

const StyledTypePanel = styled.span<{ mode: number }>`
  color: ${({ mode }) => (mode === 0 ? "#05DD6B" : "#F31260")};
`;

const StyledTextPanel = styled.span``;
