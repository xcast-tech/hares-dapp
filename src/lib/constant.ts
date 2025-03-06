import { base, bsc, sepolia, polygon } from "viem/chains";

import BondingCurveAbi from "./abi/BondingCurve";
import HaresFactoryAbi from "./abi/HaresFactory";
import HaresAbi from "./abi/Hares";
import HaresValidatorAbi from "./abi/HaresValidator";
import UniswapV3Pool from "./abi/UniswapV3Pool";
import { Address } from "./types";
import { parseEther, zeroAddress } from "viem";

export const mainChain = sepolia;
export const SCAN_API_KEY = process.env[`SCAN_API_KEY_${mainChain.id}`];

export const tokenSymbol = mainChain.nativeCurrency.symbol;
export const contractAddress = {
  BondingCurve: "0xfF795E4B82c97e41e1eFA40239fE1A13763542CD" as Address,
  BABTValidatorAddress: zeroAddress,
  HaresFactory: "0x1684E74EDA3e23e1D450B25BE82A49BD8B3401a1" as Address,
  WETH: "0x7b79995e5f793a07bc00c21412e50ecae098e7f9" as Address,
};

export const ABIs = {
  BondingCurveAbi,
  HaresFactoryAbi,
  HaresAbi,
  HaresValidatorAbi,
  UniswapV3Pool,
};

export const EventTopic: Record<string, string> = {
  HaresTokenCreated: "0x4d70dd94558eb7f121037c7e1f34da1e1a7a11ea457ab927bd55e7810870541d",
  HaresTokenTransfer: "0x4094f1cf9c22c433db0b220c48bc94f47e2c93296f56a8b9fc33a69ddab53882",
  HaresTokenBuy: "0x03d6fa0abbf51ed965299837d77d70b68ac82c0bd8e2d104c056d3d135abc767",
  HaresTokenSell: "0x0356859bb57a8e38f4212c48a3dd4c5726c382ff19ad19b90a0fdd80a5e35bda",
  HaresMarketGraduated: "0xb1eedf734432e24ee0d06ba360e9f293c6135315787e97012415419e8fb95645",
};

export const BondingCurveConfig = {
  A: 883000000,
  B: 6100000000,
};

export const HaresAiWarpcastLink = "https://warpcast.com/hares-ai";

export const HaresAiTwitterLink = "/";

export const graduatedPool = parseEther("18.91"); // 18.91
export const graduatedPoolConstant = "19.11"; // 18.91 / 0.99

export const primaryMarketSupply = parseEther((8e8).toString()); // 800,000,000

export const loginSignText = "Sign in to bab.fun. Discover the most authentic token launchpad, powered by Binance BAB Token. This action only verifies your wallet ownership and will not incur any gas fees.";
