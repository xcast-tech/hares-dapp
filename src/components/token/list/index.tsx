import { cn, formatThousandNumber, maskAddress } from "@/lib/utils";
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

interface TokenProps {
  detail: IToken;
}

function Token({ detail }: TokenProps) {
  const { isMobile } = useGlobalCtx();
  const socialMedias = useMemo(() => {
    return [
      {
        name: "twitter",
        url: detail?.twitter || "1",
        icon: <XIcon />,
      },
      {
        name: "telegram",
        url: detail?.telegram || "1",
        icon: <TGIcon />,
      },
      {
        name: "website",
        url: detail?.website || "1",
        icon: <WebsiteIcon />,
      },
    ].filter((item) => !!item.url);
  }, [detail]);

  return (
    <Link href={`/token/${detail?.address}`}>
      <ShinyCard color="#fff" disabled={isMobile} radius={16} duration={5}>
        <StyledTokenCard>
          <StyledTokenCardPic>
            <StyledTokenCardPicContainer>
              {detail?.picture && <img src={detail?.picture} alt="" />}
            </StyledTokenCardPicContainer>
          </StyledTokenCardPic>
          <StyledTokenContent>
            <StyledTokenInfo>
              <StyledTokenName>
                {detail?.name}({detail?.symbol})
              </StyledTokenName>
              <StyledTokenCA>CA: {maskAddress(detail?.address)}</StyledTokenCA>
              <StyledTokenDesc>{detail?.desc || "-"}</StyledTokenDesc>
            </StyledTokenInfo>
            <StyledTokenPublic>
              <StyledTokenMCA>MC: ${detail?.marketCap}</StyledTokenMCA>
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
      </ShinyCard>
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
  grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
  gap: 16px;
  @media screen and (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`;

const StyledTokenCard = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(234, 236, 239, 0.12);
  background: #020202;
  padding: 12px;

  @media screen and (max-width: 1024px) {
    padding: 0;
    height: 92px;
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: 10px;
    border: 0.5px solid rgba(234, 236, 239, 0.12);
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
    > img {
      position: relative;
      border-radius: 4px;
    }
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
  }
`;

const StyledTokenContent = styled.div`
  display: flex;
  flex-direction: column;
  @media screen and (max-width: 1024px) {
    flex: 1;
    flex-shrink: 0;
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
  font-size: 18px;
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
  font-size: 10px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%; /* 14px */
  opacity: 0.6;
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
  line-height: 140%; /* 15.4px */
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
