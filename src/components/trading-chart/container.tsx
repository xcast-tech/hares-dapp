import { useContext, useEffect, useRef, useState } from "react";
import {
  ChartingLibraryWidgetOptions,
  HistoryCallback,
  IChartingLibraryWidget,
  IDatafeedChartApi,
  LanguageCode,
  ResolutionString,
  SearchSymbolResultItem,
  widget,
} from "~@/libraries/charting_library";
import { chartOverrides, disabledFeatures, enabledFeatures } from "./constants";
import { getDataFeed } from "./datafeed";
import ReactLoading from "react-loading";
import { twMerge } from "tailwind-merge";
import { useGlobalCtx } from "@/context/useGlobalCtx";
import { useAppContext } from "@/context/useAppContext";
import { Trade } from "@/lib/types";

export type TVChartContainerProps = {
  name: string;
  pairIndex: number;
  token: `0x${string}`;
  defaultTrades: Trade[];
  classNames?: {
    container: string;
  };
  tradesCallBack: (trades: Trade[]) => void;
};

export const TVChartContainer = ({
  name,
  pairIndex,
  token,
  defaultTrades,
  tradesCallBack,
}: TVChartContainerProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(
    null
  ) as React.MutableRefObject<HTMLInputElement>;
  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);
  const { tradingLoading, setTradingLoading } = useGlobalCtx();
  const { ethPrice, bnbPrice } = useAppContext();

  useEffect(() => {
    if (!ethPrice) return;
    if (!chartContainerRef.current) {
      return () => {};
    }
    if (tvWidgetRef.current) {
      tvWidgetRef.current.remove();
    }
    const elem = chartContainerRef.current;
    // console.log("localhost host", location.host);
    if (name) {
      const widgetOptions: ChartingLibraryWidgetOptions = {
        symbol: name,
        debug: false,
        datafeed: getDataFeed({
          pairIndex,
          name,
          token,
          nativeTokenPrice: ethPrice,
          defaultTrades,
          tradesCallBack,
        }),
        theme: "dark",
        locale: "en",
        container: elem,
        library_path: `/libraries/charting_library/`,
        loading_screen: {
          backgroundColor: "#111114",
          foregroundColor: "#111114",
        },
        enabled_features: enabledFeatures,
        disabled_features: disabledFeatures,
        // client_id: "tradingview.com",
        // user_id: "public_user_id",
        fullscreen: false,
        autosize: true,
        custom_css_url: "/tradingview-chart.css",
        overrides: chartOverrides,
        interval: "5" as ResolutionString,
      };

      tvWidgetRef.current = new widget(widgetOptions);
      tvWidgetRef.current.onChartReady(function () {
        setTradingLoading(false);
        const priceScale = tvWidgetRef.current
          ?.activeChart()
          .getPanes()[0]
          .getMainSourcePriceScale();
        priceScale?.setAutoScale(true);
      });

      return () => {
        if (tvWidgetRef.current) {
          tvWidgetRef.current.remove();
        }
      };
    }
  }, [name, pairIndex, ethPrice]);

  return (
    <div className="relative h-full w-full">
      {tradingLoading ? (
        <div className="z-9999 absolute left-0 top-0 flex h-full w-full items-center justify-center bg-tizz-background">
          <ReactLoading
            height={20}
            width={50}
            type={"bars"}
            color={"#36d7b7"}
          />
        </div>
      ) : null}
      <div ref={chartContainerRef} className={twMerge("h-full w-full")} />
    </div>
  );
};
