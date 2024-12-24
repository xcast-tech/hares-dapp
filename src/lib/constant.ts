import { polygon } from "viem/chains";

import BondingCurveAbi from "./abi/BondingCurve";
import HaresFactoryAbi from "./abi/HaresFactory";
import HaresAbi from "./abi/Hares";
import HaresValidatorAbi from "./abi/HaresValidator";
import UniswapV3Pool from "./abi/UniswapV3Pool";

export type Address = `0x${string}`;
export const mainChain = polygon;
export const contractAddress = {
  BondingCurve: "0x329021C690a25217384BE9Cc5D7173Cdfc3A18Cb" as Address,
  HaresValidator: "0xDd6A3990FC4E39281daa1593c2Ca0AEC9525a130" as Address,
  HaresFactory: "0x6Ba426C47e999CA678702cC73b91A43Bbc6deFE7" as Address,
  WETH: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270" as Address,
};

export const ABIs = {
  BondingCurveAbi,
  HaresFactoryAbi,
  HaresAbi,
  HaresValidatorAbi,
  UniswapV3Pool,
};

export const EventTopic: Record<string, string> = {
  HaresTokenCreated:
    "0xbfdfa7e444d771224fb47363ae2d9f73fff763bafcf0b63a2f38f75dc0fdafa8",
  HaresTokenTransfer:
    "0x1b8d7365dae3cd94c61c4353507a591533f5b24569ad4792690b605287eb3399",
  HaresTokenBuy:
    "0x53aedb61808d0c6b119592ca2d3e621372bd951061604f945887f28270c172f0",
  HaresTokenSell:
    "0xccd08e8d623ae7c390b796d06f88141f7f458b173dad570718c9a2716f3b2d7b",
  HaresMarketGraduated:
    "0x9d436d1d2465f3ad09e9f3badd64e111aa2ab084f06f755ee55dc8557c596f75",
};

export const BondingCurveConfig = {
  A: 750000000,
  B: 4000000000,
};
