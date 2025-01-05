import { base } from "viem/chains";

import BondingCurveAbi from "./abi/BondingCurve";
import HaresFactoryAbi from "./abi/HaresFactory";
import HaresAbi from "./abi/Hares";
import HaresValidatorAbi from "./abi/HaresValidator";
import UniswapV3Pool from "./abi/UniswapV3Pool";
import { Address } from "./types";

export const mainChain = base;
export const contractAddress = {
  BondingCurve: "0x124ce4caBd15A5D359a69Ca5902d428148E8527B" as Address,
  HaresValidator: "0xF84AD05784192d7a40a1D098E8A4Ad86e55D4850" as Address,
  HaresFactory: "0x2B0142aF95A06023A6A80c6B0667a21A4CFd0320" as Address,
  WETH: "0x4200000000000000000000000000000000000006" as Address,
};

export const ABIs = {
  BondingCurveAbi,
  HaresFactoryAbi,
  HaresAbi,
  HaresValidatorAbi,
  UniswapV3Pool,
};

export const EventTopic: Record<string, string> = {
  HaresTokenCreated: "0xbfdfa7e444d771224fb47363ae2d9f73fff763bafcf0b63a2f38f75dc0fdafa8",
  HaresTokenTransfer: "0x1b8d7365dae3cd94c61c4353507a591533f5b24569ad4792690b605287eb3399",
  HaresTokenBuy: "0x53aedb61808d0c6b119592ca2d3e621372bd951061604f945887f28270c172f0",
  HaresTokenSell: "0xccd08e8d623ae7c390b796d06f88141f7f458b173dad570718c9a2716f3b2d7b",
  HaresMarketGraduated: "0x9d436d1d2465f3ad09e9f3badd64e111aa2ab084f06f755ee55dc8557c596f75",
};

export const BondingCurveConfig = {
  A: 750000000,
  B: 4000000000,
};

export const HaresAiWarpcastLink = "https://warpcast.com/hares-ai";

export const HaresAiTwitterLink = "/";
