import { formatThousandNumber } from "@/lib/utils";
import Image from "next/image";
import dayjs from "dayjs";
import React, { FC } from "react";
import Link from "next/link";
import { IToken } from "@/lib/types";

interface TokenProps {
  detail: IToken;
}

function Token({ detail }: TokenProps) {
  return (
    <Link href={`/coin/${detail?.address}`}>
      <div className="p-2 flex gap-2">
        <div>
          <div className="w-[100px] h-[100px] relative">{detail?.picture && <Image fill alt="" src={detail?.picture} />}</div>
        </div>
        <div>
          <div>created {dayjs().to(dayjs(detail?.created_at))}</div>
          <div className="text-green-400">market cap: ${formatThousandNumber(+detail?.marketCap)}</div>
          <div>
            <span className="font-bold mr-1">{detail?.name}:</span>
            <span>{detail?.desc || "-"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface TokenListProps {
  list: any[];
}

export const TokenList: FC<TokenListProps> = ({ list }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {list?.map((item, i) => {
        return <Token key={i} detail={item} />;
      })}
    </div>
  );
};
