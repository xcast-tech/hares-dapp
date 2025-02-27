import { Address, Commitment } from "../types";
import { request } from "./request";

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await request("/api/upload", {
    method: "POST",
    data: formData,
  });
  return res?.data;
};

export const tokenApi = async (data: { address: string }) => {
  const res = await request("/api/token", {
    method: "get",
    params: data,
  });
  return res?.data;
};

export interface TokenListApiData {
  sort?: string;
  search?: string;
  page: number;
  pageSize: number;
}

export const tokenListApi = async (data: TokenListApiData) => {
  const res = await request("/api/token/list", {
    method: "get",
    params: data,
  });
  return res?.data;
};

export const setUpApi = async (data: {
  address: string;
  name: string;
  ticker: string;
  picture: string;
  website: string;
  twitter: string;
  telegram: string;
  desc: string;
  mode?: "bonding-curve" | "launchpad";
}) => {
  const res = await request("/api/token/setup", {
    method: "post",
    data,
  });
  return res?.data;
};

export const getSignatureApi = async (
  commitment: Omit<Commitment, "recipient" | "refundRecipient">
): Promise<{
  code: number;
  data: {
    signature: string;
    recipient: `0x${string}`;
    refundRecipient: `0x${string}`;
  };
  message?: string;
}> => {
  const res = await request("/api/signature", {
    method: "post",
    data: commitment,
  });
  return res?.data;
};

export interface HistoryApiData {
  address: Address;
}

export const getHistoryApi = async (data: HistoryApiData) => {
  const res = await request("/api/trade/history", {
    method: "post",
    params: data,
  });
  return res?.data;
};

export interface HistoryListApiData {
  address: Address;
}

export const getHistoryListApi = async (data: HistoryListApiData) => {
  const res = await request("/api/trade/list", {
    method: "post",
    params: data,
  });
  return res?.data;
};

export interface HistoryListApiData {
  address: Address;
}

export const getTokenTopHoldersApi = async (data: HistoryListApiData) => {
  const res = await request("/api/token/top-holders", {
    method: "get",
    params: data,
  });
  return res?.data;
};

export const getLatelyTradesApi = async (lastId: number | string) => {
  const res = await request("/api/trade/lately", {
    method: "get",
    params: { lastId },
  });
  return res?.data;
};
