import React, { FC, useEffect, useRef, useState, useCallback } from "react";
import { LatelyTrade } from "@/lib/types";
import { MarqueeTokenCard } from "./card";
import SeamlessMarquee from "@/components/common/marquee";
import { getLatelyTradesApi } from "@/lib/apis";
import styled from "@emotion/styled";

export function removeDuplicateTrades(trades: LatelyTrade[]) {
  const seen = new Set();
  return trades.filter((trade) => {
    const duplicate = seen.has(trade.id);
    seen.add(trade.id);
    return !duplicate;
  });
}

interface TradesMarqueeProps {
  speed?: number;
}

export const TradesMarquee: FC<TradesMarqueeProps> = ({ speed = 3 }) => {
  const [trades, setTrades] = useState<LatelyTrade[]>([]);
  const lastIdRef = useRef(0);

  const fetchLatelyTrades = async () => {
    const res = await getLatelyTradesApi(lastIdRef.current);
    if (res.code === 0) {
      if (res.data.list.length > 0) {
        setTrades((prev) =>
          removeDuplicateTrades([...res.data.list, ...prev]).slice(0, 10)
        );
        lastIdRef.current = res.data.list[0].id;
      }
    }
  };

  useEffect(() => {
    fetchLatelyTrades();
    const intervalId = setInterval(fetchLatelyTrades, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Memoize extended slides to prevent unnecessary re-renders
  const extendedSlides = React.useMemo(() => [...trades, ...trades], [trades]);

  return (
    <StyledTokenMarquee>
      <SeamlessMarquee speed={extendedSlides.length * speed}>
        <>
          {extendedSlides.map((slide, index) => (
            <div key={`${slide.id}-${index}`} className="flex-shrink-0 h-full">
              <MarqueeTokenCard trade={slide} />
            </div>
          ))}
        </>
      </SeamlessMarquee>
    </StyledTokenMarquee>
  );
};

const StyledTokenMarquee = styled.div`
  width: 100%;
  height: 48px;
  background: rgba(255, 255, 255, 0.06);
`;
