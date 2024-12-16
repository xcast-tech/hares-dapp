import * as crypto from "crypto";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BondingCurveConfig } from "./constant";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskAddress(address: string = "") {
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
}

export const formatNumber = (num: number, digits = 3) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);
};

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
  return typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
}

export function isSmallIOS(): boolean {
  return typeof navigator !== "undefined" && /iPhone|iPod/.test(navigator.userAgent);
}

export function isLargeIOS(): boolean {
  return typeof navigator !== "undefined" && (/iPad/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
}

export function isIOS(): boolean {
  return isSmallIOS() || isLargeIOS();
}

export function isMobile(): boolean {
  return isAndroid() || isIOS();
}

export function getEthBuyQuote(currentSupply: number, ethOrderSize: number) {
  const { A, B } = BondingCurveConfig
  const expBx0 = Math.exp(B * currentSupply / 1e18) * 1e18
  const expBx1 = expBx0 + ethOrderSize * B / A * 1e18
  const delta = (Math.log(expBx1 / 1e18) / B * 1e18 - currentSupply) * 1e18
  return BigInt(Math.floor(delta))
}

export function getTokenSellQuote(currentSupply: number, tokenToSell: number) {
  const { A, B } = BondingCurveConfig
  const expBx0 = Math.exp(B * currentSupply / 1e18) * 1e18
  const expBx1 = Math.exp(B * (currentSupply - tokenToSell) / 1e18) * 1e18
  const delta = (expBx0 - expBx1) * A / B
  return BigInt(Math.floor(delta))
}

export function getSqrtPriceLimitX96(sqrtPriceLimitX96: number, slippage: number, isWETHToken0: boolean, isBuy: boolean) {
  if (isWETHToken0 && isBuy) {
    return Number(sqrtPriceLimitX96) * (1 - slippage)
  }
  return Number(sqrtPriceLimitX96) * (1 + slippage)
}