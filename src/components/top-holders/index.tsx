import { Address, TopHolder } from "@/lib/types";
import { cn, formatTokenBalance, maskAddress } from "@/lib/utils";
import { Chip } from "@nextui-org/react";
import React from "react";

interface TopHoldersProps {
  list: TopHolder[];
  className?: string;
  devAddress?: string;
}

export const TopHolders = ({ list, className, devAddress = "" }: TopHoldersProps) => {
  return (
    <div className={cn(className)}>
      <div className="font-bold mb-2">Top 10 holders</div>
      <ol>
        {(list || [])?.map((item, index) => {
          return (
            <li key={index} className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div>{maskAddress(item.addrses)}</div>
                {(devAddress || "")?.toLocaleLowerCase() === item.addrses.toLocaleLowerCase() && (
                  <Chip color="secondary" variant="solid" size="sm">
                    DEV
                  </Chip>
                )}
              </div>

              <div>{formatTokenBalance(item.balance)}</div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
