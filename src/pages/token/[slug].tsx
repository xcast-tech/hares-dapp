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
} from "@heroui/react";
import { useEffect, useState } from "react";
import { Info } from "@/components/info";
import { getTokenTopHoldersApi } from "@/lib/apis";
import { useFarcasterContext } from "@/hooks/farcaster";
import { Address, IToken, TopHolder, Trade } from "@/lib/types";
import {
  cn,
  formatBigintTokenBalance,
  formatDecimalNumber,
  formatNumber,
  formatToFourDecimalPlaces,
  formatTokenBalance,
  getEthBuyQuote,
  getTokenSellQuote,
  removeDuplicateTrades,
} from "@/lib/utils";
import { useHaresContract } from "@/hooks/useHaresContract";
import { toast } from "react-toastify";
import { useAccount, useBalance } from "wagmi";
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

console.log("- styles:", styles);

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
      return {
        props: data,
        revalidate: 10,
      };
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
  const { ethPrice } = useAppContext();
  const { login, userInfo } = useFarcasterContext();
  const { buy, sell, getTokenBalance } = useHaresContract();
  const { address, shouldSign, handleSign } = useGlobalCtx();

  const { data: balance } = useBalance({ address });

  const ca = detail.address as Address;
  const [totalSupply, setTotalSupply] = useState(detail.totalSupply);
  const [isGraduate, setIsGraduate] = useState(detail.isGraduate);

  const [tokenBalance, setTokenBalance] = useState<bigint>(BigInt(0));
  const [slippage, setSlippage] = useState("20");
  const [editSlippage, setEditSlippage] = useState("");
  const [historyList, setHistoryList] = useState<Trade[]>([]);

  const [buyInputValue, setBuyInputValue] = useState<string>();
  const [sellInputValue, setSellInputValue] = useState<string>();
  const [tabKey, setTabKey] = useState<string | number>(TabKeys.buy);
  const [slippageModalOpen, setSlippageModalOpen] = useState(false);
  const [trading, setTrading] = useState(false);

  const [topHolders, setTopHolders] = useState<TopHolder[]>([]);

  const [tradeModalOpen, setTradeModalOpen] = useState(false);

  const tabColor = tabKey === "buy" ? "success" : "danger";

  const buyOptions = [
    {
      label: "Reset",
      value: 0,
    },
    {
      label: `0.01 ${tokenSymbol}`,
      value: 0.01,
    },
    {
      label: `0.02 ${tokenSymbol}`,
      value: 0.02,
    },
    {
      label: `0.05 ${tokenSymbol}`,
      value: 0.05,
    },
    {
      label: `0.1 ${tokenSymbol}`,
      value: 0.1,
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

  function handleNewTrade(trades: Trade[]) {
    if (trades?.length > 0) {
      const newTrade = trades[trades.length - 1];
      if (trades.length === 1) {
        if (Number(trades[0].totalSupply) > primaryMarketSupply) {
          setIsGraduate(1);
        }
        setHistoryList((v) => removeDuplicateTrades([...trades, ...v]));
      } else {
        setHistoryList((v) =>
          removeDuplicateTrades([...v, ...trades].sort((a, b) => b.id - a.id))
        );
      }
      setTotalSupply(newTrade.totalSupply);

      fetchTopHolders(ca);
    }
  }

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

  const onOpenChange = (open: boolean) => {
    setSlippageModalOpen(open);
  };

  async function fetchTopHolders(address: Address) {
    const res = await getTokenTopHoldersApi({ address });
    setTopHolders(res?.data?.list ?? []);
  }

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
            set max slippage
          </StyledTokenActionTradeSlippageBtn>
        </StyledActionTradeTop>
        <StyledTokenActionTradePlace>
          {tabKey === TabKeys.buy ? (
            <StyledTokenActionTradePlaceInner>
              <StyledTokenActionTradePlaceInputBox>
                <StyledTokenActionTradePlaceInput
                  value={buyInputValue}
                  placeholder="0.00"
                  onChange={(e) => {
                    setBuyInputValue(e.target.value);
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
                  {formatDecimalNumber(
                    formatEther(
                      getEthBuyQuote(
                        Number(totalSupply) / 1e18,
                        Number(buyInputValue)
                      )
                    )
                  )}
                </StyledTokenReceived>
              )}
              <StyledTokenActionTradePlaceOptions>
                {buyOptions.map((option, i) => {
                  return (
                    <StyledChip
                      key={i}
                      onClick={() => {
                        setBuyInputValue(String(option.value));
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
                onPress={() => {
                  if (!address || shouldSign) {
                    handleSign();
                    return;
                  }
                  handleBuy();
                }}
                isLoading={trading}
              >
                {!address || shouldSign ? (
                  <span>Sign In First</span>
                ) : (
                  <span>{trading ? "Trading..." : "Place trade"}</span>
                )}
              </StyledTokenActionTradePlaceSubmit>
            </StyledTokenActionTradePlaceInner>
          ) : (
            <StyledTokenActionTradePlaceInner>
              <StyledTokenActionTradePlaceInputBox>
                <StyledTokenActionTradePlaceInput
                  value={sellInputValue}
                  onChange={(e) => {
                    setSellInputValue(e.target.value);
                  }}
                  type="number"
                  autoFocus={false}
                />
                <StyledTokenActionTradeDivider />
                <StyledTokenActionInputRight>
                  <span>{detail?.symbol}</span>
                  <StyledTokenActionInputIcon
                    alt="token icon"
                    src={detail?.picture}
                  />
                </StyledTokenActionInputRight>
              </StyledTokenActionTradePlaceInputBox>
              {sellInputValue && !isGraduate && (
                <StyledTokenReceived>
                  {tokenSymbol} received:{" "}
                  {formatDecimalNumber(
                    formatEther(
                      getTokenSellQuote(
                        Number(totalSupply) / 1e18,
                        Number(sellInputValue)
                      )
                    )
                  )}
                </StyledTokenReceived>
              )}
              <StyledTokenActionTradePlaceOptions>
                {sellOptions.map((option, i) => {
                  return (
                    <StyledChip
                      key={i}
                      onClick={async () => {
                        const balance = await fetchTokenBalance(ca, address!);
                        const amount = formatToFourDecimalPlaces(
                          formatEther(
                            (balance * BigInt(option.value * 100)) / BigInt(100)
                          )
                        );
                        setSellInputValue(amount);
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
                onPress={() => {
                  if (!address || shouldSign) {
                    handleSign();
                    return;
                  }
                  handleSell();
                }}
                isLoading={trading}
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

  useEffect(() => {
    console.log("ca address", { ca, address });
    if (ca && address) {
      fetchTokenBalance(ca, address);
    }
  }, [ca, address]);

  useEffect(() => {
    if (ca) {
      fetchTopHolders(ca);
    }
  }, [ca]);

  return (
    <>
      <Head>
        <title>{`${detail?.symbol} | hares.ai`}</title>
      </Head>
      <StyledTokenContainer>
        <StyledTokenLeft>
          <StyledTradingInfo>
            <StyledTokenInfo>
              <TokenInfo detail={detail} />
              <StyledTokenRBHInfo>
                <b>{detail?.symbol}:&nbsp;</b>
                <span>{ca}</span>
              </StyledTokenRBHInfo>
            </StyledTokenInfo>
            <StyledTradingChartBox>
              {!isGraduate ? (
                <StyledTokenGraduate>
                  The token has already graduated and been migrated to the
                  Uniswap V3 pool.
                </StyledTokenGraduate>
              ) : null}
              <StyledTradingChartContainer>
                {/* <TradingView
                className="w-full h-[500px] bg-black"
                symbol={detail.symbol}
                address={ca}
                ethPrice={ethPrice}
                onNewTrade={handleNewTrade}
              /> */}
                <TradingChart
                  param={{
                    name: detail.name,
                    ticker: detail.symbol,
                    creator: detail.creatorAddress,
                    url: detail.website,
                    reserveOne: 1,
                    reserveTwo: 1,
                    token: detail.address as `0x${string}`,
                  }}
                  tradesCallBack={handleNewTrade}
                />
              </StyledTradingChartContainer>
            </StyledTradingChartBox>
          </StyledTradingInfo>

          {/* <TradeList
            list={historyList}
            symbol={detail.symbol}
            className="hidden xl:block"
          /> */}
          <StyledTradeListContainer>
            <TradeList list={historyList} symbol={detail.symbol} />
          </StyledTradeListContainer>
        </StyledTokenLeft>
        <StyledTradeContainer>
          {tradeComponent}
          <StyledTradeTopHolders>
            <TopHolders list={topHolders} devAddress={detail.creatorAddress} />
          </StyledTradeTopHolders>
        </StyledTradeContainer>

        {/* <TradeList
          list={historyList}
          symbol={detail.symbol}
          className="xl:hidden"
        /> */}

        {/* <div
          className={cn("fixed z-10 left-0 right-0 bottom-4 px-4", "xl:hidden")}
        >
          <Button
            fullWidth
            color="primary"
            className="rounded-[40px]"
            onPress={() => {
              setTradeModalOpen(true);
            }}
          >
            Trade
          </Button>

          <Modal
            isOpen={tradeModalOpen}
            onOpenChange={(open) => {
              setTradeModalOpen(open);
            }}
            placement="bottom"
          >
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalBody>
                    <div className="pt-8 pb-6">{tradeComponent}</div>
                  </ModalBody>
                </>
              )}
            </ModalContent>
          </Modal>
        </div> */}
      </StyledTokenContainer>

      <Modal isOpen={slippageModalOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                set max. slippage (%)
              </ModalHeader>
              <ModalBody>
                <div>
                  <Input
                    type="number"
                    value={editSlippage}
                    onChange={(event) => {
                      setEditSlippage(event.target.value);
                    }}
                    autoFocus={false}
                  />
                  <div className="text-xs mt-1">
                    this is the maximum amount of slippage you are willing to
                    accept when placing trades.
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
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
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

const StyledTokenContainer = styled.div`
  padding-top: 14px;
  padding-left: 32px;
  padding-right: 32px;
  display: flex;
  flex-direction: row;
  gap: 24px;
`;

const StyledTokenLeft = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

const StyledTradingInfo = styled.div`
  width: 100%;
`;

const StyledTradingChartBox = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(255, 255, 255, 0.05);
`;

const StyledTradingChartContainer = styled.div`
  width: 100%;
  height: 360px;
`;

const StyledTokenGraduate = styled.div`
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
`;

const StyledTradeListContainer = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.12);
`;

const StyledTradeContainer = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StyledActionContainer = styled.div`
  padding: 6px;
  padding-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;

  border-radius: 34px;
  border: 1px solid #2b3139;
  background: #181a1f;
  overflow: hidden;
`;

const StyledActionTrade = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 16px;
  padding-top: 24px;
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
`;

const StyledTradeTopHolders = styled.div`
  width: 100%;
`;
