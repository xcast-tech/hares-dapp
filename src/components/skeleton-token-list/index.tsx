import { cn } from "@/lib/utils";
import { Card, Skeleton } from "@nextui-org/react";
import React, { FC } from "react";

interface TokenProps {}

function Token({}: TokenProps) {
  return (
    <Card className="p-3 h-[144px]" radius="lg">
      <div className="flex gap-[10px]">
        <Skeleton className="">
          <div className="h-[120px] aspect-square  bg-default-300" />
        </Skeleton>

        <div className="space-y-3 flex-1">
          <Skeleton className="w-4/5 ">
            <div className="h-6 w-6/7  bg-default-200" />
          </Skeleton>
          <Skeleton className="w-3/5 ">
            <div className="h-6 w-6/7  bg-default-200" />
          </Skeleton>
          <Skeleton className="w-2/5 ">
            <div className="h-6 w-5/7  bg-default-300" />
          </Skeleton>
        </div>
      </div>
    </Card>
  );
}

interface TokenListProps {
  list: any[];
  className?: string;
}

export const SkeletonTokenList: FC<TokenListProps> = ({ list, className }) => {
  return (
    <div className={cn("grid grid-cols-1 gap-4", "xl:grid-cols-3", className)}>
      {list?.map((item, i) => {
        return <Token key={i} />;
      })}
    </div>
  );
};
