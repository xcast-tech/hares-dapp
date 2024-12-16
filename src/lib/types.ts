export type Address = `0x${string}`;

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
  value: BigInt | number
  recipient: Address
  refundRecipient: Address
  minOrderSize: BigInt | number
  sqrtPriceLimitX96: BigInt | number
  expired: BigInt | number
}

export type Trade = {
  type: 0  | 1,
  recipient: Address,
  trueOrderSize: string,
  totalSupply: string,
  trueEth: string,
  timestamp: number,
}