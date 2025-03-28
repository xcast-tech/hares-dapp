import { mainChain } from "@/lib/constant";
import { TopHolder } from "@/lib/types";
import { formatTokenBalance, maskAddress } from "@/lib/utils";
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import React from "react";
import styled from "@emotion/styled";
import TopHoldersIcon from "~@/icons/top-holders.svg";
import DevTextIcon from "~@/icons/dev-text.svg";
import styles from "./index.module.scss";
// import InfiniteScroll from "../common/infiniteScroll";

interface TopHoldersProps {
  list: TopHolder[];
  className?: string;
  devAddress?: string;
}

export const TopHolders = ({
  list,
  className,
  devAddress = "",
}: TopHoldersProps) => {
  const renderCell = (item: TopHolder, columnKey: keyof TopHolder) => {
    console.log(item, columnKey);
    const cellValue = item[columnKey] ?? "-";
    switch (columnKey) {
      case "address":
        return (
          <StyledAccountPanel
            title={cellValue as string}
            href={`${mainChain.blockExplorers.default.url}/address/${cellValue}`}
            target="_blank"
          >
            <span>{maskAddress(cellValue as string)}</span>
            {devAddress.toLowerCase() === cellValue.toLowerCase() && (
              <StyledAccountChip>
                <DevTextIcon />
              </StyledAccountChip>
            )}
          </StyledAccountPanel>
        );

      case "balance":
        return (
          <StyledTextPanel>{formatTokenBalance(cellValue)}</StyledTextPanel>
        );

      default:
        return <StyledTextPanel>{cellValue}</StyledTextPanel>;
    }
  };

  return (
    <StyledTopHolders>
      <StyledTopHoldersHeader>
        <TopHoldersIcon />
        <span>Top Holders</span>
      </StyledTopHoldersHeader>
      <StyledHoldersContainer>
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
          <TableHeader>
            <TableColumn key="address">Account</TableColumn>
            <TableColumn key="balance">Balance</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No transaction data.">
            {list.map((item) => {
              return (
                <TableRow className={styles["table-row"]} key={item.address}>
                  {(columnKey) => (
                    <TableCell className={styles["table-cell"]}>
                      {renderCell(item, columnKey as keyof TopHolder)}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </StyledHoldersContainer>
    </StyledTopHolders>
  );
};

const StyledTopHolders = styled.div`
  flex: 1;
  width: 100%;
  padding: 16px 0;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: transparent;
  overflow: hidden;
  @media screen and (max-width: 1024px) {
    border: none;
    border-radius: 0;
    padding-top: 0;
    padding-bottom: 24px;
  }
`;

const StyledTopHoldersHeader = styled.h1`
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

const StyledAccountPanel = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  > span {
    text-decoration-line: underline;
    text-decoration-style: solid;
    text-decoration-skip-ink: none;
    text-decoration-thickness: auto;
    text-underline-offset: auto;
    text-underline-position: from-font;
    @media screen and (max-width: 1024px) {
      text-decoration: none;
    }
  }
`;

const StyledAccountChip = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border-radius: 100px;
  background: #fcd535;
  color: #020308;
  height: 14px;
  > svg {
    width: 22px;
  }
`;

const StyledHoldersContainer = styled.div`
  width: 100%;
  @media screen and (min-width: 1024px) {
    flex: 1;
    overflow-y: scroll;
  }
`;

const StyledTypePanel = styled.span<{ mode: number }>`
  color: ${({ mode }) => (mode === 0 ? "#05DD6B" : "#F31260")};
`;

const StyledTextPanel = styled.span``;
