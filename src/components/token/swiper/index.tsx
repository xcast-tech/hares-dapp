import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { LatelyTrade } from "@/lib/types";
import styled from "@emotion/styled";
import { getLatelyTradesApi } from "@/lib/apis";
import { SwiperContainer } from "./container";

export function removeDuplicateTrades(trades: LatelyTrade[]) {
  const seen = new Set();
  return trades.filter((trade) => {
    const duplicate = seen.has(trade.id);
    seen.add(trade.id);
    return !duplicate;
  });
}
interface TradesSwiperProps {}

export const TradesSwiper: FC<TradesSwiperProps> = ({}) => {
  const [trades, setTrades] = useState<LatelyTrade[]>([]);
  const lastIdRef = useRef(0);

  const fetchLatelyTrades = async () => {
    const res = await getLatelyTradesApi(lastIdRef.current);
    if (res.code === 0) {
      if (res.data.list.length > 0) {
        setTrades((prev) => removeDuplicateTrades([...res.data.list, ...prev]));
        lastIdRef.current = res.data.list[0].id;
      }
    }
  };

  useEffect(() => {
    fetchLatelyTrades();
    const intervalId = setInterval(fetchLatelyTrades, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <StyledTradesSwiper>
      <StyledTradesSwiperContainer>
        <SwiperContainer slides={trades} />
      </StyledTradesSwiperContainer>
    </StyledTradesSwiper>
  );
};

const StyledTradesSwiper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  overflow: hidden;
  pointer-events: none;
`;

const StyledTradesSwiperContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  height: 48px;
  background: rgba(255, 255, 255, 0.06);
`;
