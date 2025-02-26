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

interface TokenProps {
  detail: IToken;
}

function Token({ detail }: TokenProps) {
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
      <StyledTokenCard>
        <StyledTokenCardPic>
          <img src={detail?.picture} alt="" />
        </StyledTokenCardPic>
        <StyledTokenInfo>
          <StyledTokenName>
            {detail?.name}({detail?.symbol})
          </StyledTokenName>
          <StyledTokenCA>CA: {maskAddress(detail?.address)}</StyledTokenCA>
          <StyledTokenDesc>{detail?.desc || "no desc"}</StyledTokenDesc>
        </StyledTokenInfo>
        <StyledTokenPublic>
          <StyledTokenMCA>MC: ${detail?.marketCap}</StyledTokenMCA>
          {!!socialMedias.length && (
            <StyledTokenSocialBox>
              {socialMedias.map((item, index) => {
                return (
                  <StyledTokenSocialBtn key={index} fullWidth>
                    <StyledTokenSocialLink href={item.url} target="_blank">
                      {item.icon}
                    </StyledTokenSocialLink>
                  </StyledTokenSocialBtn>
                );
              })}
            </StyledTokenSocialBox>
          )}
        </StyledTokenPublic>
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
        return <Token key={i} detail={item} />;
      })}
    </StyledTokenList>
  );
};

const StyledTokenList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
  gap: 16px;
`;

const StyledTokenCard = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid #eaecef;
  background: #020202;
  padding: 12px;
`;
const StyledTokenCardPic = styled.div`
  position: relative;
  padding-top: 100%;
  > img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const StyledTokenInfo = styled.div`
  padding-top: 12px;
  padding-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid #1e1e1e;
`;

const StyledTokenName = styled.h3`
  overflow: hidden;
  text-overflow: ellipsis;
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
`;

const StyledTokenPublic = styled.div`
  padding-top: 8px;
  display: flex;
  align-items: center;
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
`;

const StyledTokenSocialBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledTokenSocialBtn = styled(Button)`
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
`;

const StyledTokenSocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 100%;
  text-decoration: none;
`;
