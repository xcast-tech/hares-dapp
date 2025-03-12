import React, { FC, useMemo } from "react";
import Image from "next/image";
import copy from "copy-to-clipboard";
import { twMerge } from "tailwind-merge";
import { Button } from "@heroui/react";
import { Telegram } from "../telegram";
import { Website } from "../website";
import { Copy } from "../copy";
import {
  formatDecimalNumber,
  getTokenSellQuote,
  maskAddress,
} from "@/lib/utils";
import { toast } from "react-toastify";
import { IToken } from "@/lib/types";
import dayjs from "dayjs";
import { Twitter2 } from "../twitter2";
import { formatEther } from "viem";
import {
  graduatedPool,
  graduatedPoolConstant,
  tokenSymbol,
} from "@/lib/constant";
import { useAccount } from "wagmi";

import styled from "@emotion/styled";

interface InfoProps {
  className?: string;
  detail?: IToken;
}

export const Info: FC<InfoProps> = ({ detail, className }) => {
  const currentEth = detail
    ? detail?.isGraduate
      ? graduatedPool
      : getTokenSellQuote(
          Number(detail?.totalSupply) / 1e18,
          Number(detail?.totalSupply) / 1e18
        )
    : BigInt(0);

  const socialMedias = useMemo(() => {
    return [
      {
        name: "twitter",
        url: detail?.twitter,
        icon: <Twitter2 />,
      },
      {
        name: "telegram",
        url: detail?.telegram,
        icon: <Telegram />,
      },
      {
        name: "website",
        url: detail?.website,
        icon: <Website />,
      },
    ].filter((item) => item.url);
  }, [detail]);

  return (
    <StyledInfo className={twMerge(className)}>
      <StyledTokenInfo>
        <StyledTokenPicBox>
          <StyledTokenPic src={detail?.image} alt="" />
        </StyledTokenPicBox>
        <StyledTokenText>
          <StyledTokenTit>{detail?.name}</StyledTokenTit>
          <StyledTokenCreateTime>
            Created at{" "}
            {dayjs().to(dayjs((detail?.created_timestamp ?? 0) * 1000))}
          </StyledTokenCreateTime>
          <StyledTokenDesc>{detail?.desc || "-"}</StyledTokenDesc>
        </StyledTokenText>
      </StyledTokenInfo>

      <StyledTokenAddressBtn
        fullWidth
        endContent={<Copy />}
        onPress={() => {
          copy(detail?.address ?? "");
          toast("copied to clipboard");
        }}
      >
        <div className="flex-1">
          contract address: {maskAddress(detail?.address)}
        </div>
      </StyledTokenAddressBtn>

      {detail && (
        <StyledPoolProgress>
          <StyledPoolProgressBar>
            <StyledPoolProgressBarInner
              style={{
                width: `${(Number(currentEth) / Number(graduatedPool)) * 100}%`,
              }}
            ></StyledPoolProgressBarInner>
          </StyledPoolProgressBar>
          <StyledPoolProgressText>
            <span>Bonding curve progress:&nbsp;</span>
            <b>
              {currentEth === graduatedPool
                ? graduatedPoolConstant
                : formatDecimalNumber(
                    formatEther((currentEth * BigInt(100)) / BigInt(99)),
                    2
                  )}
              /&nbsp;
              {graduatedPoolConstant} {tokenSymbol}
            </b>
          </StyledPoolProgressText>
        </StyledPoolProgress>
      )}

      {!!socialMedias.length && <StyledInfoDivider />}

      {!!socialMedias.length && (
        <StyledTokenSocialBox>
          {socialMedias.map((item, index) => {
            return (
              <StyledTokenSocialBtn key={index} fullWidth>
                <StyledTokenSocialLink href={item.url} target="_blank">
                  {item.icon}
                  <span>{item.name}</span>
                </StyledTokenSocialLink>
              </StyledTokenSocialBtn>
            );
          })}
        </StyledTokenSocialBox>
      )}
    </StyledInfo>
  );
};

const StyledInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StyledTokenInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const StyledTokenPicBox = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f5f5f5;
`;

const StyledTokenPic = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StyledTokenText = styled.div`
  flex: 1;
  flex-shrink: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StyledTokenTit = styled.div`
  overflow: hidden;
  color: #eaecef;

  text-overflow: ellipsis;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 120%;
`;

const StyledTokenCreateTime = styled.p`
  color: rgba(234, 236, 239, 0.5);

  font-size: 10px;
  font-style: normal;
  font-weight: 300;
  line-height: 140%;
`;

const StyledTokenDesc = styled.p`
  color: #eaecef;

  font-size: 10px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%;
`;

const StyledTokenAddressBtn = styled(Button)`
  display: flex;
  width: 100%;
  height: 32px;
  padding: 10px;
  align-items: center;
  gap: 4px;
  border-radius: 8px;
  background: #2b3139;

  color: #eaecef;

  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const StyledPoolProgress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledPoolProgressBar = styled.div`
  display: flex;
  gap: 8px;
  height: 6px;
  border-radius: 4px;
  background: rgba(252, 213, 53, 0.2);
  overflow: hidden;
`;

const StyledPoolProgressBarInner = styled.div`
  height: 100%;
  background: #fcd535;
`;

const StyledPoolProgressText = styled.p`
  color: #eaecef;

  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 150%;
  > b {
    color: #fcd535;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 150%;
  }
`;

const StyledInfoDivider = styled.div`
  width: 100%;
  height: 1px;
  background: #2b3139;
`;

const StyledTokenSocialBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledTokenSocialBtn = styled(Button)`
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #eaecef;
  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  border-radius: 8px;
  background: #2b3139;
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
