import { Tabs, Tab, Button, Input, Chip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Info } from "@/components/info";
import { TVChart } from "@/components/tvchart";
import { tokenApi } from "@/lib/apis";
import { useFarcasterContext } from "@/hooks/farcaster";
import { IToken } from "@/lib/types";
import dayjs from "dayjs";
import { formatThousandNumber } from "@/lib/utils";

const TabKeys = {
  buy: "buy",
  sell: "sell",
};

export default function Token() {
  const { login } = useFarcasterContext();
  const router = useRouter();
  const { slug: ca } = router.query as { slug: string };

  console.log("ca", ca);

  const [detail, setDetail] = useState<IToken>();

  const [buyInputValue, setBuyInputValue] = useState<string>();
  const [sellInputValue, setSellInputValue] = useState<string>();

  const [tabKey, setTabKey] = useState<string | number>(TabKeys.buy);

  const tabColor = tabKey === "buy" ? "success" : "danger";

  const buyOptions = [
    {
      label: "reset",
      value: 0,
    },
    {
      label: "0.1 ETH",
      value: 0.1,
    },
    {
      label: "0.5 ETH",
      value: 0.5,
    },
    {
      label: "1ETH",
      value: 1,
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

  async function fetchToken(ca: string) {
    const res = await tokenApi({
      address: ca,
    });

    console.log(res);
    setDetail(res?.data);
  }

  function handleBuy() {
    console.log("handleBuy");
    login();
  }

  useEffect(() => {
    if (ca) {
      fetchToken(ca);
    }
  }, [ca]);

  return (
    <div>
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="mb-4">
            <div className="flex gap-2 items-center">
              <div>
                {detail?.name} ({detail?.symbol})
              </div>
              <div>created {dayjs().to(dayjs(detail?.created_at))}</div>
              <div className="text-green-400">market cap: ${formatThousandNumber(+(detail?.marketCap || ""))}</div>
            </div>
          </div>
          <TVChart />
        </div>

        <div>
          <div className="w-[350px] bg-[#333] rounded-md p-2">
            <Tabs fullWidth className="h-[40px]" size="lg" color={tabColor} selectedKey={tabKey} onSelectionChange={(key) => setTabKey(key)}>
              <Tab key={TabKeys.buy} title="Buy" />
              <Tab key={TabKeys.sell} title="Sell" />
            </Tabs>

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

                  <div className="mt-4 mb-2 flex gap-2">
                    {buyOptions.map((option, i) => {
                      return (
                        <Chip
                          key={i}
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => {
                            setBuyInputValue(String(option.value));
                          }}
                        >
                          {option.label}
                        </Chip>
                      );
                    })}
                  </div>

                  <Button fullWidth color="success" className="mt-2" onPress={handleBuy}>
                    place trade
                  </Button>
                </div>
              )}

              {tabKey === TabKeys.sell && (
                <div>
                  <div>
                    <div>
                      <div className="mb-1">amount ({detail?.symbol})</div>
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

                    <div className="mt-4 mb-2 flex gap-2">
                      {sellOptions.map((option, i) => {
                        return (
                          <Chip
                            key={i}
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => {
                              // setSellInputValue(String(option.value));
                            }}
                          >
                            {option.label}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>

                  <Button fullWidth color="danger" className="mt-2">
                    place trade
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Info className="mt-4" detail={detail} />
        </div>
      </div>
    </div>
  );
}
