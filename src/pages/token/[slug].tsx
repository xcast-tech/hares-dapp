import { Tabs, Tab, Button, Input, Chip, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { useRouter } from "next/router";
import { use, useEffect, useState } from "react";
import { Info } from "@/components/info";
import { TVChart } from "@/components/tvchart";
import { getHistoryApi, tokenApi } from "@/lib/apis";
import { useFarcasterContext } from "@/hooks/farcaster";
import { Address, IToken, Trade } from "@/lib/types";
import dayjs from "dayjs";
import { formatNumber, formatThousandNumber, getEthBuyQuote, getHost, getKChartData, getTokenSellQuote } from "@/lib/utils";
import { useContract } from "@/hooks/useContract";
import { toast } from "react-toastify";
import { useSignInMessage } from "@farcaster/auth-kit";
import { useAccount } from "wagmi";
import Decimal from "decimal.js";
import { useAppContext } from "@/context/useAppContext";
import Script from "next/script";
import TradingView from "@/components/tradingview";
import Head from "next/head";

const TabKeys = {
  buy: "buy",
  sell: "sell",
};

export default function Token() {
  const { ethPrice } = useAppContext();
  const { login } = useFarcasterContext();
  const { buy, sell, getTokenBalance } = useContract();
  const { message, signature } = useSignInMessage();
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const router = useRouter();
  const { slug } = router.query as { slug: Address };
  const ca = (slug || "").toLocaleLowerCase() as Address;
  const { address } = useAccount();

  const [slippage, setSlippage] = useState("20");
  const [editSlippage, setEditSlippage] = useState("");
  const [historyList, setHistoryList] = useState<Trade[]>([]);

  const [detail, setDetail] = useState<IToken>();

  const [buyInputValue, setBuyInputValue] = useState<string>();
  const [sellInputValue, setSellInputValue] = useState<string>();

  const [tabKey, setTabKey] = useState<string | number>(TabKeys.buy);

  const [slippageModalOpen, setSlippageModalOpen] = useState(false);

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

  async function fetchHistory(ca: Address) {
    const res = await getHistoryApi({ address: ca.toLocaleLowerCase() as Address });
    console.log("getHistoryApi", res);
    setHistoryList(res?.data ?? []);
  }

  async function fetchToken(ca: string) {
    const res = await tokenApi({
      address: ca,
    });

    console.log(res);
    setDetail(res?.data);
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
      const tx = await buy(ca, amount, +slippage / 100);
      toast(`Buy success. tx: ${tx}`);
    } catch (error: any) {
      toast(error?.message);
    } finally {
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
      const tx = await sell(ca, amount, +slippage / 100);
      toast(`Sell success. tx: ${tx}`);
    } catch (error: any) {
      toast(error?.message);
    } finally {
      fetchTokenBalance(ca, address);
    }
  }

  async function fetchTokenBalance(ca: Address, address: Address) {
    const balance = await getTokenBalance(ca, address);
    console.log("balance", balance);
    setTokenBalance(balance);
    return balance;
  }

  const onOpenChange = (open: boolean) => {
    setSlippageModalOpen(open);
  };

  useEffect(() => {
    if (ca) {
      fetchToken(ca);
      fetchHistory(ca);
    }
  }, [ca]);

  useEffect(() => {
    console.log("ca address", { ca, address });
    if (ca && address) {
      fetchTokenBalance(ca, address);
    }
  }, [ca, address]);

  return (
    <div className="px-[7vw]">
      <Head>
        <title>{detail?.symbol} | hares.ai</title>
      </Head>
      <Script strategy="beforeInteractive" src="/scripts/charting_library.standalone.js"></Script>
      { detail && <h1 className="text-lg py-2 font-bold">{detail?.symbol}: {ca}</h1> }
      { detail && detail.isGraduate && <p className="text-green-400 mb-2 font-bold">The token has already graduated and been migrated to the Uniswap V3 pool.</p> }
      <div className="flex gap-4">
        <div className="flex-1">{!!ethPrice && detail?.symbol && <TradingView className="w-full h-[500px]" symbol={detail.symbol} address={ca} ethPrice={ethPrice} />}</div>

        <div className="w-[350px]">
          <div className="bg-[#333] rounded-md p-2">
            <Tabs fullWidth className="h-[40px]" size="lg" color={tabColor} selectedKey={tabKey} onSelectionChange={(key) => setTabKey(key)}>
              <Tab key={TabKeys.buy} title="Buy" />
              <Tab key={TabKeys.sell} title="Sell" />
            </Tabs>

            <div className="w-full my-4 flex justify-end">
              <Button
                size="sm"
                onPress={() => {
                  setEditSlippage(slippage);
                  setSlippageModalOpen(true);
                }}
              >
                set max slippage
              </Button>
            </div>

            <div className="mt-4">
              {tabKey === TabKeys.buy && (
                <div>
                  <div>
                    <div className="mb-1">amount (ETH)</div>
                    <div>
                      <Input
                        value={buyInputValue}
                        onChange={(e) => {
                          setBuyInputValue(e.target.value);
                        }}
                        type="number"
                        endContent={"ETH"}
                      />
                    </div>
                  </div>

                  <div className="mt-4 mb-2 flex gap-1">
                    {buyOptions.map((option, i) => {
                      return (
                        <Chip
                          key={i}
                          size="sm"
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            setBuyInputValue(String(option.value));
                          }}
                        >
                          {option.label}
                        </Chip>
                      );
                    })}
                  </div>
                  {buyInputValue && Number(detail?.totalSupply) < 8e26 && <p className="text-xs text-gray-500">{detail?.symbol} received: {Number(getEthBuyQuote(Number(detail?.totalSupply) / 1e18, Number(buyInputValue))) / 1e18}</p>}
                  <Button fullWidth color="success" className="mt-2" onPress={handleBuy}>
                    place trade
                  </Button>
                  {/* {detail?.isGraduate || signature ? (
                    <Button fullWidth color="success" className="mt-2" onPress={handleBuy}>
                      place trade
                    </Button>
                  ) : (
                    <Button fullWidth color="success" className="mt-2" onPress={login}>
                      sign in first
                    </Button>
                  )} */}
                </div>
              )}

              {tabKey === TabKeys.sell && (
                <div>
                  <div>
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <div>amount ({detail?.symbol})</div>

                        <div>{formatNumber(tokenBalance)}</div>
                      </div>
                      <div>
                        <Input
                          value={sellInputValue}
                          onChange={(e) => {
                            setSellInputValue(e.target.value);
                          }}
                          type="number"
                          endContent={detail?.symbol}
                        />
                      </div>
                    </div>

                    <div className="mt-4 mb-2 flex gap-1">
                      {sellOptions.map((option, i) => {
                        return (
                          <Chip
                            key={i}
                            size="sm"
                            className="cursor-pointer text-xs"
                            onClick={async () => {
                              if (!address) {
                                toast("Please connect wallet first");
                                return;
                              }

                              const balance = await fetchTokenBalance(ca, address);

                              setSellInputValue(String(Decimal.mul(balance, option.value)));
                            }}
                          >
                            {option.label}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>
                  {sellInputValue && Number(detail?.totalSupply) < 8e26 && <p className="text-xs text-gray-500">ETH received: {Number(getTokenSellQuote(Number(detail?.totalSupply) / 1e18, Number(sellInputValue))) / 1e18}</p>}

                  <Button fullWidth color="danger" className="mt-2" onPress={handleSell}>
                    place trade
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Info className="mt-4" detail={detail} />
        </div>
      </div>

      <Modal isOpen={slippageModalOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">set max. slippage (%)</ModalHeader>
              <ModalBody>
                <div>
                  <Input
                    type="number"
                    value={editSlippage}
                    onChange={(event) => {
                      setEditSlippage(event.target.value);
                    }}
                  />
                  <div className="text-xs mt-1">this is the maximum amount of slippage you are willing to accept when placing trades.</div>
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
