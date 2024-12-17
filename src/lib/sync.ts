import { setEventHandled } from "./model";
import { supabaseClient } from "./supabase";
import { Database } from "./supabase/supabase";
import { getTokenCreateEvent, getTokenEvents } from "./third-party";

export function debugLog(msg: any, level: 'info' | 'warn' | 'error' = 'info') {
  const logLevel = process.env.LOG_LEVEL ? JSON.parse(process.env.LOG_LEVEL!) : ['info', 'warn', 'error']
  if (logLevel.includes(level)) {
    console.log(`[${new Date().toISOString()}][${level}] ${msg}`)
    const date = new Date()
    const fileName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.log`
    if (process.env.LOG_TO_FILE === 'true') {
      const fs = require('fs/promises')
      fs.appendFile(`./log/${fileName}`, `[${new Date().toISOString()}] ${msg}\n`)
    }
  }
}

export async function syncEvents(from: number, to: number) {
  debugLog(`Fetching events from ${from} to ${to}`)
  const allEvents = await Promise.all([
    getTokenCreateEvent(from, to),
    getTokenEvents(from, to, 'HaresTokenTransfer'),
    getTokenEvents(from, to, 'HaresTokenBuy'),
    getTokenEvents(from, to, 'HaresTokenSell'),
    getTokenEvents(from, to, 'HaresMarketGraduated'),
  ])

  const getOrder = (e: any) => e.block * 100000 + e.txIndex
  const events = allEvents.flat().sort((a, b) => getOrder(a) - getOrder(b))

  debugLog(`${events.length} events found`)

  if (events.length === 0) {
    return 0
  }

  const { error } = await supabaseClient.from('Event').upsert(events.map((e) => ({
    block: e.block,
    contractAddress: e.address.toLowerCase(),
    data: JSON.stringify(e.args),
    hash: e.hash,
    timestamp: e.timeStamp,
    topic: e.eventName,
    txIndex: e.txIndex,
  })), {
    onConflict: 'topic,hash,data',
  })
  
  if (error) {
    throw error.message
  }

  return events.length
}

export async function handleEvents() {
  const { data: events, error } = await supabaseClient.from('Event').select('*').eq('status', 0).order('id', { ascending: true })
  if (error) {
    throw error.message
  }
  const functionMap: Record<string, Function> = {
    HaresTokenCreated: handleTokenCreated,
    HaresTokenTransfer: handleTokenTransfer,
    HaresTokenBuy: handleTokenBuy,
    HaresTokenSell: handleTokenSell,
    HaresMarketGraduated: handleMarketGraduated
  }
  const tokenCache: Record<string, boolean> = {}
  for (let i = 0; i < events.length; i++) {
    const { topic } = events[i]
    const handler = topic && functionMap[topic]
    if (handler) {
      await handler(events[i], tokenCache)
    }
  }
  return events.length
}

async function handleTokenCreated(row: Database['public']['Tables']['Event']['Row'], tokenCache: Record<string, boolean>) {
  debugLog(`Handling TokenCreated event ${row.id}`)
  const args = JSON.parse(row.data ?? '') as { tokenAddress: string, creator: string, name: string, symbol: string }
  const { tokenAddress, creator, name, symbol } = args
  const { error } = await supabaseClient.from('Token').upsert({
    address: tokenAddress.toLowerCase(),
    createEvent: row.id,
    creatorAddress: creator.toLowerCase(),
    name,
    symbol,
    created_timestamp: row.timestamp
  }, {
    onConflict: 'createEvent',
  })
  if (error) {
    throw error.message
  }
  debugLog(`Token ${name} - ${symbol} synced`)
  tokenCache[args.tokenAddress] = true
  await setEventHandled(row.id)
}

async function cacheToken(row: Database['public']['Tables']['Event']['Row'], tokenCache: Record<string, boolean>) {
  if (tokenCache[row.contractAddress]) {
    return true
  }
  const res = await supabaseClient.from('Token').select('id').eq('address', row.contractAddress).maybeSingle()
  const { data: token, error: tokenErr } = res
  if (tokenErr) {
    throw tokenErr.message
  }
  if (!token) {
    await setEventHandled(row.id)
    return false
  }
  tokenCache[row.contractAddress] = true
  return true
}

async function handleTokenTransfer(row: Database['public']['Tables']['Event']['Row'], tokenCache: Record<string, boolean>) {
  debugLog(`Handling TokenTransfer event ${row.id}`)
  
  if (!await cacheToken(row, tokenCache)) {
    return
  }
  
  const args = JSON.parse(row.data ?? '') as {
    from: string
    to: string
    amount: string
    fromTokenBalance: string
    toTokenBalance: string
    totalSupply: string
  }
  const { error } = await supabaseClient.from('Transfer').upsert({
    event: row.id,
    tokenAddress: row.contractAddress.toLowerCase(),
    from: args.from.toLowerCase(),
    to: args.to.toLowerCase(),
    amount: args.amount,
    fromTokenBalance: args.fromTokenBalance,
    totalSupply: args.totalSupply,
    toTokenBalance: args.toTokenBalance,
    timestamp: row.timestamp
  }, {
    onConflict: 'event',
  })
  if (error) {
    throw error.message
  }
  debugLog(`TokenTransfer event ${row.id} synced`)
  await setEventHandled(row.id)
}

async function handleTokenBuy(row: Database['public']['Tables']['Event']['Row'], tokenCache: Record<string, boolean>) {
  debugLog(`Handling TokenBuy event ${row.id}`)
  
  if (!await cacheToken(row, tokenCache)) {
    return
  }

  const args = JSON.parse(row.data ?? '') as {
    buyer: string
    recipient: string
    totalEth: string
    ethFee: string
    ethSold: string
    tokensBought: string
    buyerTokenBalance: string
    totalSupply: string
    isGraduate: boolean
  }
  const { error: error1 } = await supabaseClient.from('Trade').upsert({
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
    timestamp: row.timestamp
  }, {
    onConflict: 'event',
  })
  const { error: error2 } = await supabaseClient.from('Token').update({
    totalSupply: args.totalSupply,
  }).eq('address', row.contractAddress.toLowerCase())
  if (error1 || error2) {
    throw [error1?.message, error2?.message]
  }
  debugLog(`TokenBuy event ${row.id} synced`)
  await setEventHandled(row.id)
}

async function handleTokenSell(row: Database['public']['Tables']['Event']['Row'], tokenCache: Record<string, boolean>) {
  debugLog(`Handling TokenSell event ${row.id}`)
  
  if (!await cacheToken(row, tokenCache)) {
    return
  }
  const args = JSON.parse(row.data ?? '') as {
    seller: string
    recipient: string
    totalEth: string
    ethFee: string
    ethBought: string
    tokensSold: string
    sellerTokenBalance: string
    totalSupply: string
    isGraduate: boolean
  }
  const { error: error1 } = await supabaseClient.from('Trade').upsert({
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
    timestamp: row.timestamp
  }, {
    onConflict: 'event',
  })
  const { error: error2 } = await supabaseClient.from('Token').update({
    totalSupply: args.totalSupply,
  }).eq('address', row.contractAddress.toLowerCase())
  if (error1 || error2) {
    throw [error1?.message, error2?.message]
  }
  debugLog(`TokenSell event ${row.id} synced`)
  await setEventHandled(row.id)
}

async function handleMarketGraduated(row: Database['public']['Tables']['Event']['Row'], tokenCache: Record<string, boolean>) {
  debugLog(`Handling MarketGraduated event ${row.id}`)
  
  if (!await cacheToken(row, tokenCache)) {
    return
  }
 
  const args = JSON.parse(row.data ?? '') as {
    tokenAddress: string
    poolAddress: string
    totalEthLiquidity: string
    totalTokenLiquidity: string
    lpPositionId: string
    isGraduate: boolean
  }
  const { error } = await supabaseClient.from('Token').update({
    isGraduate: 1,
    poolAddress: args.poolAddress.toLowerCase(),
    lpPositionId: args.lpPositionId
  }).eq('address', row.contractAddress)
  if (error) {
    throw error.message
  }
  debugLog(`MarketGraduated event ${row.id} synced`)
  await setEventHandled(row.id)
}
