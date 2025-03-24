import React, { FC, use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import copy from "copy-to-clipboard";
import { twMerge } from "tailwind-merge";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { Telegram } from "@/components/telegram";
import { Website } from "@/components/website";
import { Copy } from "@/components/copy";
import {
  formatDecimalNumber,
  formatNumber,
  formatTokenBalance,
  getTokenMarketCap,
  getTokenSellQuote,
  maskAddress,
} from "@/lib/utils";
import { toast } from "react-toastify";
import { IToken } from "@/lib/types";
import dayjs from "dayjs";
import { Twitter2 } from "@/components/twitter2";
import { Address, formatEther } from "viem";
import {
  graduatedPool,
  graduatedPoolConstant,
  tokenSymbol,
} from "@/lib/constant";

import styled from "@emotion/styled";
import XIcon from "~@/icons/x.svg";
import TGIcon from "~@/icons/tg.svg";
import WebsiteIcon from "~@/icons/website.svg";
import { useAppContext } from "@/context/useAppContext";
import ProgressBar from "@/components/common/progressBar";
import styles from "./index.module.scss";
import { useHaresContract } from "@/hooks/useHaresContract";
import { useGlobalCtx } from "@/context/useGlobalCtx";
import { getTokenMeta } from "@/lib/apis";

interface InfoProps {
  detail?: IToken;
  isGraduated?: boolean;
  totalSupply?: string;
}

export const TokenInfo: FC<InfoProps> = ({
  detail,
  isGraduated,
  totalSupply,
}) => {
  const { address } = useGlobalCtx();
  const { ethPrice } = useAppContext();
  const { claim, getClaimable } = useHaresContract();

  const [isClaimDialogVisible, setIsClaimDialogVisible] = useState(false);
  const [claimableETH, setClaimableETH] = useState(0);
  const [claimableToken, setClaimableToken] = useState(0);

  const [tokenMetaLoading, setTokenMetaLoading] = useState(true);
  const [tokenMeta, setTokenMeta] = useState<{
    holders: number;
    liquidity: number;
    volumeIn24h: number;
  }>({
    holders: 0,
    liquidity: 0,
    volumeIn24h: 0,
  });

  const shouldShowClaimBtn =
    detail?.address &&
    detail?.lpPositionId &&
    detail?.isGraduate &&
    address?.toLowerCase() === detail?.creatorAddress.toLowerCase();

  const currentEth = useMemo(() => {
    if (!totalSupply) return BigInt(0);
    return isGraduated
      ? graduatedPool
      : getTokenSellQuote(
        Number(totalSupply) / 1e18,
        Number(totalSupply) / 1e18
      );
  }, [isGraduated, totalSupply]);

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
        url: detail?.twitter || "",
        icon: <XIcon />,
      },
      {
        name: "telegram",
        url: detail?.telegram || "",
        icon: <TGIcon />,
      },
      {
        name: "website",
        url: detail?.website || "",
        icon: <WebsiteIcon />,
      },
    ].filter((item) => !!item.url);
  }, [detail]);

  const tokenTradeMetaDatas = useMemo(() => {
    return [
      {
        title: "Holders",
        value: formatNumber(tokenMeta.holders),
      },
      {
        title: "Liquidity",
        value: detail?.isGraduate ? `$${formatNumber(tokenMeta.liquidity)}` : `$${formatNumber(tokenMeta.liquidity * ethPrice / 1e18)}`,
      },
      {
        title: "24h Volume",
        value: detail?.isGraduate ? `$${formatNumber(tokenMeta.volumeIn24h)}` : `$${formatNumber(tokenMeta.volumeIn24h * ethPrice / 1e18)}`,
      },
    ];
  }, [tokenMeta, ethPrice]);

  const getTokenTradeMeta = async (address: string) => {
    setTokenMetaLoading(true);
    const res = await getTokenMeta(address);
    if (res.code === 0) {
      setTokenMeta(res.data || {});
    }
    setTokenMetaLoading(false);
  };

  useEffect(() => {
    const getClaimableFee = async () => {
      if (
        !detail?.isGraduate ||
        address?.toLowerCase() !== detail?.creatorAddress.toLowerCase() ||
        !detail?.address ||
        !detail?.lpPositionId
      ) {
        return;
      }
      const res = await getClaimable(
        detail.creatorAddress as Address,
        detail?.address as Address,
        detail.lpPositionId
      );
      setClaimableETH(res.eth);
      setClaimableToken(res.token);
    };
    getClaimableFee();
  }, [detail, address]);

  useEffect(() => {
    if (!detail?.address) return;
    getTokenTradeMeta(detail.address);
  }, [detail?.address]);

  console.log("- socialMedias", socialMedias);

  return (
    <StyledTokenInfo>
      <StyledTokenMetaBox>
        <StyledTokenPicBox>
          <StyledTokenPic src={detail?.image} alt="" />
        </StyledTokenPicBox>
        <StyledTokenMeta>
          <StyledTokenMetaHead>
            <StyledTokenMetaHeadLeft>
              <StyledTokenTit>{detail?.name}</StyledTokenTit>
              <StyledTokenMetaHeadBottom>
                <StyledTokenAddressBtn
                  disableAnimation
                  endContent={<Copy />}
                  onPress={() => {
                    copy(detail?.address ?? "");
                    toast("copied to clipboard");
                  }}
                >
                  <div className="flex-1">
                    CA: {maskAddress(detail?.address)}
                  </div>
                </StyledTokenAddressBtn>
                <StyledTokenMetaHeadBottomDivider />
                <StyledTokenCreateTime>
                  Created at{" "}
                  {dayjs().to(dayjs((detail?.created_timestamp ?? 0) * 1000))}
                </StyledTokenCreateTime>
              </StyledTokenMetaHeadBottom>

              <StyledTokenMCA>MCap: ${marketCap}</StyledTokenMCA>
            </StyledTokenMetaHeadLeft>
            <StyledTokenMetaHeadRight>
              {shouldShowClaimBtn && (
                <StyledClaimFeeBtn
                  onPress={() => setIsClaimDialogVisible(true)}
                >
                  Claim fee
                </StyledClaimFeeBtn>
              )}
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
            </StyledTokenMetaHeadRight>
          </StyledTokenMetaHead>
          <StyledTokenTradeMetaDatas loading={tokenMetaLoading}>
            {tokenTradeMetaDatas.map((item, index) => {
              return (
                <StyledTokenTradeMeta key={index}>
                  <span>{item.title}</span>
                  <b>{item.value}</b>
                </StyledTokenTradeMeta>
              );
            })}
          </StyledTokenTradeMetaDatas>
          <StyledTokenDesc>{detail?.desc || "-"}</StyledTokenDesc>
          {detail && (
            <StyledPoolProgress>
              <ProgressBar
                progress={(Number(currentEth) / Number(graduatedPool)) * 100}
              />
              {/* <StyledPoolProgressBar>
                <StyledPoolProgressBarInner
                  style={{
                    width: `${
                      (Number(currentEth) / Number(graduatedPool)) * 100
                    }%`,
                  }}
                ></StyledPoolProgressBarInner>
              </StyledPoolProgressBar> */}
              <StyledPoolProgressText>
                <span>Bonding curve progress:&nbsp;</span>
                <b>
                  {currentEth === graduatedPool
                    ? graduatedPoolConstant
                    : formatDecimalNumber(
                      formatEther((currentEth * BigInt(100)) / BigInt(99)),
                      4
                    )}
                  /&nbsp;
                  {graduatedPoolConstant} {tokenSymbol}
                </b>
              </StyledPoolProgressText>
            </StyledPoolProgress>
          )}
        </StyledTokenMeta>
      </StyledTokenMetaBox>
      <MobileStyledTokenMeta>
        <MobileStyledTokenTradeMetaDatas loading={tokenMetaLoading}>
          {tokenTradeMetaDatas.map((item, index) => {
            return (
              <StyledTokenTradeMeta key={index}>
                <span>{item.title}</span>
                <b>{item.value}</b>
              </StyledTokenTradeMeta>
            );
          })}
        </MobileStyledTokenTradeMetaDatas>
        <MobileStyledTokenDesc>{detail?.desc || "-"}</MobileStyledTokenDesc>
        <MobileStyledTokenAddressBtn
          endContent={<Copy />}
          onPress={() => {
            copy(detail?.address ?? "");
            toast("copied to clipboard");
          }}
        >
          <div className="flex-1">
            CA: {maskAddress(detail?.address, 10, 6)}
          </div>
        </MobileStyledTokenAddressBtn>
        {detail && (
          <MobileStyledPoolProgress>
            <MobileStyledPoolProgressBar>
              <MobileStyledPoolProgressBarInner
                style={{
                  width: `${(Number(currentEth) / Number(graduatedPool)) * 100
                    }%`,
                }}
              ></MobileStyledPoolProgressBarInner>
            </MobileStyledPoolProgressBar>
            <MobileStyledPoolProgressText>
              <span>Bonding curve progress:&nbsp;</span>
              <b>
                {currentEth === graduatedPool
                  ? graduatedPoolConstant
                  : formatDecimalNumber(
                    formatEther((currentEth * BigInt(100)) / BigInt(99)),
                    4
                  )}
                /&nbsp;
                {graduatedPoolConstant} {tokenSymbol}
              </b>
            </MobileStyledPoolProgressText>
          </MobileStyledPoolProgress>
        )}
        {!!socialMedias.length && (
          <MobileStyledTokenSocialBox>
            {socialMedias.map((item, index) => {
              return (
                <MobileStyledTokenSocialBtn key={index} fullWidth>
                  <MobileStyledTokenSocialLink href={item.url} target="_blank">
                    {item.icon}
                    <span>{item.name}</span>
                  </MobileStyledTokenSocialLink>
                </MobileStyledTokenSocialBtn>
              );
            })}
          </MobileStyledTokenSocialBox>
        )}
        {shouldShowClaimBtn && (
          <StyledClaimFeeBtn onPress={() => setIsClaimDialogVisible(true)}>
            Claim fee
          </StyledClaimFeeBtn>
        )}
      </MobileStyledTokenMeta>

      <Modal
        classNames={{
          base: styles["claim-modal-base"],
          backdrop: styles["claim-modal-backdrop"],
          wrapper: styles["claim-modal-wrapper"],
          header: styles["claim-modal-header"],
          body: styles["claim-modal-body"],
          footer: styles["claim-modal-footer"],
        }}
        isOpen={isClaimDialogVisible}
        onOpenChange={(v) => setIsClaimDialogVisible(v)}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Claim fee</ModalHeader>
              <ModalBody>
                <div className="mt-4">
                  {tokenSymbol}: {formatTokenBalance(claimableETH)}
                </div>
                <div>
                  {detail?.symbol}: {formatTokenBalance(claimableToken)}
                </div>
              </ModalBody>
              <ModalFooter>
                <StyledModalButton
                  onPress={() => claim(detail?.address as Address)}
                >
                  Claim
                </StyledModalButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </StyledTokenInfo>
  );
};

const StyledTokenInfo = styled.div`
  display: flex;
  @media screen and (max-width: 1024px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const StyledTokenMetaBox = styled.div`
  padding: 16px;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 16px;

  @media screen and (max-width: 1024px) {
    padding: 0;
  }
`;

const StyledTokenPicBox = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f5f5f5;

  @media screen and (max-width: 1024px) {
    width: 100px;
    height: 100px;
    border-radius: 8px;
  }
`;

const StyledTokenPic = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StyledTokenMeta = styled.div`
  flex: 1;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;

  @media screen and (max-width: 1024px) {
  }
`;

const StyledTokenMetaHead = styled.div`
  display: flex;
  align-items: flex-start;
  @media screen and (max-width: 1024px) {
    flex-direction: column;
  }
`;

const StyledTokenMetaHeadLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledTokenTit = styled.div`
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: -0.96px;
  text-transform: uppercase;

  background: linear-gradient(97deg, #fff -3.13%, #fff 22.25%, #696969 100.44%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StyledTokenMetaHeadBottom = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  @media screen and (max-width: 1024px) {
    margin-top: 6px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const StyledTokenAddressBtn = styled(Button)`
  display: flex;
  padding: 0;
  height: 13px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: none;
  background: transparent;

  color: rgba(234, 236, 239, 0.5);
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  > svg {
    color: rgba(234, 236, 239, 0.8);
  }
  &:hover {
    color: rgba(234, 236, 239, 0.8);
  }
  @media screen and (max-width: 1024px) {
    font-size: 11px;
    text-align: left;
  }
`;

const StyledTokenMetaHeadBottomDivider = styled.div`
  width: 1px;
  height: 12px;
  background: rgba(234, 236, 239, 0.2);
  @media screen and (max-width: 1024px) {
    display: none;
  }
`;

const StyledTokenCreateTime = styled.p`
  color: rgba(234, 236, 239, 0.5);

  font-size: 11px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const StyledTokenMCA = styled.div`
  margin-top: 8px;
  background: linear-gradient(90deg, #ffc720 0%, #fcd535 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 140%;
`;

const StyledTokenMetaHeadRight = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  @media screen and (max-width: 1024px) {
    display: none;
  }
`;

const StyledClaimFeeBtn = styled(Button)`
  display: flex;
  padding: 0px 12px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  align-self: stretch;
  border-radius: 4px;
  background: linear-gradient(274deg, #ffc720 0%, #fcd535 49.5%);

  color: #18191e;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  height: 32px;

  @media screen and (max-width: 1024px) {
    width: 100%;
    display: flex;
    height: 40px;
    padding: 0px 12px;
    justify-content: center;
    align-items: center;
    gap: 6px;

    color: #18191e;
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }
`;

const StyledTokenSocialBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledTokenSocialBtn = styled(Button)`
  padding: 0;
  width: 32px;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(234, 236, 239, 0.8);
  border-radius: 4px;
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  svg {
    width: 14px;
    height: 14px;
  }
  &:hover {
    color: rgba(234, 236, 239, 1);
    background: rgba(255, 255, 255, 0.1);
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

const MobileStyledTokenTradeMetaDatas = styled.div<{ loading?: boolean }>`
  display: none;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  @media screen and (max-width: 1024px) {
    display: ${({ loading }) => (loading ? "none" : "grid")};
  }

  .full {
    grid-column: 1 / -1;
  }
`;

const StyledTokenTradeMetaDatas = styled.div<{ loading?: boolean }>`
  margin-top: 10px;
  display: ${({ loading }) => (loading ? "none" : "flex")};
  align-items: center;
  gap: 8px;
  @media screen and (max-width: 1024px) {
    display: none;
  }
`;

const StyledTokenTradeMeta = styled.div`
  display: flex;
  padding: 3px 8px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(234, 236, 239, 0.5);
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%; /* 18.2px */
  > b {
    color: #eaecef;
    font-size: 13px;
    font-style: normal;
    font-weight: 600;
    line-height: 140%;
  }

  @media screen and (max-width: 1024px) {
    display: flex;
    height: 32px;
    padding: 3px 6px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex: 1 0 0;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const StyledTokenDesc = styled.p`
  margin-top: 8px;
  color: #eaecef;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%; /* 16.8px */

  @media screen and (max-width: 1024px) {
    display: none;
  }
`;

const StyledPoolProgress = styled.div`
  margin-top: 16px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media screen and (max-width: 1024px) {
    display: none;
  }
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
  border-radius: 4px;
  background: #fcd535;
`;

const StyledPoolProgressText = styled.p`
  color: #eaecef;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 150%; /* 18px */
  > b {
    color: #fcd535;
  }
`;

const MobileStyledTokenMeta = styled.div`
  display: none;

  @media screen and (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
`;

const MobileStyledTokenDesc = styled.p`
  color: #eaecef;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%; /* 16.8px */
`;

const MobileStyledTokenAddressBtn = styled(Button)`
  display: flex;
  height: 40px;
  padding: 0px 12px;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  border-radius: 4px;
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);

  color: #eaecef;
  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const MobileStyledPoolProgress = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MobileStyledPoolProgressBar = styled.div`
  width: 100%;
  display: flex;
  height: 6px;
  border-radius: 4px;
  background: rgba(252, 213, 53, 0.2);
  overflow: hidden;
`;

const MobileStyledPoolProgressBarInner = styled.div`
  height: 100%;
  border-radius: 4px;
  background: #fcd535;
`;

const MobileStyledPoolProgressText = styled.p`
  color: #eaecef;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 150%; /* 18px */
  > b {
    color: #fcd535;
    font-weight: 500;
  }
`;

const MobileStyledTokenSocialBox = styled.div`
  padding: 16px 0;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const MobileStyledTokenSocialBtn = styled(Button)`
  flex-shrink: 0;
  padding: 0;
  height: 40px;
  padding: 0px 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex: 1 0 0;
  border-radius: 4px;
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);

  color: #eaecef;
  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  svg {
    width: 14px;
    height: 14px;
  }
`;

const MobileStyledTokenSocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 100%;
  text-decoration: none;
  > span {
    color: #eaecef;
    text-align: center;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-transform: capitalize;
  }
`;

const StyledModalButton = styled(Button)`
  width: 100%;
  display: flex;
  height: 48px;
  padding: 0px 12px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  align-self: stretch;
  border-radius: 24px;
  background: linear-gradient(274deg, #ffc720 0%, #fcd535 49.5%);

  color: #1b1f29;
  font-size: 14px;
  font-style: normal;
  font-weight: 800;
  line-height: 150%; /* 21px */
`;
