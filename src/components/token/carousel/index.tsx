import { cn, formatThousandNumber, maskAddress } from "@/lib/utils";
import React, { FC, useMemo } from "react";
import Link from "next/link";
import { IToken } from "@/lib/types";
import styled from "@emotion/styled";
import Avatar from "boring-avatars";

interface TokenProps {
  detail: IToken;
}

function Carousel({ detail }: TokenProps) {
  return (
    <Link href={`/token/${detail?.address}`}>
      <StyledCarouselCard>
        <Avatar
          className="wallet-avatar"
          name={detail?.address}
          variant="beam"
        />
        <StyledTokenAddress>{maskAddress(detail?.address)}</StyledTokenAddress>
        <StyledTokenAction sell>Buy</StyledTokenAction>
        <StyledBNBReceived>0.3 BNB of</StyledBNBReceived>
        <StyledTokenPic src={detail?.picture} alt="" />
        <StyledTokenName>
          {detail?.name}({detail?.symbol})
        </StyledTokenName>
      </StyledCarouselCard>
    </Link>
  );
}

interface TokenListProps {
  list: any[];
}

export const TokenCarousel: FC<TokenListProps> = ({ list }) => {
  return (
    <StyledTokenCarousel>
      <StyledTokenCarouselContainer>
        {list?.map((item, i) => {
          return <Carousel key={i} detail={item} />;
        })}
      </StyledTokenCarouselContainer>
    </StyledTokenCarousel>
  );
};

const StyledTokenCarousel = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StyledTokenCarouselContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
`;

const StyledCarouselCard = styled.div`
  padding: 0 32px;
  display: flex;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  gap: 4px;
  .wallet-avatar {
    width: 16px;
    height: 16px;
  }
`;

const StyledTokenAddress = styled.span`
  overflow: hidden;
  color: #eaecef;
  text-overflow: ellipsis;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 120%; /* 14.4px */
  opacity: 0.5;
`;

const StyledTokenAction = styled.span<{ sell: boolean }>`
  overflow: hidden;
  color: ${({ sell }) => (sell ? "#f31260" : "#05DD6B")};
  text-overflow: ellipsis;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 120%; /* 14.4px */
`;

const StyledBNBReceived = styled.span`
  overflow: hidden;
  color: #eaecef;
  text-overflow: ellipsis;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 120%; /* 14.4px */
  opacity: 0.5;
`;

const StyledTokenPic = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 6.667px;
  object-fit: cover;
`;

const StyledTokenName = styled.h3`
  overflow: hidden;
  color: #eaecef;
  text-overflow: ellipsis;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 120%; /* 16.8px */
  opacity: 0.8;
`;
