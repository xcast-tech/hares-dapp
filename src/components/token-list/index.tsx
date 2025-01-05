import { cn, formatThousandNumber } from "@/lib/utils";
import Image from "next/image";
import dayjs from "dayjs";
import React, { FC } from "react";
import Link from "next/link";
import { IToken } from "@/lib/types";
import { Card } from "@nextui-org/react";

interface TokenProps {
  detail: IToken;
}

function Token({ detail }: TokenProps) {
  return (
    <Link href={`/token/${detail?.address}`}>
      <Card>
        <div className="p-3 flex gap-[10px]  h-[144px]">
          <div>
            <div className="w-[120px] h-[120px] relative">{detail?.picture && <Image fill alt="" src={detail?.picture} />}</div>
          </div>
          <div>
            <div className="text-[16px] font-semibold">{detail?.name}</div>
            <div className="text-[#999] text-[12px]">created {dayjs().to(dayjs(detail?.created_timestamp * 1000))}</div>
            {/* <div className="text-green-400">market cap: ${formatThousandNumber(+detail?.marketCap)}</div> */}
            <div>
              <span className="break-all line-clamp-3 text-[14px] font-normal">{detail?.desc || "-"}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

interface TokenListProps {
  list: any[];
}

export const TokenList: FC<TokenListProps> = ({ list }) => {
  return (
    <div className={cn("grid grid-cols-1 gap-4", "xl:grid-cols-3")}>
      {list?.map((item, i) => {
        return <Token key={i} detail={item} />;
      })}
    </div>
  );
};
