import { Address } from "viem";
import { setEventHandled } from "./model";
import { supabaseClient } from "./supabase";
import { Database } from "./supabase/supabase";
import { extractMetadata, getTokenCreateEvent, getTokenEvents, getTokenTotalSupply } from "./third-party";
import { chain } from "lodash-es";
import { mainChain } from "./constant";

export function debugLog(msg: any, level: "info" | "warn" | "error" = "info") {
  const logLevel = process.env.LOG_LEVEL ? JSON.parse(process.env.LOG_LEVEL!) : ["info", "warn", "error"];
  if (logLevel.includes(level)) {
    console.log(`[${new Date().toISOString()}][${level}] ${msg}`);
    const date = new Date();
    const fileName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.log`;
    if (process.env.LOG_TO_FILE === "true") {
      const fs = require("fs/promises");
      fs.appendFile(`./log/${fileName}`, `[${new Date().toISOString()}] ${msg}\n`);
    }
  }
}

export async function syncEvents(from: number, to: number) {
  debugLog(`Fetching events from ${from} to ${to}`);
  const allEvents = [await getTokenCreateEvent(from, to)];
  allEvents.push(
    ...(await Promise.all([
      // getTokenCreateEvent(from, to),
      getTokenEvents(from, to, "HaresTokenTransfer"),
      getTokenEvents(from, to, "HaresTokenBuy"),
      getTokenEvents(from, to, "HaresTokenSell"),
      getTokenEvents(from, to, "HaresMarketGraduated"),
    ]))
  );

  const getOrder = (e: any) => e.block * 100000 + e.txIndex;
  const events = allEvents.flat().sort((a, b) => getOrder(a) - getOrder(b));

  debugLog(`${events.length} events found`);

  if (events.length === 0) {
    return 0;
  }

  const { error } = await supabaseClient.from("Event").upsert(
    events.map((e) => ({
      block: e.block,
      contractAddress: e.address.toLowerCase(),
      data: JSON.stringify(e.args),
      hash: e.hash,
      timestamp: e.timeStamp,
      topic: e.eventName,
      txIndex: e.txIndex,
      chain: mainChain.id
    })),
    {
      onConflict: "topic,hash,data,chain",
    }
  );

  if (error) {
    throw error.message;
  }

  return events.length;
}

export async function handleEvents() {
  const { data: events, error } = await supabaseClient.from("Event").select("*").eq("status", 0).order("id", { ascending: true });
  if (error) {
    throw error.message;
  }
  const functionMap: Record<string, Function> = {
    BABTokenCreated: handleTokenCreated,
    BABTokenTransfer: handleTokenTransfer,
    BABTokenBuy: handleTokenBuy,
    BABTokenSell: handleTokenSell,
    BABMarketGraduated: handleMarketGraduated,
  };
  for (let i = 0; i < events.length; i++) {
    const { topic } = events[i];
    const handler = topic && functionMap[topic];
    if (handler) {
      await handler(events[i]);
    }
  }
  return events.length;
}

async function handleTokenCreated(row: Database["public"]["Tables"]["Event"]["Row"]) {
  debugLog(`Handling TokenCreated event ${row.id}`);
  const args = JSON.parse(row.data ?? "") as {
    tokenAddress: string;
    creator: string;
    name: string;
    symbol: string;
    tokenURI: string;
  };
  const { tokenAddress, creator, name, symbol, tokenURI } = args;
  const totalSupply = await getTokenTotalSupply(tokenAddress as Address);
  const metadata = await extractMetadata(tokenURI);
  const { error } = await supabaseClient.from("Token").upsert(
    {
      address: tokenAddress.toLowerCase(),
      createEvent: row.id,
      creatorAddress: creator.toLowerCase(),
      name,
      symbol,
      tokenUri: tokenURI,
      totalSupply,
      metadata,
      created_timestamp: row.timestamp,
      updated_timestamp: row.timestamp,
      chain: row.chain
    },
    {
      onConflict: "createEvent",
    }
  );
  if (error) {
    throw error.message;
  }
  debugLog(`Token ${name} - ${symbol} synced`);
  await setEventHandled(row.id);
}

async function handleTokenTransfer(row: Database["public"]["Tables"]["Event"]["Row"]) {
  debugLog(`Handling TokenTransfer event ${row.id}`);

  const args = JSON.parse(row.data ?? "") as {
    from: string;
    to: string;
    amount: string;
    fromTokenBalance: string;
    toTokenBalance: string;
    totalSupply: string;
  };
  const { error } = await supabaseClient.from("Transfer").upsert(
    {
      event: row.id,
      tokenAddress: row.contractAddress.toLowerCase(),
      from: args.from.toLowerCase(),
      to: args.to.toLowerCase(),
      amount: args.amount,
      fromTokenBalance: args.fromTokenBalance,
      totalSupply: args.totalSupply,
      toTokenBalance: args.toTokenBalance,
      timestamp: row.timestamp,
      txIndex: row.txIndex,
      chain: row.chain
    },
    {
      onConflict: "event",
    }
  );
  if (error) {
    throw error.message;
  }
  debugLog(`TokenTransfer event ${row.id} synced`);
  await setEventHandled(row.id);
}

async function handleTokenBuy(row: Database["public"]["Tables"]["Event"]["Row"]) {
  debugLog(`Handling TokenBuy event ${row.id}`);

  const args = JSON.parse(row.data ?? "") as {
    buyer: string;
    recipient: string;
    totalEth: string;
    ethFee: string;
    ethSold: string;
    tokensBought: string;
    buyerTokenBalance: string;
    totalSupply: string;
    isGraduate: boolean;
  };
  debugLog(JSON.stringify(args));
  const { error: error1 } = await supabaseClient.from("Trade").upsert(
    {
      event: row.id,
      fee: args.ethFee,
      from: args.buyer.toLowerCase(),
      isGraduate: args.isGraduate ? 1 : 0,
      operatorTokenBalance: args.buyerTokenBalance,
      recipient: args.recipient,
      tokenAddress: row.contractAddress.toLowerCase(),
      totalEth: args.totalEth,
      totalSupply: args.totalSupply,
      trueEth: args.ethSold,
      trueOrderSize: args.tokensBought,
      type: 0,
      timestamp: row.timestamp,
      txIndex: row.txIndex,
      chain: row.chain
    },
    {
      onConflict: "event",
    }
  );
  const { error: error2 } = await supabaseClient
    .from("Token")
    .update({
      totalSupply: args.totalSupply,
      updated_timestamp: row.timestamp,
    })
    .eq("address", row.contractAddress.toLowerCase());
  if (error1 || error2) {
    throw [error1?.message, error2?.message];
  }
  debugLog(`TokenBuy event ${row.id} synced`);
  await setEventHandled(row.id);
}

async function handleTokenSell(row: Database["public"]["Tables"]["Event"]["Row"]) {
  debugLog(`Handling TokenSell event ${row.id}`);

  const args = JSON.parse(row.data ?? "") as {
    seller: string;
    recipient: string;
    totalEth: string;
    ethFee: string;
    ethBought: string;
    tokensSold: string;
    sellerTokenBalance: string;
    totalSupply: string;
    isGraduate: boolean;
  };
  const { error: error1 } = await supabaseClient.from("Trade").upsert(
    {
      event: row.id,
      fee: args.ethFee,
      from: args.seller.toLowerCase(),
      isGraduate: args.isGraduate ? 1 : 0,
      operatorTokenBalance: args.sellerTokenBalance,
      recipient: args.recipient,
      tokenAddress: row.contractAddress.toLowerCase(),
      totalEth: args.totalEth,
      totalSupply: args.totalSupply,
      trueEth: args.ethBought,
      trueOrderSize: args.tokensSold,
      type: 1,
      timestamp: row.timestamp,
      txIndex: row.txIndex,
      chain: row.chain
    },
    {
      onConflict: "event",
    }
  );
  const { error: error2 } = await supabaseClient
    .from("Token")
    .update({
      totalSupply: args.totalSupply,
      updated_timestamp: row.timestamp,
    })
    .eq("address", row.contractAddress.toLowerCase());
  if (error1 || error2) {
    throw [error1?.message, error2?.message];
  }
  debugLog(`TokenSell event ${row.id} synced`);
  await setEventHandled(row.id);
}

async function handleMarketGraduated(row: Database["public"]["Tables"]["Event"]["Row"]) {
  debugLog(`Handling MarketGraduated event ${row.id}`);

  const args = JSON.parse(row.data ?? "") as {
    tokenAddress: string;
    poolAddress: string;
    totalEthLiquidity: string;
    totalTokenLiquidity: string;
    lpPositionId: string;
    isGraduate: boolean;
  };
  const { error } = await supabaseClient
    .from("Token")
    .update({
      isGraduate: 1,
      poolAddress: args.poolAddress.toLowerCase(),
      lpPositionId: args.lpPositionId,
    })
    .eq("address", row.contractAddress);
  if (error) {
    throw error.message;
  }
  debugLog(`MarketGraduated event ${row.id} synced`);
  await setEventHandled(row.id);
}
