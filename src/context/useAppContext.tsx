import { useEffect, useState } from "react";
import constate from "constate";
import { request } from "@/lib/apis/request";

function useAppState() {
  const [ethPrice, setEthPrice] = useState(0);

  async function fetchEthPrice() {
    const res = await request("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD");
    console.log("eth price", res);
    setEthPrice(res?.data?.USD || 4000);
  }

  useEffect(() => {
    fetchEthPrice();
  }, []);

  return { ethPrice, fetchEthPrice };
}

export const [AppProvider, useAppContext] = constate(useAppState);
