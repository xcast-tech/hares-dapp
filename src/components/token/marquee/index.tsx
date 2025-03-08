import React, {
  FC,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { LatelyTrade, Trade } from "@/lib/types";
import { MarqueeTokenCard } from "./card";
import SeamlessMarquee from "@/components/common/marquee";
import { getLatelyTradesApi } from "@/lib/apis";
import styled from "@emotion/styled";
import { parseMetadata } from "@/lib/utils";

export function removeDuplicateTrades(trades: LatelyTrade[]) {
  const seen = new Set();
  return trades.filter((trade) => {
    const duplicate = seen.has(trade.id);
    seen.add(trade.id);
    return !duplicate;
  });
}

type Token = {
  name: string;
  symbol: string;
  address: string;
  metadata: string;
};

export function removeDuplicateTokens(tokens: Token[]) {
  const seen = new Set();
  return tokens.filter((token) => {
    const duplicate = seen.has(token.address);
    seen.add(token.address);
    return !duplicate;
  });
}

interface TradesMarqueeProps {
  speed?: number;
}

export const TradesMarquee: FC<TradesMarqueeProps> = ({ speed = 3 }) => {
  const [trades, setTrades] = useState<LatelyTrade[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const lastIdRef = useRef(0);

  const fetchLatelyTrades = async () => {
    const res = await getLatelyTradesApi(lastIdRef.current);
    if (res.code === 0) {
      if (res.data.list.length > 0) {
        const _tokens = removeDuplicateTokens([
          ...res.data.tokenList,
          ...tokens,
        ]);
        setTrades((prev) =>
          removeDuplicateTrades([...res.data.list, ...prev])
            .slice(0, 10)
            .map((trade) => {
              const token = _tokens.find(
                (t) => t.address === trade.tokenAddress
              );
              const tokenMetadata = parseMetadata(token?.metadata || "");
              return {
                ...trade,
                token: {
                  name: token?.name || "",
                  ticker: token?.symbol || "",
                  address: token?.address as `0x${string}`,
                  metadata: tokenMetadata,
                },
              };
            })
        );
        setTokens(_tokens);
        lastIdRef.current = res.data.list[0].id;
      }
    }
  };

  useEffect(() => {
    fetchLatelyTrades();
    const intervalId = setInterval(fetchLatelyTrades, 10000);

    return () => clearInterval(intervalId);
  }, []);

  // Memoize extended slides to prevent unnecessary re-renders
  const extendedSlides = React.useMemo(() => [...trades, ...trades], [trades]);

  return (
    <StyledTokenMarquee visible={!!trades.length}>
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

const StyledTokenMarquee = styled.div<{ visible: boolean }>`
  display: ${({ visible }) => (visible ? "block" : "none")};
  width: 100%;
  height: 48px;
  background: rgba(255, 255, 255, 0.06);

  @media screen and (max-width: 1024px) {
    height: 40px;
  }
`;
