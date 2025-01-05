import React, { FC } from "react";
import Image from "next/image";
import copy from "copy-to-clipboard";
import { twMerge } from "tailwind-merge";
import { Button } from "@nextui-org/react";
import { Telegram } from "../telegram";
import { Website } from "../website";
import { Copy } from "../copy";
import { getTokenSellQuote, maskAddress } from "@/lib/utils";
import { toast } from "react-toastify";
import { IToken } from "@/lib/types";
import dayjs from "dayjs";
import { Twitter2 } from "../twitter2";

interface InfoProps {
  className?: string;
  detail?: IToken;
}

export const Info: FC<InfoProps> = ({ detail, className }) => {
  const currentEth = detail ? (detail?.isGraduate ? 4.4 : Number(getTokenSellQuote(Number(detail?.totalSupply) / 1e18, Number(detail?.totalSupply) / 1e18)) / 1e18) : 0;
  return (
    <div className={twMerge(className)}>
      <div className="flex gap-2.5">
        <div className="w-[120px] min-w-[120px] h-[120px] relative">{detail?.picture && <Image fill alt="" src={detail?.picture} />}</div>
        <div className="flex flex-col gap-1">
          <div className="font-bold">{detail?.name}</div>
          <div className="text-xs text-[#999]">Created at {dayjs().to(dayjs((detail?.created_timestamp ?? 0) * 1000))}</div>
          <div className="text-xs break-all">{detail?.desc}</div>
        </div>
      </div>

      <div className="my-4 flex items-center gap-2">
        {detail?.twitter && (
          <Button
            fullWidth
            startContent={<Twitter2 />}
            size="sm"
            onPress={() => {
              window.open(detail?.twitter ?? "", "_blank");
            }}
          >
            twitter
          </Button>
        )}

        {detail?.telegram && (
          <Button
            fullWidth
            startContent={<Telegram />}
            size="sm"
            onPress={() => {
              window.open(detail?.telegram ?? "", "_blank");
            }}
          >
            telegram
          </Button>
        )}

        {detail?.website && (
          <Button
            fullWidth
            startContent={<Website />}
            size="sm"
            onPress={() => {
              window.open(detail?.website ?? "", "_blank");
            }}
          >
            website
          </Button>
        )}
      </div>

      <Button
        fullWidth
        endContent={<Copy />}
        size="sm"
        className="hover:underline"
        onPress={() => {
          copy(detail?.address ?? "");
          toast("copied to clipboard");
        }}
      >
        <div className="flex-1">contract address: {maskAddress(detail?.address)}</div>
      </Button>
      {detail && (
        <>
          <div className="h-1 w-full bg-gray-500 mt-3 rounded-[4px] overflow-hidden">
            <div className="h-full w-full bg-green-400" style={{ width: `${(currentEth / 4.4) * 100}%` }}></div>
          </div>
          <p className="text-xs mt-1">Bonding curve progress: {currentEth.toFixed(2)} / 4.4 ETH</p>
        </>
      )}
    </div>
  );
};
