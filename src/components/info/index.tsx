import React, { FC } from "react";
import Image from "next/image";
import copy from "copy-to-clipboard";
import { twMerge } from "tailwind-merge";
import { Twitter } from "../twitter";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import { Telegram } from "../telegram";
import { Website } from "../website";
import { Copy } from "../copy";
import { getTokenSellQuote, maskAddress } from "@/lib/utils";
import { toast } from "react-toastify";
import { IToken } from "@/lib/types";

interface InfoProps {
  className?: string;
  detail?: IToken;
}

export const Info: FC<InfoProps> = ({ detail, className }) => {
  const currentEth = detail ? (detail?.isGraduate ? 4.4 : Number(getTokenSellQuote(Number(detail?.totalSupply) / 1e18, Number(detail?.totalSupply) / 1e18)) / 1e18) : 0
  return (
    <div className={twMerge(className)}>
      <div className={twMerge("flex gap-2")}>
        <div className="w-[100px] min-w-[100px] h-[100px] relative">{detail?.picture && <Image fill alt="" src={detail?.picture} />}</div>

        <div>
          <div className="font-bold">{detail?.name}</div>
          <div className="text-[12px] break-all">{detail?.desc}</div>
        </div>
      </div>

      <div className="my-4 grid grid-cols-3 gap-2">
        {detail?.twitter && (
          <Link target="_blank" href={detail?.twitter || ""} className="w-full">
            <Button fullWidth startContent={<Twitter />} size="sm">
              twitter
            </Button>
          </Link>
        )}

        {detail?.telegram && (
          <Link target="_blank" href={detail?.telegram || ""} className="w-full">
            <Button fullWidth startContent={<Telegram />} size="sm">
              telegram
            </Button>
          </Link>
        )}

        {detail?.website && (
          <Link target="_blank" href={detail?.website || ""} className="w-full">
            <Button fullWidth startContent={<Website />} size="sm">
              website
            </Button>
          </Link>
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
      {detail && 
        <>
          <div className="h-1 w-full bg-gray-500 mt-3 rounded-sm">
            <div className="h-full w-full bg-green-400 rounded-sm" style={{width: `${currentEth / 4.4 * 100}%`}}></div>
          </div>
          <p className="text-xs mt-1">Bonding curve progress: {currentEth.toFixed(2)} / 4.4 ETH</p>
        </>
      }
    </div>
  );
};
