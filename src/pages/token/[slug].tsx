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
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Info } from "@/components/info";
import { getTokenTopHoldersApi } from "@/lib/apis";
import { useFarcasterContext } from "@/hooks/farcaster";
import { Address, IToken, TopHolder, Trade } from "@/lib/types";
import {
  cn,
  formatNumber,
  formatTokenBalance,
  getEthBuyQuote,
  getTokenSellQuote,
} from "@/lib/utils";
import { useHaresContract } from "@/hooks/useHaresContract";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import { useAppContext } from "@/context/useAppContext";
import TradingView from "@/components/tradingview";
import Head from "next/head";
import { getTokenDetail } from "@/lib/model";
import { TradeList } from "@/components/trade-list";
import { TopHolders } from "@/components/top-holders";

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

  const { address } = useAccount();

  const ca = detail.address as Address;
  const [totalSupply, setTotalSupply] = useState(detail.totalSupply);
  const [isGraduate, setIsGraduate] = useState(detail.isGraduate);

  const [tokenBalance, setTokenBalance] = useState<number>(0);
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
      label: "reset",
      value: 0,
    },
    {
      label: "0.01 ETH",
      value: 0.01,
    },
    {
      label: "0.02 ETH",
      value: 0.02,
    },
    {
      label: "0.05 ETH",
      value: 0.05,
    },
    {
      label: "0.1 ETH",
      value: 0.1,
    },
  ];

  const sellOptions = [
    {
      label: "reset",
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
        if (Number(trades[0].totalSupply) > 8e26) {
          setIsGraduate(1);
        }
        setHistoryList((v) => [...trades, ...v]);
      } else {
        setHistoryList((v) => [...v, ...trades].sort((a, b) => b.id - a.id));
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
    <div className="text-xs xl:text-sm">
      <Tabs
        fullWidth
        className="h-[40px]"
        size="lg"
        color={tabColor}
        selectedKey={tabKey}
        onSelectionChange={(key) => setTabKey(key)}
      >
        <Tab key={TabKeys.buy} title="Buy" />
        <Tab key={TabKeys.sell} title="Sell" />
      </Tabs>
      <div className="mt-6">
        {tabKey === TabKeys.buy && (
          <div>
            <div>
              <div className="mb-3 flex justify-between items-center">
                <span>Amount (ETH)</span>
                <Button
                  size="sm"
                  className="text-[#999] h-[26px]"
                  onPress={() => {
                    setEditSlippage(slippage);
                    setSlippageModalOpen(true);
                  }}
                >
                  set max slippage
                </Button>
              </div>
              <div>
                <Input
                  value={buyInputValue}
                  onChange={(e) => {
                    setBuyInputValue(e.target.value);
                  }}
                  type="number"
                  endContent={"ETH"}
                  autoFocus={false}
                />
              </div>
            </div>

            <div className="mt-4 mb-2 flex gap-1">
              {buyOptions.map((option, i) => {
                return (
                  <Chip
                    key={i}
                    size="sm"
                    className="cursor-pointer text-[10px] xl:text-xs"
                    onClick={() => {
                      setBuyInputValue(String(option.value));
                    }}
                  >
                    {option.label}
                  </Chip>
                );
              })}
            </div>
            {buyInputValue && !isGraduate && (
              <p className="text-xs text-gray-500">
                {detail?.symbol} received:{" "}
                {Number(
                  getEthBuyQuote(
                    Number(totalSupply) / 1e18,
                    Number(buyInputValue)
                  )
                ) / 1e18}
              </p>
            )}
            {/* Need to add BABT validation */}
            <Button
              fullWidth
              color="success"
              className="mt-2"
              onPress={handleBuy}
              isLoading={trading}
            >
              {trading ? "Trading..." : "Place trade"}
            </Button>
          </div>
        )}

        {tabKey === TabKeys.sell && (
          <div>
            <div>
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>Amount ({detail?.symbol})</div>
                  <div className="flex gap-2 items-center">
                    <div className="text-gray-300 text-sm">
                      {formatTokenBalance(tokenBalance)}
                    </div>
                    <Button
                      size="sm"
                      className="text-[#999] h-[26px]"
                      onPress={() => {
                        setEditSlippage(slippage);
                        setSlippageModalOpen(true);
                      }}
                    >
                      set max slippage
                    </Button>
                  </div>
                </div>
                <div>
                  <Input
                    value={sellInputValue}
                    onChange={(e) => {
                      setSellInputValue(e.target.value);
                    }}
                    type="number"
                    endContent={detail?.symbol}
                    autoFocus={false}
                  />
                </div>
              </div>

              <div className="mt-4 mb-2 flex gap-1">
                {sellOptions.map((option, i) => {
                  return (
                    <Chip
                      key={i}
                      size="sm"
                      className="cursor-pointer text-[10px] xl:text-xs"
                      onClick={async () => {
                        if (!address) {
                          toast("Please connect wallet first");
                          return;
                        }
                        const balance = await fetchTokenBalance(ca, address);
                        setSellInputValue(
                          String((Number(balance) / 1e18) * option.value)
                        );
                      }}
                    >
                      {option.label}
                    </Chip>
                  );
                })}
              </div>
            </div>
            {sellInputValue && !isGraduate && (
              <p className="text-xs text-gray-500">
                ETH received:{" "}
                {Number(
                  getTokenSellQuote(
                    Number(totalSupply) / 1e18,
                    Number(sellInputValue)
                  )
                ) / 1e18}
              </p>
            )}
            <Button
              fullWidth
              color="danger"
              className="mt-2"
              onPress={handleSell}
              isLoading={trading}
            >
              {trading ? "Trading..." : "Place trade"}
            </Button>
          </div>
        )}
      </div>
    </div>
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
    <div className={cn("px-4 pb-8", "xl:px-[7vw]")}>
      <Head>
        <title>{`${detail?.symbol} | hares.ai`}</title>
      </Head>
      <div className="my-6">
        <h1 className="text-medium break-all xl:text-lg">
          <span className="font-bold">{detail?.symbol}: </span>
          <span>{ca}</span>
        </h1>
        {isGraduate ? (
          <p className="text-green-400 mb-2">
            The token has already graduated and been migrated to the Uniswap V3
            pool.
          </p>
        ) : null}
      </div>
      <div className={cn("flex flex-col gap-6", "xl:flex-row")}>
        <div className="xl:flex-1">
          <TradingView
            className="w-full h-[500px] bg-black"
            symbol={detail.symbol}
            address={ca}
            ethPrice={ethPrice}
            onNewTrade={handleNewTrade}
          />
          <TradeList
            list={historyList}
            symbol={detail.symbol}
            className="hidden xl:block"
          />
        </div>
        <div className={cn("", "xl:w-[400px] xl:min-w-[400px]")}>
          <div
            className={cn("hidden", "xl:block bg-[#333] rounded-[16px] p-2")}
          >
            {tradeComponent}
          </div>

          <Info className="mt-8" detail={detail} />
          <TopHolders
            list={topHolders}
            className="mt-4"
            devAddress={detail.creatorAddress}
          />
        </div>

        <TradeList
          list={historyList}
          symbol={detail.symbol}
          className="xl:hidden"
        />

        <div
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
        </div>
      </div>

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
    </div>
  );
}
