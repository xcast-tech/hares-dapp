import {
  Tabs,
  Tab,
  Button,
  Input,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Pagination,
  PaginationItem,
} from "@heroui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchTradeDatas, getTokenTopHoldersApi } from "@/lib/apis";
import { Address, IToken, TopHolder, Trade } from "@/lib/types";
import {
  cn,
  formatBigintTokenBalance,
  formatChillDecimalNumber,
  formatDecimalNumber,
  formatNumber,
  formatToFourDecimalPlaces,
  formatTokenBalance,
  getEthBuyQuote,
  getTokenMarketCap,
  getTokenSellQuote,
  parseMetadata,
  removeDuplicateTrades,
} from "@/lib/utils";
import { useHaresContract } from "@/hooks/useHaresContract";
import { toast } from "react-toastify";
import { useAccount, useBalance, usePublicClient } from "wagmi";
import { useAppContext } from "@/context/useAppContext";
import TradingView from "@/components/tradingview";
import Head from "next/head";
import { getTokenDetail } from "@/lib/model";
import { TradeList } from "@/components/trade-list";
import { TopHolders } from "@/components/top-holders";
import { formatEther } from "viem";
import { primaryMarketSupply, tokenSymbol } from "@/lib/constant";
import { TradingChart } from "@/components/trading-chart";
import styled from "@emotion/styled";
import BSCIcon from "~@/icons/bsc.svg";

import styles from "./index.module.scss";
import { useGlobalCtx } from "@/context/useGlobalCtx";
import { TokenInfo } from "@/components/token/info";
import { TradesMarquee } from "@/components/token/marquee";
import CommonInput from "@/components/common/input";
import InfoIcon from "~@/icons/info.svg";
import ChartIcon from "~@/icons/chart.svg";
import TradeIcon from "~@/icons/trade.svg";
import TXsIcon from "~@/icons/txs.svg";
import ShareIcon from "~@/icons/share.svg";
import { isMobile } from "@/lib/utils";
import DrawerBottom from "@/components/common/drawer/bottom";
import { useRouter } from "next/router";
import { usePathname, useSearchParams } from "next/navigation";
import { debounce, set } from "lodash-es";
import InfiniteScroll from "@/components/common/infiniteScroll";

const TabKeys = {
  buy: "buy",
  sell: "sell",
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const data = await getTokenDetail(slug.toLowerCase());
    if (data) {
      const metadata = parseMetadata(data?.metadata ?? "");
      try {
        return {
          props: {
            ...metadata,
            ...data,
          },
          revalidate: 10,
        };
      } catch (error) {
        console.log("error", error);
        return {
          notFound: true,
        };
      }
    } else {
      return {
        notFound: true,
      };
    }
  } catch (err: any) {
    return {
      notFound: true,
    };
  }
}

export default function Token(props: IToken) {
  const detail = props;
  const router = useRouter();
  const { ethPrice } = useAppContext();
  const { buy, simulateBuy, sell, simulateSell, getTokenBalance } =
    useHaresContract();
  const {
    address,
    isActionReady,
    shouldSign,
    handleSign,
    isCorrectChain,
    handleSwitchNetwork,
    isBABValidated,
  } = useGlobalCtx();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const publicClient = usePublicClient();
  // const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { data: balance } = useBalance({ address });

  const ca = detail.address as Address;
  const [totalSupply, setTotalSupply] = useState(detail.totalSupply);
  const [isGraduate, setIsGraduate] = useState(detail.isGraduate);

  const [tokenBalance, setTokenBalance] = useState<bigint>(BigInt(0));
  const [slippage, setSlippage] = useState("20");
  const [editSlippage, setEditSlippage] = useState("");
  const [noMoreHistory, setNoMoreHistory] = useState(false);
  const [historyList, setHistoryList] = useState<Trade[]>([]);
  const [historyParams, setHistoryParams] = useState({
    from: 0,
    limit: 20,
    total: 0,
  });
  const [historyDataMounted, setHistoryDataMounted] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [simulateBuying, setSimulateBuying] = useState(false);
  const [simulateBuyTokens, setSimulateBuyTokens] = useState<bigint>(BigInt(0));
  const [simulateSelling, setSimulateSelling] = useState(false);
  const [simulateSellTokens, setSimulateSellTokens] = useState<bigint>(
    BigInt(0)
  );
  const [buyInputValue, setBuyInputValue] = useState<string>();
  const [sellInputValue, setSellInputValue] = useState<string>();
  const [tabKey, setTabKey] = useState<string | number>(TabKeys.buy);
  const [slippageModalOpen, setSlippageModalOpen] = useState(false);
  const [trading, setTrading] = useState(false);

  const [topHolders, setTopHolders] = useState<TopHolder[]>([]);

  const tabColor = tabKey === "buy" ? "success" : "danger";

  const buyOptions = [
    {
      label: "Reset",
      value: 0,
    },
    {
      label: `0.02 ${tokenSymbol}`,
      value: 0.02,
    },
    {
      label: `0.1 ${tokenSymbol}`,
      value: 0.1,
    },
    {
      label: `0.2 ${tokenSymbol}`,
      value: 0.2,
    },
    {
      label: `1 ${tokenSymbol}`,
      value: 1,
    },
  ];

  const sellOptions = [
    {
      label: "Reset",
      value: 0,
    },
    {
      label: "25%",
      value: 0.25,
    },
    {
      label: "50%",
      value: 0.5,
    },
    {
      label: "100%",
      value: 1,
    },
  ];

  const handleNewTrade = useCallback(_handleNewTrade, [historyList]);

  function _handleNewTrade(trades: Trade[]) {
    console.log("--- new handleNewTrade", trades);
    if (trades?.length > 0) {
      const _trades = removeDuplicateTrades(
        [...trades, ...historyList].sort((a, b) => b.id - a.id)
      );
      const latelyTrade = _trades[0];
      const lastTrade = _trades[_trades.length - 1];

      // check isGraduate
      if (Number(latelyTrade.totalSupply) > primaryMarketSupply) {
        setIsGraduate(1);
      }
      setHistoryList(_trades);
      setTotalSupply(latelyTrade.totalSupply);
      setHistoryParams((v) => ({
        ...v,
        from: lastTrade.timestamp,
      }));

      fetchTopHolders(ca);
    }
  }

  async function handleSimulateBuy(value: string) {
    if (!address) {
      setSimulateBuying(false);
      return 0;
    }
    const amount = +(value || "");
    if (amount <= 0) {
      setSimulateBuying(false);
      return 0;
    }
    const res = await simulateBuy(ca, amount, +slippage / 100);
    setSimulateBuying(false);
    setSimulateBuyTokens(res?.result || BigInt(0));
  }

  const handleSimulateBuyDebounce = debounce(handleSimulateBuy, 1000);

  async function handleSimulateSell(value: string) {
    if (!address) {
      setSimulateSelling(false);
      return 0;
    }
    const amount = +(value || "");
    if (amount <= 0) {
      setSimulateSelling(false);
      return 0;
    }
    try {
      const res = await simulateSell(ca, amount, +slippage / 100);
      console.log("handleSimulateSell res", res);
      setSimulateSelling(false);
      setSimulateSellTokens(res?.result || BigInt(0));
    } catch (error: any) {
      console.log("handleSimulateSell error", error);
      setSimulateSelling(false);
      setSimulateSellTokens(BigInt(0));
    }
  }

  const handleSimulateSellDebounce = debounce(handleSimulateSell, 1000);

  async function handleBuy() {
    if (!address) {
      toast("Please connect wallet first");
      return;
    }
    const amount = +(buyInputValue || "");
    if (amount <= 0) {
      toast("Invalid amount");
      return;
    }
    try {
      setTrading(true);
      const tx = await buy(ca, amount, +slippage / 100, () => {
        setTrading(false);
      });
      if (tx) {
        toast(`Buy transaction send. tx: ${tx}`);
      }
    } catch (error: any) {
      if (error.message.includes("User rejected the request")) {
        return;
      }
      toast(error?.message);
    } finally {
      setTrading(false);
      fetchTokenBalance(ca, address);
    }
  }

  async function handleSell() {
    if (!address) {
      toast("Please connect wallet first");
      return;
    }
    const amount = +(sellInputValue || "");
    if (amount <= 0) {
      toast("Invalid amount");
      return;
    }
    try {
      setTrading(true);
      const tx = await sell(ca, amount, +slippage / 100, () => {
        setTrading(false);
      });
      toast(`Sell transaction send. tx: ${tx}`);
    } catch (error: any) {
      if (error.message.includes("User rejected the request")) {
        return;
      }
      toast(error?.message);
    } finally {
      setTrading(false);
      fetchTokenBalance(ca, address);
    }
  }

  async function fetchTokenBalance(ca: Address, address: Address) {
    const balance = await getTokenBalance(ca, address);
    setTokenBalance(balance);
    return balance;
  }

  const onSlippageModalOpenChange = (open: boolean) => {
    setSlippageModalOpen(open);
  };

  async function fetchTopHolders(address: Address) {
    const res = await getTokenTopHoldersApi({ address });
    setTopHolders(res?.data?.list ?? []);
  }

  async function fetchHistoryData(address = ca, from = 0, to = 0, limit = 20) {
    if (historyLoading || noMoreHistory) return;
    setHistoryLoading(true);
    const res = await fetchTradeDatas(address, from, to, limit);
    const _from =
      res.list.length > 0 ? res.list[res.list.length - 1].timestamp : 0;

    setHistoryParams((v) => ({
      ...v,
      from: _from,
      limit: 20,
      total: res.count || v.total,
    }));
    setNoMoreHistory(res.noData);
    setHistoryLoading(false);
    return res;
  }

  useEffect(() => {
    // initial history data
    if (ca) {
      setHistoryDataMounted(false);
      // get the lately 1000 trade records
      const limit = 1000;
      fetchHistoryData(ca, 0, 0, limit)
        .then((res) => {
          if (!res) return;
          setHistoryList(res.list);
        })
        .finally(() => {
          setHistoryDataMounted(true);
        });
    }
  }, [ca]);

  const tradeComponent = (
    <StyledActionContainer>
      <Tabs
        fullWidth
        classNames={{
          tabList: styles["action-tabs"],
          tab: styles["action-tab"],
          cursor: styles["action-cursor"],
        }}
        size="lg"
        color={tabColor}
        selectedKey={tabKey}
        onSelectionChange={(key) => setTabKey(key)}
      >
        <Tab key={TabKeys.buy} title="Buy" />
        <Tab key={TabKeys.sell} title="Sell" />
      </Tabs>
      <StyledActionTrade>
        <StyledActionTradeTop>
          <StyledTokenActionTradeAmount>
            <span>Amount&nbsp;</span>
            <span>
              ({tabKey === TabKeys.buy ? tokenSymbol : detail?.symbol}):
            </span>
            <span>
              &nbsp;&nbsp;
              {tabKey === TabKeys.buy
                ? formatBigintTokenBalance(balance?.value || BigInt(0))
                : formatBigintTokenBalance(tokenBalance)}
            </span>
          </StyledTokenActionTradeAmount>
          <StyledTokenActionTradeSlippageBtn
            onPress={() => {
              setEditSlippage(slippage);
              setSlippageModalOpen(true);
            }}
          >
            set slippage
          </StyledTokenActionTradeSlippageBtn>
        </StyledActionTradeTop>
        <StyledTokenActionTradePlace>
          {tabKey === TabKeys.buy ? (
            <StyledTokenActionTradePlaceInner>
              <StyledTokenActionTradePlaceInputBox>
                <StyledTokenActionTradePlaceInput
                  key="buyInput"
                  value={buyInputValue}
                  placeholder="0.00"
                  onChange={(e) => {
                    setBuyInputValue(e.target.value);
                    setSimulateBuying(true);
                    return handleSimulateBuyDebounce(e.target.value);
                  }}
                  type="number"
                  autoFocus={false}
                />
                <StyledTokenActionTradeDivider />
                <StyledTokenActionInputRight>
                  <span>{tokenSymbol}</span>
                  <StyledTokenActionInputIcon
                    alt="token icon"
                    src="/icons/bsc.svg"
                  />
                </StyledTokenActionInputRight>
              </StyledTokenActionTradePlaceInputBox>
              {buyInputValue && !isGraduate && (
                <StyledTokenReceived>
                  {detail?.symbol} received:{" "}
                  {simulateBuying
                    ? "-"
                    : formatDecimalNumber(formatEther(simulateBuyTokens))}
                </StyledTokenReceived>
              )}
              <StyledTokenActionTradePlaceOptions>
                {buyOptions.map((option, i) => {
                  return (
                    <StyledChip
                      className={`${i === 0 ? "reset-btn" : ""}`}
                      key={i}
                      onClick={() => {
                        // if (!isActionReady) {
                        //   handleSign();
                        //   return;
                        // }
                        setBuyInputValue(String(option.value));
                        setSimulateBuying(true);
                        handleSimulateBuy(String(option.value));
                      }}
                    >
                      {option.label}
                    </StyledChip>
                  );
                })}
              </StyledTokenActionTradePlaceOptions>
              <StyledTokenActionTradePlaceSubmit
                fullWidth
                color="success"
                onPress={async () => {
                  if (!isActionReady) {
                    handleSign();
                    return;
                  }
                  if (!isCorrectChain) {
                    await handleSwitchNetwork();
                  }
                  if (!isBABValidated) {
                    router.push("/about");
                    return;
                  }
                  handleBuy();
                }}
                isLoading={trading}
              >
                {!address || shouldSign ? (
                  <span>Sign In First</span>
                ) : !isBABValidated ? (
                  "Mint BABT first"
                ) : (
                  <span>{trading ? "Trading..." : "Place trade"}</span>
                )}
              </StyledTokenActionTradePlaceSubmit>
            </StyledTokenActionTradePlaceInner>
          ) : (
            <StyledTokenActionTradePlaceInner>
              <StyledTokenActionTradePlaceInputBox>
                <StyledTokenActionTradePlaceInput
                  key="sellInput"
                  value={sellInputValue}
                  onChange={(e) => {
                    setSellInputValue(e.target.value);
                    setSimulateSelling(true);
                    return handleSimulateSellDebounce(e.target.value);
                  }}
                  type="number"
                  autoFocus={false}
                />
                <StyledTokenActionTradeDivider />
                <StyledTokenActionInputRight>
                  <span>{detail?.symbol}</span>
                  <StyledTokenActionInputIcon
                    alt="token icon"
                    src={detail?.image}
                  />
                </StyledTokenActionInputRight>
              </StyledTokenActionTradePlaceInputBox>
              {sellInputValue && !isGraduate && (
                <StyledTokenReceived>
                  {tokenSymbol} received:{" "}
                  {simulateSelling
                    ? "-"
                    : formatDecimalNumber(formatEther(simulateSellTokens))}
                </StyledTokenReceived>
              )}
              <StyledTokenActionTradePlaceOptions>
                {sellOptions.map((option, i) => {
                  return (
                    <StyledChip
                      key={i}
                      onClick={async () => {
                        // if (!isActionReady) {
                        //   handleSign();
                        //   return;
                        // }
                        const balance = await fetchTokenBalance(ca, address!);
                        const amount = formatChillDecimalNumber(
                          formatEther(
                            (balance * BigInt(option.value * 100)) / BigInt(100)
                          ),
                          0,
                          4
                        );
                        setSellInputValue(amount);
                        setSimulateSelling(true);
                        return handleSimulateSell(amount);
                      }}
                    >
                      {option.label}
                    </StyledChip>
                  );
                })}
              </StyledTokenActionTradePlaceOptions>
              <StyledTokenActionTradePlaceSubmit
                fullWidth
                color="danger"
                onPress={async () => {
                  if (!isActionReady) {
                    handleSign();
                    return;
                  }
                  if (!isCorrectChain) {
                    await handleSwitchNetwork();
                  }
                  handleSell();
                }}
                isLoading={trading || simulateSelling}
              >
                {!address || shouldSign ? (
                  <span>Sign In First</span>
                ) : (
                  <span>{trading ? "Trading..." : "Place trade"}</span>
                )}
              </StyledTokenActionTradePlaceSubmit>
            </StyledTokenActionTradePlaceInner>
          )}
        </StyledTokenActionTradePlace>
      </StyledActionTrade>
    </StyledActionContainer>
  );

  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [scrollDirection, setScrollDirection] = useState("down");
  const lastScrollY = useRef(0);
  const [activeTab, setActiveTab] = useState("info");

  const mobileTabs = useMemo(() => {
    return [
      {
        icon: <InfoIcon />,
        label: "Info",
        active: activeTab === "info",
        hash: "info",
        idx: 0,
        // onClick: () => {
        //   if (sectionsRef.current[0]) {
        //     window.scrollTo({
        //       top: sectionsRef.current[0].offsetTop - 82,
        //       behavior: "smooth",
        //     });
        //   }
        // },
      },
      {
        icon: <ChartIcon />,
        label: "Chart",
        active: activeTab === "chart",
        hash: "chart",
        idx: 1,
        // onClick: () => {
        //   if (sectionsRef.current[1]) {
        //     window.scrollTo({
        //       top: sectionsRef.current[1].offsetTop - 82,
        //       behavior: "smooth",
        //     });
        //   }
        // },
      },
      {
        icon: <TradeIcon />,
        label: "Trade",
        active: false,
        primary: true,
      },
      {
        icon: <TXsIcon />,
        label: "TXs",
        active: activeTab === "history",
        hash: "history",
        idx: 2,
        // onClick: () => {
        //   if (sectionsRef.current[2]) {
        //     window.scrollTo({
        //       top: sectionsRef.current[2].offsetTop - 82,
        //       behavior: "smooth",
        //     });
        //   }
        // },
      },
      {
        icon: <ShareIcon />,
        label: "Share",
        active: activeTab === "holders",
        hash: "holders",
        idx: 3,
        // onClick: () => {
        //   if (sectionsRef.current[3]) {
        //     window.scrollTo({
        //       top: sectionsRef.current[3].offsetTop - 82,
        //       behavior: "smooth",
        //     });
        //   }
        // },
      },
    ];
  }, [activeTab]);

  // Track scroll direction
  // useEffect(() => {
  //   if (!isMobile) return;
  //   const handleScroll = () => {
  //     const currentScrollY = window.scrollY;
  //     if (currentScrollY > lastScrollY.current) {
  //       setScrollDirection("down");
  //     } else if (currentScrollY < lastScrollY.current) {
  //       setScrollDirection("up");
  //     }
  //     lastScrollY.current = currentScrollY;
  //   };

  //   window.addEventListener("scroll", handleScroll, { passive: true });
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, [isMobile]);

  // useEffect(() => {
  //   if (!isMobile) return;
  //   // Handle intersection based on scroll direction
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       entries.forEach((entry) => {
  //         if (entry.isIntersecting) {
  //           const id = entry.target.id;
  //           if (window.location.hash !== `#${id}`) {
  //             setActiveTab(id);
  //             console.log(" observer id:", id);
  //             window.history.replaceState(null, "", `#${id}`);
  //           }
  //         }
  //       });
  //     },
  //     {
  //       root: null,
  //       rootMargin: "-100px 0px 0px 0px",
  //       threshold: 0,
  //     }
  //   );

  //   sectionsRef.current.forEach((section) => {
  //     if (section) {
  //       observer.observe(section);
  //     }
  //   });

  //   return () => {
  //     if (sectionsRef.current) {
  //       sectionsRef.current.forEach((section) => {
  //         if (section) {
  //           observer.unobserve(section);
  //         }
  //       });
  //     }
  //   };
  // }, [isMobile]);

  // useEffect(() => {
  //   if (!isMobile) return;

  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       entries.forEach((entry) => {
  //         if (entry.isIntersecting) {
  //           const id = entry.target.id;
  //           if (window.location.hash !== `#${id}`) {
  //             window.history.replaceState(null, "", `#${id}`);
  //           }
  //         }
  //       });
  //     },
  //     {
  //       root: null,
  //       rootMargin: "-100px 0px 0px 0px",
  //       threshold: 0,
  //     }
  //   );

  //   sectionsRef.current.forEach((section) => {
  //     if (section) {
  //       observer.observe(section);
  //     }
  //   });

  //   return () => {
  //     if (sectionsRef.current) {
  //       sectionsRef.current.forEach((section) => {
  //         if (section) {
  //           observer.unobserve(section);
  //         }
  //       });
  //     }
  //   };
  // }, [isMobile]);

  useEffect(() => {
    if (ca && address) {
      fetchTokenBalance(ca, address);
    }
  }, [ca, address]);

  const handleReset = () => {
    setBuyInputValue("");
    setSellInputValue("");
    setSimulateBuyTokens(BigInt(0));
    setSimulateSellTokens(BigInt(0));
    setHistoryList([]);
    setTotalSupply("0");
    setTokenBalance(BigInt(0));
    setTopHolders([]);
  };

  useEffect(() => {
    if (ca) {
      fetchTopHolders(ca);
    }
    return () => {
      handleReset();
    };
  }, [ca]);

  return (
    <>
      <Head>
        <title>{`${detail?.symbol} | BAB.Fun`}</title>
      </Head>
      <StyledHomeTool>
        <TradesMarquee />
      </StyledHomeTool>
      <StyledTokenContainer>
        <StyledTokenLeft>
          <StyledTradingInfo>
            <StyledTokenInfo
              id="info"
              ref={(el) => {
                sectionsRef.current[0] = el;
              }}
            >
              <TokenInfo detail={detail} />
            </StyledTokenInfo>
            <StyledTokenRBHInfo
              id="chart"
              ref={(el) => {
                sectionsRef.current[1] = el;
              }}
            >
              <b>{detail?.symbol}:&nbsp;</b>
              <span>{ca}</span>
            </StyledTokenRBHInfo>
            <StyledTradingChartBox>
              {isGraduate ? (
                <StyledTokenGraduate>
                  The token has already graduated and been migrated to the
                  PancakeSwap V3 pool.
                </StyledTokenGraduate>
              ) : null}
              <StyledTradingChartContainer isIframeMode={isGraduate === 1}>
                {/* <TradingView
                className="w-full h-[500px] bg-black"
                symbol={detail.symbol}
                address={ca}
                ethPrice={ethPrice}
                onNewTrade={handleNewTrade}
              /> */}
                {!historyDataMounted ? (
                  <div>loading...</div>
                ) : (
                  <TradingChart
                    isGraduated={isGraduate === 1}
                    param={{
                      name: detail.name,
                      ticker: detail.symbol,
                      creator: detail.creatorAddress,
                      url: detail.website,
                      reserveOne: 1,
                      reserveTwo: 1,
                      token: detail.address as `0x${string}`,
                    }}
                    defaultTrades={historyList}
                    tradesCallBack={handleNewTrade}
                  />
                )}
              </StyledTradingChartContainer>
            </StyledTradingChartBox>
          </StyledTradingInfo>

          {/* <TradeList
            list={historyList}
            symbol={detail.symbol}
            className="hidden xl:block"
          /> */}
          <InfiniteScroll
            hasMore={!noMoreHistory}
            fetchMoreData={async () => {
              const limit = 20;
              const res = await fetchHistoryData(
                ca,
                historyParams.from,
                0,
                limit
              );

              if (res) {
                const list = removeDuplicateTrades([
                  ...historyList,
                  ...res.list,
                ]);
                const from = Math.max(
                  res.list[res.list.length - 1].timestamp,
                  historyParams.from
                );
                setHistoryList(list);
                setHistoryParams((v) => ({
                  ...v,
                  from,
                  limit,
                  total: res.count || v.total,
                }));
              }
            }}
          >
            <StyledTradeListContainer
              id="history"
              ref={(el) => {
                sectionsRef.current[2] = el;
              }}
            >
              <TradeList list={historyList} symbol={detail.symbol} />
            </StyledTradeListContainer>
          </InfiniteScroll>

          {/* <MobileStyledTradeListContainer>
            <MobileTradeList list={historyList} symbol={detail.symbol} />
          </MobileStyledTradeListContainer> */}
        </StyledTokenLeft>
        <StyledTradeContainer>
          <StyledTradeAction>{tradeComponent}</StyledTradeAction>
          <StyledTradeTopHolders
            id="holders"
            ref={(el) => {
              sectionsRef.current[3] = el;
            }}
          >
            <TopHolders list={topHolders} devAddress={detail.creatorAddress} />
          </StyledTradeTopHolders>
        </StyledTradeContainer>
      </StyledTokenContainer>
      <MobileStyledTokenTabsBar>
        <MobileStyledTokenTabsBarContainer>
          {mobileTabs.map((tab, index) => {
            return tab.primary ? (
              <MobileStyledTokenTabsBarPrimaryItem key={index}>
                <MobileStyledTokenTabsBarPrimaryItemBtn onClick={onOpen}>
                  {tab.icon}
                </MobileStyledTokenTabsBarPrimaryItemBtn>
              </MobileStyledTokenTabsBarPrimaryItem>
            ) : (
              <MobileStyledTokenTabsBarItem
                active={tab.active}
                key={index}
                onClick={() => {
                  const _idx = tab.idx || 0;
                  if (sectionsRef.current[_idx]) {
                    window.scrollTo({
                      top: sectionsRef.current[_idx].offsetTop - 82,
                      behavior: "smooth",
                    });
                    setActiveTab(tab.hash!);
                  }
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </MobileStyledTokenTabsBarItem>
            );
          })}
        </MobileStyledTokenTabsBarContainer>
      </MobileStyledTokenTabsBar>

      <Modal
        classNames={{
          base: styles["slippage-modal-base"],
          backdrop: styles["slippage-modal-backdrop"],
          wrapper: styles["slippage-modal-wrapper"],
          header: styles["slippage-modal-header"],
          body: styles["slippage-modal-body"],
          footer: styles["slippage-modal-footer"],
        }}
        isOpen={slippageModalOpen}
        onOpenChange={onSlippageModalOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>set slippage (%)</ModalHeader>
              <ModalBody>
                <CommonInput
                  type="number"
                  value={editSlippage}
                  onChange={(event) => {
                    setEditSlippage(event.target.value);
                  }}
                  autoFocus={false}
                />
                <StyledModalDesc>
                  this is the maximum amount of slippage you are willing to
                  accept when placing trades.
                </StyledModalDesc>
              </ModalBody>
              <ModalFooter>
                <StyledModalButton
                  onPress={() => {
                    const num = +editSlippage;
                    if (num < 0 || num > 100) {
                      toast("Invalid slippage");
                      return;
                    }
                    setSlippage(editSlippage || "0");
                    onClose();
                  }}
                >
                  OK
                </StyledModalButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <DrawerBottom isOpen={isOpen} onOpenChange={onOpenChange}>
        <MobileStyledTradeAction>{tradeComponent}</MobileStyledTradeAction>
      </DrawerBottom>
    </>
  );
}

const StyledHomeTool = styled.div`
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 72px;
  z-index: 999;
  background: #020308;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);

  @media screen and (max-width: 1024px) {
    display: none;
  }
`;

const StyledTokenContainer = styled.div`
  padding-top: calc(var(--header-h) + 14px);
  padding-left: 32px;
  padding-right: 32px;
  margin-bottom: 32px;
  width: 100%;
  max-width: 1264px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  gap: 24px;

  @media screen and (max-width: 1024px) {
    padding: 18px 20px;
    padding-top: calc(var(--header-h) + 18px);
    padding-bottom: 72px;
    flex-direction: column;
    gap: 0;
    background-image: url(/mobile-bg.png);
    background-size: 100% auto;
    background-repeat: no-repeat;
  }
`;

const StyledTokenLeft = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  margin-bottom: 32px;

  @media screen and (max-width: 1024px) {
    border: none;
    margin-bottom: 0;
  }
`;

const StyledTradingInfo = styled.div`
  width: 100%;
`;

const StyledTradingChartBox = styled.div`
  // padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(255, 255, 255, 0.05);

  @media screen and (max-width: 1024px) {
    padding: 0;
    background: transparent;
  }
`;

const StyledTradingChartContainer = styled.div<{ isIframeMode: boolean }>`
  width: 100%;
  height: ${(props) => (props.isIframeMode ? "360px" : "420px")};
`;

const StyledTokenGraduate = styled.div`
  padding: 0 16px;
  padding-top: 16px;
  color: #fcd535;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%; /* 19.6px */
`;

const StyledTokenInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTokenRBHInfo = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;

  color: rgba(234, 236, 239, 0.5);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background: #020308;
  > b {
    color: #eaecef;
    font-weight: 700;
  }

  @media screen and (max-width: 1024px) {
    display: block;
    padding: 12px 0;
    white-space: wrap;
    word-break: break-all;
  }
`;

const StyledTradeListContainer = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.12);
`;

// const MobileStyledTradeListContainer = styled.div`
//   display: none;
//   @media screen and (max-width: 1024px) {
//     display: block;
//     border-top: 1px solid rgba(255, 255, 255, 0.12);
//   }
// `;

const StyledTradeContainer = styled.div`
  position: sticky;
  top: calc(var(--header-h) + 48px + 10px);
  width: 400px;
  max-height: calc(100vh - (var(--header-h) + 48px + 10px));
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media screen and (max-width: 1024px) {
    position: static;
    max-height: none;
    width: 100%;
  }
`;

const StyledTradeAction = styled.div`
  @media screen and (max-width: 1024px) {
    display: none;
  }
`;

const StyledActionContainer = styled.div`
  padding: 6px;
  padding-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;

  border-radius: 34px;
  // border: 1px solid #2b3139;
  background: #181a1f;
  overflow: hidden;

  @media screen and (max-width: 1024px) {
    padding: 6px;

    border-radius: 34px 34px 0px 0px;
    border: 1px solid #2b3139;
    background: #181a1f;
  }
`;

const StyledActionTrade = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 16px;
  padding-top: 24px;

  @media screen and (max-width: 1024px) {
    padding: 24px 8px;
  }
`;

const StyledActionTradeTop = styled.div`
  padding-left: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StyledTokenActionTradeAmount = styled.div`
  flex: 1;
  color: #eaecef;

  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 150%;
`;

const StyledTokenActionTradeSlippageBtn = styled(Button)`
  padding: 0 8px;
  display: flex;
  height: 26px;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  background: rgba(252, 213, 53, 0.1);

  color: #fcd535;

  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 150%;
`;

const StyledTokenActionTradePlace = styled.div``;

const StyledTokenActionTradePlaceInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledTokenActionTradePlaceInputBox = styled.div`
  padding: 0 16px;
  height: 50px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 8px;
  border: 1px solid #2b3139;

  background: #181a1f;
`;

const StyledTokenActionTradePlaceInput = styled.input`
  flex: 1;
  width: 100%;
  color: #eaecef;

  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  outline: none;
  border: none;
  background: transparent;
  &::placeholder {
    color: rgba(234, 236, 239, 0.5);
  }
`;

const StyledTokenActionTradeDivider = styled.div`
  width: 1px;
  height: 24px;
  background: #2b3139;
`;

const StyledTokenActionInputRight = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #eaecef;

  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

const StyledTokenActionInputIcon = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
`;

const StyledTokenReceived = styled.div`
  height: 18px;
  line-height: 18px;
  color: #fcd535;

  font-size: 12px;
  font-style: normal;
  font-weight: 500;
`;

const StyledTokenActionTradePlaceOptions = styled.ul`
  display: flex;
  align-items: center;
  gap: 4px;

  @media screen and (max-width: 1024px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;

    .reset-btn {
      grid-column: 1 / -1;
    }
  }
`;

const StyledChip = styled(Chip)`
  padding: 0 6px;
  height: 24px;
  line-height: 24px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.05);

  color: #eaecef;
  text-align: center;
  font-size: 11px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }

  @media screen and (max-width: 1024px) {
    max-width: 100%;
    height: 32px;
    line-height: 32px;
    padding: 0 12px;
    color: rgba(234, 236, 239, 0.8);

    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const StyledTokenActionTradePlaceSubmit = styled(Button)`
  margin-top: 4px;
  display: flex;
  height: 48px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  align-self: stretch;
  border-radius: 12px;

  text-align: center;
  font-size: 15px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%; /* 22.5px */
  text-transform: capitalize;

  @media screen and (max-width: 1024px) {
    margin-top: 12px;
  }
`;

const StyledTradeTopHolders = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 24px;
  width: 100%;
  overflow: hidden;
  @media screen and (max-width: 1024px) {
    min-height: 300px;
  }
`;

const StyledModalDesc = styled.div`
  color: #eaecef;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%; /* 18.2px */
  opacity: 0.8;
`;

const StyledModalButton = styled(Button)`
  width: 100%;
  display: flex;
  height: 48px;
  padding: 0px 12px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  align-self: stretch;
  border-radius: 24px;
  background: linear-gradient(274deg, #ffc720 0%, #fcd535 49.5%);

  color: #1b1f29;
  font-size: 14px;
  font-style: normal;
  font-weight: 800;
  line-height: 150%; /* 21px */
`;

const MobileStyledTokenTabsBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 39;
  pointer-events: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--background);
  display: none;
  @media screen and (max-width: 1024px) {
    display: block;
  }
`;

const MobileStyledTokenTabsBarContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding: 16px 16px;
  pointer-events: auto;
`;

const MobileStyledTokenTabsBarItem = styled.div<{ active?: boolean }>`
  padding-top: 3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #eaecef;
  text-align: center;
  justify-content: space-between;
  font-size: 9px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  opacity: ${({ active }) => (active ? 1 : 0.5)};
  > svg {
    width: 22px;
    height: 22px;
  }
`;

const MobileStyledTokenTabsBarPrimaryItem = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const MobileStyledTokenTabsBarPrimaryItemBtn = styled.button`
  display: flex;
  width: 40px;
  height: 40px;
  padding: 10px;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  border-radius: 12px;
  background: #fcd535;
  color: #181a1f;
  > svg {
    width: 20px;
    height: 20px;
  }
`;

const MobileStyledTradeAction = styled.div``;
