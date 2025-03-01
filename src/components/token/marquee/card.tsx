import { formatDecimalNumber, maskAddress } from "@/lib/utils";
import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LatelyTrade } from "@/lib/types";
import styled from "@emotion/styled";
import Avatar from "boring-avatars";
import { formatEther } from "viem";

interface TradeProps {
  trade: LatelyTrade;
}

export function MarqueeTokenCard({ trade }: TradeProps) {
  const isSell = trade.type === 1;
  const amount = formatDecimalNumber(formatEther(BigInt(trade.trueEth)));
  return (
    <>
      <StyledLink href={`/token/${trade.tokenAddress.address}`} target="_blank">
        <StyledMarqueeTokenCard>
          <Avatar className="wallet-avatar" name={trade.from} variant="beam" />
          <StyledTokenAddress>{maskAddress(trade.from)}</StyledTokenAddress>
          <StyledTokenAction sell={isSell}>
            {isSell ? "Sell" : "Buy"}
          </StyledTokenAction>
          <StyledBNBReceived>
            {amount} {trade.tokenAddress.symbol} of
          </StyledBNBReceived>
          <StyledTokenPic src={trade.tokenAddress.picture} alt="" />
          <StyledTokenName>
            {trade.tokenAddress.name}({trade.tokenAddress.symbol})
          </StyledTokenName>
        </StyledMarqueeTokenCard>
      </StyledLink>
    </>
  );
}

const StyledLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-left: 1px solid rgba(255, 255, 255, 0.12);

  @media screen and (max-width: 1024px) {
    border-left: 0.5px solid rgba(255, 255, 255, 0.12);
  }
`;

const StyledMarqueeTokenCard = styled.div`
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  .wallet-avatar {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const StyledTokenAddress = styled.span`
  color: #eaecef;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  opacity: 0.5;

  @media screen and (max-width: 1024px) {
    font-size: 11px;
  }
`;

const StyledTokenAction = styled.span<{ sell: boolean }>`
  color: ${({ sell }) => (sell ? "#f31260" : "#05DD6B")};
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  @media screen and (max-width: 1024px) {
    font-size: 11px;
  }
`;

const StyledBNBReceived = styled.span`
  color: #eaecef;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  opacity: 0.5;
`;

const StyledTokenPic = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 6.667px;
  object-fit: cover;
  flex-shrink: 0;
`;

const StyledTokenName = styled.h3`
  color: #eaecef;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  opacity: 0.8;
  @media screen and (max-width: 1024px) {
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
  }
`;
