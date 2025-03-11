import {
  cn,
  formatNumber,
  formatThousandNumber,
  getTokenMarketCap,
  maskAddress,
  parseMetadata,
} from "@/lib/utils";
import Image from "next/image";
import dayjs from "dayjs";
import React, { FC, useMemo } from "react";
import Link from "next/link";
import { IToken } from "@/lib/types";
import { Button } from "@heroui/react";
import styled from "@emotion/styled";
import XIcon from "~@/icons/x.svg";
import TGIcon from "~@/icons/tg.svg";
import WebsiteIcon from "~@/icons/website.svg";
import HoverFlipCard from "@/components/common/flip-card";
import ShinyCard from "@/components/common/shiny";
import { useGlobalCtx } from "@/context/useGlobalCtx";
import { useAppContext } from "@/context/useAppContext";

interface TokenProps {
  detail: IToken;
}

function Token({ detail }: TokenProps) {
  const { isMobile } = useGlobalCtx();
  const { ethPrice } = useAppContext();

  const metadata = useMemo(() => {
    if (!detail?.metadata) return {};
    return parseMetadata(detail.metadata);
  }, [detail.metadata]);

  const marketCap = useMemo(() => {
    if (!ethPrice || !detail) return "-";
    return formatNumber(
      getTokenMarketCap(BigInt(detail?.totalSupply ?? "0"), ethPrice)
    );
  }, [detail, ethPrice]);

  const socialMedias = useMemo(() => {
    return [
      {
        name: "twitter",
        url: metadata?.twitter || "",
        icon: <XIcon />,
      },
      {
        name: "telegram",
        url: metadata?.telegram || "",
        icon: <TGIcon />,
      },
      {
        name: "website",
        url: metadata?.website || "",
        icon: <WebsiteIcon />,
      },
    ].filter((item) => !!item.url);
  }, [metadata]);

  return (
    <Link href={`/token/${detail?.address}`}>
      <StyledTokenCard>
        <StyledTokenCardPic>
          <StyledTokenCardPicContainer>
            {metadata?.image && <img src={metadata?.image} alt="" />}
          </StyledTokenCardPicContainer>
        </StyledTokenCardPic>
        <StyledTokenContent>
          <StyledTokenInfo>
            <StyledTokenName title={`${detail?.name}($${detail?.symbol})`}>
              {detail?.name}(${detail?.symbol})
            </StyledTokenName>
            <StyledTokenCA>CA: {maskAddress(detail?.address)}</StyledTokenCA>
            <StyledTokenDesc>{metadata?.desc || "-"}</StyledTokenDesc>
          </StyledTokenInfo>
          <StyledTokenPublic>
            <StyledTokenMCA>MC: ${marketCap}</StyledTokenMCA>
            {!!socialMedias.length && (
              <StyledTokenSocialBox>
                {socialMedias.map((item, index) => {
                  return (
                    <StyledTokenSocialBtn key={index}>
                      <StyledTokenSocialLink href={item.url} target="_blank">
                        {item.icon}
                      </StyledTokenSocialLink>
                    </StyledTokenSocialBtn>
                  );
                })}
              </StyledTokenSocialBox>
            )}
          </StyledTokenPublic>
        </StyledTokenContent>
      </StyledTokenCard>
    </Link>
  );
}

interface TokenListProps {
  list: any[];
}

export const TokenList: FC<TokenListProps> = ({ list }) => {
  return (
    <StyledTokenList>
      {list?.map((item, i) => {
        return (
          <HoverFlipCard key={i}>
            <Token detail={item} />
          </HoverFlipCard>
        );
      })}
    </StyledTokenList>
  );
};

const StyledTokenList = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
  @media screen and (max-width: 1200px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
  @media screen and (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`;

const StyledTokenCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid transparent;
  background: #020202;
  padding: 12px;
  border: 1px solid rgba(234, 236, 239, 0.2);
  &::before {
    content: "";
    position: absolute;
    top: 12px;
    left: 0;
    width: 1px;
    height: calc(100% - 24px);
    background-image: linear-gradient(
      to bottom,
      rgba(234, 236, 239, 0.12) 30%,
      rgba(255, 255, 255, 0.4) 80%,
      rgba(234, 236, 239, 0.12)
    );
    @media screen and (max-width: 1024px) {
      width: 0.5px;
      top: 8px;
      height: calc(100% - 16px);
      background-image: linear-gradient(
        to bottom,
        rgba(234, 236, 239, 0.12) 30%,
        rgba(255, 255, 255, 0.4) 80%,
        rgba(234, 236, 239, 0.12)
      );
    }
  }
  &::after {
    content: "";
    position: absolute;
    top: 12px;
    right: 0;
    width: 1px;
    height: calc(100% - 24px);
    background-image: linear-gradient(
      to bottom,
      rgba(234, 236, 239, 0.12) 0%,
      rgba(255, 255, 255, 0.8) 40%,
      rgba(234, 236, 239, 0.12)
    );
    @media screen and (max-width: 1024px) {
      width: 0.5px;
      top: 8px;
      height: calc(100% - 16px);
      background-image: linear-gradient(
        to bottom,
        rgba(234, 236, 239, 0.12) 0%,
        rgba(255, 255, 255, 0.8) 30%,
        rgba(234, 236, 239, 0.12)
      );
    }
  }
  // background-image: url(/card-border.png);
  // background-size: cover;
  // background-repeat: no-repeat;

  @media screen and (max-width: 1024px) {
    padding: 0;
    height: 92px;
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: 10px;
    border: 0.5px solid rgba(234, 236, 239, 0.2);
    background: rgba(255, 255, 255, 0.04);
  }
`;
const StyledTokenCardPic = styled.div`
  position: relative;
  padding-top: 100%;
  overflow: hidden;

  @media screen and (max-width: 1024px) {
    padding: 6px;
    width: 92px;
    height: 92px;
  }
`;

const StyledTokenCardPicContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(
    151deg,
    rgba(234, 236, 239, 0.1) 0%,
    rgba(234, 236, 239, 0) 50.75%
  );
  z-index: 1;
  > img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  @media screen and (max-width: 1024px) {
    position: static;
    background: rgba(255, 255, 255, 0.04);
    > img {
      position: relative;
      border-radius: 4px;
    }
  }
`;

const StyledTokenContent = styled.div`
  display: flex;
  flex-direction: column;
  @media screen and (max-width: 1024px) {
    flex: 1;
    flex-shrink: 0;
    min-width: 0;
    height: 100%;
    padding: 12px 0;
    padding-left: 6px;
    padding-right: 12px;
  }
`;

const StyledTokenInfo = styled.div`
  padding-top: 12px;
  padding-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid #1e1e1e;
  @media screen and (max-width: 1024px) {
    padding: 0;
    border-bottom: none;
  }
`;

const StyledTokenName = styled.h3`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  text-transform: uppercase;

  background: linear-gradient(97deg, #fff -3.13%, #fff 22.25%, #696969 100.44%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StyledTokenCA = styled.p`
  color: rgba(234, 236, 239, 0.25);
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

const StyledTokenDesc = styled.p`
  color: #eaecef;
  font-size: 13px;
  font-style: normal;
  height: 38px;
  font-weight: 400;
  line-height: 140%; /* 18.415px */
  opacity: 0.6;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;

  @media screen and (max-width: 1024px) {
    display: none;
  }
`;

const StyledTokenPublic = styled.div`
  padding-top: 8px;
  display: flex;
  align-items: center;
  @media screen and (max-width: 1024px) {
    padding: 0;
    flex: 1;
    display: flex;
    align-items: flex-end;
  }
`;

const StyledTokenMCA = styled.b`
  flex: 1;
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px; /* 15.4px */
  background: linear-gradient(90deg, #ffc720 0%, #fcd535 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media screen and (max-width: 1024px) {
    font-size: 12px;
  }
`;

const StyledTokenSocialBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  @media screen and (max-width: 1024px) {
    gap: 6px;
  }
`;

const StyledTokenSocialBtn = styled.div`
  padding: 0;
  width: 20px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: rgba(234, 236, 239, 0.1);
  svg {
    width: 10px;
    height: 10px;
    color: #eaecef;
    opacity: 0.4;
  }
  &:hover {
    color: rgba(234, 236, 239, 1);
    svg {
      opacity: 1;
    }
  }

  @media screen and (max-width: 1024px) {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: rgba(234, 236, 239, 0.1);
    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

const StyledTokenSocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 100%;
  text-decoration: none;
  pointer-events: auto;
`;
