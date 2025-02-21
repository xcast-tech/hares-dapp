import { base, baseSepolia, polygon } from "viem/chains";

import BondingCurveAbi from "./abi/BondingCurve";
import HaresFactoryAbi from "./abi/HaresFactory";
import HaresAbi from "./abi/Hares";
import HaresValidatorAbi from "./abi/HaresValidator";
import UniswapV3Pool from "./abi/UniswapV3Pool";
import { Address } from "./types";
import { parseEther } from "viem";

export const mainChain = polygon;
export const contractAddress = {
  BondingCurve: "0x316Ca81870b86c5Ce35D4Afe5bA512ad2d3783b7" as Address,
  HaresValidator: "0x91aEE2F51197053836938618805f28A77d508c61" as Address,
  HaresFactory: "0xAB45f737A59Cb935fc189FcfF7a77af1e1947141" as Address,
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
    "0xfd346d5c02b2e0002045e14eafc72ee3c58ee7dc23ae96b1a130c9703e500bc4",
  HaresTokenTransfer:
    "0x4094f1cf9c22c433db0b220c48bc94f47e2c93296f56a8b9fc33a69ddab53882",
  HaresTokenBuy:
    "0x03d6fa0abbf51ed965299837d77d70b68ac82c0bd8e2d104c056d3d135abc767",
  HaresTokenSell:
    "0x0356859bb57a8e38f4212c48a3dd4c5726c382ff19ad19b90a0fdd80a5e35bda",
  HaresMarketGraduated:
    "0xb1eedf734432e24ee0d06ba360e9f293c6135315787e97012415419e8fb95645",
};

export const BondingCurveConfig = {
  A: 883000000,
  B: 6100000000,
};

export const HaresAiWarpcastLink = "https://warpcast.com/hares-ai";

export const HaresAiTwitterLink = "/";

export const graduatedPool = parseEther("18.91"); // 18.91

export const primaryMarketSupply = parseEther((8e8).toString()); // 800,000,000

export const loginSignText = "Sign to continue";
