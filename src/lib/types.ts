import { StatusAPIResponse } from "@farcaster/auth-client";
import { Database } from "./supabase/supabase";

export type Address = `0x${string}`;
export type Token = Database["public"]["Tables"]["Token"]["Row"];

export type ContractEvent<T> = {
  address: string;
  timeStamp: number;
  block: number;
  hash: string;
  txIndex: number;
  eventName: string;
  args: T;
};

export interface IToken {
  address: string;
  createEvent: number;
  created_at: string;
  created_timestamp: number;
  creatorAddress: string;
  id: number;
  isGraduate: number;
  lpPositionId: string;
  marketCap: string;
  name: string;
  poolAddress: string;
  symbol: string;
  totalSupply: string;
  picture: string;
  desc: string;
  twitter: string;
  telegram: string;
  website: string;
}

export type Commitment = {
  value: BigInt | number;
  recipient: Address;
  refundRecipient: Address;
  minOrderSize: BigInt | number;
  sqrtPriceLimitX96: BigInt | number;
  expired: BigInt | number;
};

export type Trade = {
  id: number;
  from: Address;
  type: 0 | 1;
  recipient: Address;
  trueOrderSize: string;
  totalSupply: string;
  trueEth: string;
  isGraduate: boolean;
  timestamp: number;
};

export type TopHolder =
  Database["public"]["Functions"]["get_top_holders"]["Returns"][0];

export type FarcasterUserInfo = Pick<
  StatusAPIResponse,
  "fid" | "displayName" | "pfpUrl" | "username" | "message" | "signature"
>;
