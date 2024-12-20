import { TopHolder } from "@/lib/types";
import { cn, formatTokenBalance, maskAddress } from "@/lib/utils";
import React from "react";

interface TopHoldersProps {
  list: TopHolder[];
  className?: string;
}

export const TopHolders = ({ list, className }: TopHoldersProps) => {
  return (
    <div className={cn(className)}>
      <div className="font-bold mb-2">top 10 holders</div>
      <ol>
        {(list || [])?.map((item, index) => {
          return (
            <li key={index} className="flex items-center justify-between">
              <div>{maskAddress(item.addrses)}</div>
              <div>{formatTokenBalance(item.balance)}</div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
