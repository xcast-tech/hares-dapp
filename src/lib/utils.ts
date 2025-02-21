import * as crypto from "crypto";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BondingCurveConfig } from "./constant";
import { Trade } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskAddress(address: string = "") {
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
}

export function getDomain() {
  if (process.env.LOCAL === "true") return "127.0.0.1:3001";
  return "www.hares.ai";
}

export const formatDecimalNumber = (
  num: number | string,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: minimumFractionDigits,
    maximumFractionDigits: maximumFractionDigits,
  }).format(Number(num));
};

export function formatNumber(value: string | number): string {
  let num: number;
  if (typeof value === "string") {
    num = parseFloat(value);
    if (isNaN(num)) return value;
  } else {
    num = value;
  }

  const units: [number, string][] = [
    [10 ** 12, "t"],
    [10 ** 9, "b"],
    [10 ** 6, "m"],
    [10 ** 3, "k"],
  ];

  for (const [divisor, suffix] of units) {
    if (num >= divisor) {
      const formatted = (num / divisor).toFixed(1);
      return formatted.endsWith(".0")
        ? formatted.slice(0, -2) + suffix
        : formatted + suffix;
    }
  }

  return num.toString();
}

export function formatTokenBalance(value: string | number): string {
  const num = +value / 1e18;

  if (num < 1e-3) {
    return "<0.001";
  }
  return formatNumber(num);
}

export function formatThousandNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toFixed(0);
}

export function isValidSignatureForStringBody(
  body: string, // must be raw string body, not json transformed version of the body
  signature: string, // your "X-Alchemy-Signature" from header
  signingKey: string // taken from dashboard for specific webhook
): boolean {
  const hmac = crypto.createHmac("sha256", signingKey); // Create a HMAC SHA256 hash using the signing key
  hmac.update(body, "utf8"); // Update the token hash with the request body using utf8
  const digest = hmac.digest("hex");
  return signature === digest;
}

export function isAndroid(): boolean {
  return (
    typeof navigator !== "undefined" && /android/i.test(navigator.userAgent)
  );
}

export function isSmallIOS(): boolean {
  return (
    typeof navigator !== "undefined" && /iPhone|iPod/.test(navigator.userAgent)
  );
}

export function isLargeIOS(): boolean {
  return (
    typeof navigator !== "undefined" &&
    (/iPad/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))
  );
}

export function isIOS(): boolean {
  return isSmallIOS() || isLargeIOS();
}

export function isMobile(): boolean {
  return isAndroid() || isIOS();
}

export function getEthBuyQuote(currentSupply: number, ethOrderSize: number) {
  if (!currentSupply || !ethOrderSize) {
    return BigInt(0);
  }
  const { A, B } = BondingCurveConfig;
  const expBx0 = Math.exp((B * currentSupply) / 1e18) * 1e18;
  const expBx1 = expBx0 + ((ethOrderSize * B) / A) * 1e18;
  const delta = ((Math.log(expBx1 / 1e18) / B) * 1e18 - currentSupply) * 1e18;
  const realSize = Math.min(8e26 - currentSupply * 1e18, delta);
  return BigInt(Math.floor(realSize));
}

export function getTokenSellQuote(currentSupply: number, tokenToSell: number) {
  const { A, B } = BondingCurveConfig;
  const expBx0 = Math.exp((B * currentSupply) / 1e18) * 1e18;
  const expBx1 = Math.exp((B * (currentSupply - tokenToSell)) / 1e18) * 1e18;
  const delta = ((expBx0 - expBx1) * A) / B;
  return BigInt(Math.floor(delta));
}

export function getSqrtPriceLimitX96(
  sqrtPriceLimitX96: number | bigint,
  slippage: number,
  isWETHToken0: boolean,
  isBuy: boolean
) {
  if ((isWETHToken0 && isBuy) || (!isWETHToken0 && !isBuy)) {
    return Number(sqrtPriceLimitX96) * (1 - slippage);
  }

  return Number(sqrtPriceLimitX96) * (1 + slippage);
}

export function getKChartData(
  history: Trade[],
  ethPrice: number,
  prev: number = 1
) {
  const kChartData = [];
  let currentPrice = 0;
  for (let i = 0; i < history.length; i++) {
    const item = history[i];
    const open =
      i === 0
        ? (Number(getTokenSellQuote(prev, 1)) / 1e18) * ethPrice
        : (Number(getTokenSellQuote(+history[i - 1].totalSupply / 1e18, 1)) /
            1e18) *
          ethPrice;

    const close =
      (Number(getTokenSellQuote(+item.totalSupply / 1e18, 1)) / 1e18) *
      ethPrice;

    kChartData.push({
      time: item.timestamp * 1000,
      open,
      close,
      low: Math.min(open, close),
      high: Math.max(open, close),
    });
    currentPrice = close;
  }
  return kChartData;
}

export function convertTradeToBars(
  trades: Trade[],
  from: number,
  to: number,
  resolution: number,
  ethPrice: number
) {
  if (trades.length === 0 || to < trades[0].timestamp) return null;
  const interval = resolution * 60;
  const bars = [];
  const groups: Record<number, Trade[]> = {};
  for (let i = 0; i < trades.length; i++) {
    const key =
      from + Math.floor((trades[i].timestamp - from) / interval) * interval;
    if (!groups[key]) {
      groups[key] = [trades[i]];
    } else {
      groups[key].push(trades[i]);
    }
  }
  for (let i = 0; i < Object.keys(groups).length; i++) {
    const timestamp = +Object.keys(groups)[i];
    if (timestamp >= from && timestamp < to) {
      const group = groups[timestamp];
      const initialSupply =
        Math.min(Number(group[0].totalSupply), 8e26) +
        (group[0].type === 0 ? -1 : 1) * Number(group[0].trueOrderSize);
      const open =
        (Number(getTokenSellQuote(initialSupply / 1e18, 1)) / 1e18) * ethPrice;
      const close =
        (Number(
          getTokenSellQuote(
            Math.min(+group[group.length - 1].totalSupply, 8e26) / 1e18,
            1
          )
        ) /
          1e18) *
        ethPrice;
      const low = Math.min(
        ...group.map(
          (t) =>
            (Number(
              getTokenSellQuote(Math.min(+t.totalSupply, 8e26) / 1e18, 1)
            ) /
              1e18) *
            ethPrice
        )
      );
      const high = Math.max(
        ...group.map(
          (t) =>
            (Number(
              getTokenSellQuote(Math.min(+t.totalSupply, 8e26) / 1e18, 1)
            ) /
              1e18) *
            ethPrice
        )
      );
      bars.push({
        time: timestamp * 1000,
        open,
        close,
        low,
        high,
        volume: Math.abs(
          group.reduce(
            (acc, t) => acc + (t.type === 0 ? 1 : -1) * Number(t.trueOrderSize),
            0
          ) / 1e18
        ),
      });
    }
  }
  return bars;
}

export function convertTradesToBar(trades: Trade[], ethPrice: number) {
  const initialSupply =
    Number(trades[0].totalSupply) +
    (trades[0].type === 0 ? -1 : 1) * Number(trades[0].trueOrderSize);
  const open =
    (Number(getTokenSellQuote(initialSupply / 1e18, 1)) / 1e18) * ethPrice;
  const close =
    (Number(
      getTokenSellQuote(+trades[trades.length - 1].totalSupply / 1e18, 1)
    ) /
      1e18) *
    ethPrice;
  const low = Math.min(
    ...trades.map(
      (t) =>
        (Number(getTokenSellQuote(+t.totalSupply / 1e18, 1)) / 1e18) * ethPrice
    )
  );
  const high = Math.max(
    ...trades.map(
      (t) =>
        (Number(getTokenSellQuote(+t.totalSupply / 1e18, 1)) / 1e18) * ethPrice
    )
  );
  return {
    time: trades[trades.length - 1].timestamp * 1000,
    open,
    close,
    low,
    high,
    volume: Math.abs(
      trades.reduce(
        (acc, t) => acc + (t.type === 0 ? 1 : -1) * Number(t.trueOrderSize),
        0
      ) / 1e18
    ),
  };
}

export function getHost() {
  if (process.env.LOCAL === "true") return "http://127.0.0.1:3001";
  return "https://hares.ai";
}

export const formatAddressString = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};
