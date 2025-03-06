import { setUpApi, tokenApi, uploadFile } from "@/lib/apis";
import {
  Form,
  Input,
  Button,
  Textarea,
  Accordion,
  AccordionItem,
  Card,
  Select,
  SelectItem,
  CircularProgress,
} from "@heroui/react";
import React, {
  FormEvent,
  PropsWithChildren,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useHaresContract } from "@/hooks/useHaresContract";
import { toast } from "react-toastify";
import { ABIs, EventTopic, tokenSymbol } from "@/lib/constant";
import { useRouter } from "next/router";
import { decodeEventLog } from "viem";
import { cn } from "@/lib/utils";
import { Twitter } from "@/components/twitter";
import { uploadImage, uploadMetadata } from "@/lib/upload";
import styled from "@emotion/styled";
import styles from "@/styles/create.module.scss";
import AnchorIcon from "~@/icons/accordion.svg";
import XIcon from "~@/icons/x.svg";
import TGIcon from "~@/icons/tg.svg";
import WebsiteIcon from "~@/icons/website.svg";
import { StarsBG } from "@/components/common/stars";
import ShinyCard from "@/components/common/shiny";
import CommonInput from "@/components/common/input";
import CommonTextarea from "@/components/common/textarea";
import { useGlobalCtx } from "@/context/useGlobalCtx";

const createBlobUrl = (file: File | Blob): string => {
  const blobUrl = URL.createObjectURL(file);

  return blobUrl;
};

const cleanBlobUrl = (blobUrl: string) => {
  URL.revokeObjectURL(blobUrl);
};

function Title({
  children,
  className,
  required,
}: PropsWithChildren<{ className?: string; required?: boolean }>) {
  return (
    <div className={cn("text-[14px] mb-3 font-medium", className)}>
      {children}
      {required && <span className="text-[#F31260] ml-1">*</span>}
    </div>
  );
}

const Create = () => {
  const router = useRouter();
  const { createToken: createBondingCurveToken } = useHaresContract();
  const {
    address,
    shouldSign,
    handleSign,
    isActionReady,
    isCorrectChain,
    handleSwitchNetwork,
  } = useGlobalCtx();

  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [desc, setDesc] = useState("");
  const [picture, setPicture] = useState("");
  const [fileBlobUrl, setFileBlobUrl] = useState<string | null>(null);

  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");

  const [devBuyAmount, setDevBuyAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const disabledSubmit = !name || !ticker || !picture || loading || uploading;

  const socialMedias = useMemo(() => {
    return [
      {
        name: "twitter",
        url: twitter,
        icon: <XIcon />,
      },
      {
        name: "telegram",
        url: telegram,
        icon: <TGIcon />,
      },
      {
        name: "website",
        url: website,
        icon: <WebsiteIcon />,
      },
    ].filter((item) => !!item.url);
  }, [twitter, telegram, website]);

  async function handleCreateToken(name: string, symbol: string) {
    if (!name || !symbol) {
      toast("Invalid");
      return "";
    }

    try {
      const res = await createBondingCurveToken(name, symbol, devBuyAmount);
      const tokenCreatedEvent = res?.logs?.find?.(
        (item) => item?.topics?.[0] === EventTopic.HaresTokenCreated
      );
      if (tokenCreatedEvent) {
        const event: any = decodeEventLog({
          abi: ABIs.HaresFactoryAbi,
          data: tokenCreatedEvent.data,
          topics: tokenCreatedEvent.topics,
        });
        const tokenAddress = (
          (event.args as any).tokenAddress || ""
        ).toLowerCase();
        return tokenAddress;
      }
    } catch (error: any) {
      if (error.message.includes("User rejected the request")) {
        return;
      }
      toast(error?.message);
    }
    return "";
  }

  async function loopToken({ address }: { address: string }) {
    const res = await tokenApi({ address });
    if (res?.data?.picture) {
      router.push(`/token/${address}`);
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(loopToken({ address }));
        }, 2000);
      });
    }
  }

  async function handleUploadMetadata() {
    const res = await uploadMetadata({
      image: picture,
      desc,
      website,
      twitter,
      telegram,
    });
    if (res?.code === 0) {
      return res?.data.url;
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!picture) {
      toast("Please upload image");
      return;
    }

    if (!isActionReady) {
      handleSign();
      return;
    }

    if (!isCorrectChain) {
      await handleSwitchNetwork();
    }

    try {
      setLoading(true);
      // const metadata = await handleUploadMetadata();
      // console.log("---- metadata", metadata);
      // if (!metadata) {
      //   toast("Failed to upload metadata");
      //   return;
      // }

      const address = await handleCreateToken(name.trim(), ticker.trim());

      if (address) {
        await setUpApi({
          address,
          name: name.trim(),
          ticker: ticker.trim(),
          picture: picture,
          website: website.trim(),
          twitter: twitter.trim(),
          telegram: telegram.trim(),
          desc: desc.trim(),
        });

        await loopToken({ address });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  return (
    <StyledCreate>
      <StyledCreateContainer>
        <StyledCreateTokenPreview>
          <StarsBG />
          <ShinyCard radius={16} duration={5}>
            <StyledTokenCard>
              <StyledTokenCardPic>
                <StyledTokenCardPicContainer>
                  {picture && <img src={picture} alt="" />}
                </StyledTokenCardPicContainer>
              </StyledTokenCardPic>
              <StyledTokenCardContent>
                <StyledTokenCardName>{name || "NAME"}</StyledTokenCardName>
                <StyledTokenCardTicker title={ticker}>
                  ${ticker || "TICKER"}
                </StyledTokenCardTicker>
                <StyledTokenCardDesc title={desc}>
                  {desc || "-"}
                </StyledTokenCardDesc>
                <StyledTokenCardDivider></StyledTokenCardDivider>
                <StyledTokenCardPublic>
                  <StyledTokenCardPrice>$0</StyledTokenCardPrice>
                  {!!socialMedias.length && (
                    <StyledTokenSocialBox>
                      {socialMedias.map((item, index) => {
                        return (
                          <StyledTokenSocialBtn key={index}>
                            <StyledTokenSocialLink
                              href={item.url}
                              target="_blank"
                            >
                              {item.icon}
                            </StyledTokenSocialLink>
                          </StyledTokenSocialBtn>
                        );
                      })}
                    </StyledTokenSocialBox>
                  )}
                </StyledTokenCardPublic>
              </StyledTokenCardContent>
            </StyledTokenCard>
          </ShinyCard>
        </StyledCreateTokenPreview>
        <StyledCreateTokenMain>
          <StyledCreateTokenTit>start a new coin</StyledCreateTokenTit>
          <StyledCreateTokenForm
            validationBehavior="native"
            onSubmit={handleSubmit}
          >
            <div className="w-full">
              <StyledCreateTokenFormTitle required>
                Name
              </StyledCreateTokenFormTitle>
              <CommonInput
                labelPlacement="outside"
                isRequired
                label="Name"
                name="name"
                type="text"
                placeholder="-"
                value={name}
                errorMessage="This field is required"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="w-full">
              <StyledCreateTokenFormTitle required>
                Ticker
              </StyledCreateTokenFormTitle>
              <CommonInput
                labelPlacement="outside"
                isRequired
                label="Ticker"
                name="ticker"
                type="text"
                placeholder="-"
                value={ticker}
                errorMessage="This field is required"
                startContent={
                  <StyledTickerInputStartContent>
                    <span>$</span>
                    <StyledTickerInputDivider />
                  </StyledTickerInputStartContent>
                }
                onChange={(e) => setTicker(e.target.value)}
              />
            </div>

            <div className="w-full">
              <StyledCreateTokenFormTitle>
                Description
              </StyledCreateTokenFormTitle>
              <CommonTextarea
                label="description"
                name="description"
                placeholder="-"
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div className="w-full">
              <StyledCreateTokenFormTitle required>
                Image
              </StyledCreateTokenFormTitle>
              <CommonInput
                isRequired
                name="file"
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/gif"
                errorMessage="This field is required"
                onChange={async (e: any) => {
                  const file = e?.nativeEvent?.target?.files?.[0];
                  if (file) {
                    setUploading(true);
                    fileBlobUrl && cleanBlobUrl(fileBlobUrl);
                    setFileBlobUrl(createBlobUrl(file));
                    const res = await uploadImage({ file });

                    if (res?.code === 0) {
                      setPicture(res?.data.url ?? "");
                    } else {
                      setPicture("");
                    }
                  }
                  setUploading(false);
                }}
              />
              {fileBlobUrl && (
                <StyledCreateTokenFormImagePreview>
                  <StyledCreateTokenFormImagePreviewLoading
                    disabled={!uploading}
                  >
                    <StyledCircularProgress
                      aria-label="uploading..."
                      size="sm"
                      color="primary"
                    />
                  </StyledCreateTokenFormImagePreviewLoading>
                  <img src={fileBlobUrl} alt="" />
                </StyledCreateTokenFormImagePreview>
              )}
            </div>

            <Accordion
              selectionMode="multiple"
              fullWidth
              itemClasses={{
                base: styles["accordion-base"],
                title: styles["accordion-title"],
                titleWrapper: styles["accordion-title-wrapper"],
                content: styles["accordion-content"],
                subtitle: styles["accordion-subtitle"],
                trigger: styles["accordion-trigger"],
                heading: styles["accordion-heading"],
                indicator: styles["accordion-indicator"],
              }}
            >
              <AccordionItem
                key="1"
                indicator={<AnchorIcon />}
                title="Show More Options"
              >
                <StyledAccordionItemSection>
                  <StyledCreateTokenFormTitle>
                    Social Links
                  </StyledCreateTokenFormTitle>
                  <CommonInput
                    name="twitter"
                    type="text"
                    placeholder="-"
                    value={twitter}
                    startContent={
                      <StyledInputStartIcon>
                        <XIcon />
                        <StyledInputStartDivider />
                      </StyledInputStartIcon>
                    }
                    onChange={(e) => setTwitter(e.target.value)}
                  />

                  <CommonInput
                    placeholder="-"
                    startContent={
                      <StyledInputStartIcon>
                        <TGIcon />
                        <StyledInputStartDivider />
                      </StyledInputStartIcon>
                    }
                    name="telegram"
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                  />

                  <CommonInput
                    placeholder="-"
                    startContent={
                      <StyledInputStartIcon>
                        <WebsiteIcon />
                        <StyledInputStartDivider />
                      </StyledInputStartIcon>
                    }
                    name="website"
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </StyledAccordionItemSection>
                <StyledAccordionItemSection>
                  <StyledCreateTokenFormTitle>
                    Dev Buy
                  </StyledCreateTokenFormTitle>
                  <CommonInput
                    name="devBuy"
                    type="number"
                    endContent={
                      <StyledDevBuyEndContent>
                        <StyledInputStartDivider />
                        <StyledTokenActionInputIcon
                          alt="token icon"
                          src="/icons/bsc.svg"
                        />
                        <span>{tokenSymbol}</span>
                      </StyledDevBuyEndContent>
                    }
                    placeholder={`Amount in ${tokenSymbol}`}
                    value={devBuyAmount}
                    onChange={(e) => setDevBuyAmount(e.target.value)}
                  />
                </StyledAccordionItemSection>
              </AccordionItem>
            </Accordion>

            <StyledCreateTokenFormBottom>
              <StyledCreateTokenFormSubmitButton
                type="submit"
                isLoading={loading}
                disabled={disabledSubmit}
              >
                {!isActionReady ? (
                  <span>Sign In First</span>
                ) : (
                  <span>create coin</span>
                )}
              </StyledCreateTokenFormSubmitButton>
            </StyledCreateTokenFormBottom>
          </StyledCreateTokenForm>
        </StyledCreateTokenMain>
      </StyledCreateContainer>
    </StyledCreate>
  );
};

export default Create;

const StyledCreate = styled.div`
  padding-bottom: 24px;
  padding-top: calc(var(--header-h) + 24px);
  min-height: 100vh;

  @media screen and (max-width: 1024px) {
    padding-bottom: 120px;
  }
`;

const StyledCreateContainer = styled.div`
  max-width: 1264px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: flex-start;
  gap: 24px;

  @media screen and (max-width: 1024px) {
    padding: 0 10px;
  }
`;

const StyledCreateTokenPreview = styled.div`
  position: sticky;
  top: calc(var(--header-h) + 24px);
  padding: 60px 24px;
  width: 100%;
  max-width: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #020308;
  overflow: hidden;

  @media screen and (max-width: 1024px) {
    display: none;
  }
`;

const StyledTokenCard = styled.div`
  position: relative;
  z-index: 1;
  width: 300px;
  border-radius: 16px;
  background: #020308;
  // box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(234, 236, 239, 0.12);
`;

const StyledTokenCardPic = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%;

  background: linear-gradient(
    151deg,
    rgba(234, 236, 239, 0.1) 0%,
    rgba(234, 236, 239, 0) 50.75%
  );
`;

const StyledTokenCardPicContainer = styled.div`
  position: absolute;
  width: calc(100% - 28px);
  height: calc(100% - 28px);
  top: 14px;
  left: 14px;
  border-radius: 9.15px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  z-index: 1;
  > img {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    object-fit: cover;
    pointer-events: none;
    z-index: 1;
  }
`;

const StyledTokenCardContent = styled.div`
  padding: 14px;
  padding-top: 0;
  display: flex;
  flex-direction: column;
`;

const StyledTokenCardName = styled.div`
  margin-top: 14px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 20.588px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  text-transform: uppercase;
  background: linear-gradient(97deg, #fff -3.13%, #fff 22.25%, #696969 100.44%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StyledTokenCardTicker = styled.div`
  margin-top: 4px;
  color: rgba(234, 236, 239, 0.25);
  font-size: 11.438px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const StyledTokenCardDesc = styled.div`
  margin-top: 4px;
  color: #eaecef;
  font-size: 11.438px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%; /* 16.013px */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
`;

const StyledTokenCardDivider = styled.div`
  margin-top: 14px;
  width: 100%;
  height: 1px;
  background: #1e1e1e;
`;

const StyledTokenCardPublic = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
`;

const StyledTokenCardPrice = styled.div`
  flex: 1;
  font-size: 12.582px;
  font-style: normal;
  font-weight: 700;
  line-height: 140%; /* 17.614px */

  background: linear-gradient(90deg, #ffc720 0%, #fcd535 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StyledCreateTokenMain = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.01);

  @media screen and (max-width: 1024px) {
    padding: 0;
    width: 100%;
    border: none;
    background: transparent;
  }
`;

const StyledCreateTokenTit = styled.h2`
  color: #eaecef;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%; /* 36px */
  text-transform: capitalize;
`;
const StyledCreateTokenForm = styled(Form)`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StyledCreateTokenFormTitle = styled(Title)`
  padding: 0 4px;
  margin-bottom: 0;
  color: #eaecef;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%; /* 21px */
  > span {
    color: #f31260;
    font-style: normal;
    font-weight: 700;
    line-height: 150%;
  }
`;

const StyledTickerInputStartContent = styled.div`
  color: #eaecef;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 142.857% */

  display: flex;
  align-items: center;
  gap: 16px;
`;

const StyledTickerInputDivider = styled.div`
  width: 1px;
  height: 16px;
  background: #3d3d3d;
`;

const StyledCreateTokenFormImagePreview = styled.div`
  position: relative;
  margin-top: 12px;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }
`;

const StyledCreateTokenFormImagePreviewLoading = styled.div<{
  disabled: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
  display: ${(props) => (props.disabled ? "none" : "flex")};
  align-items: center;
  justify-content: center;
`;

const StyledCircularProgress = styled(CircularProgress)``;

const StyledAccordionItemSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledInputStartIcon = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  > svg {
    width: 16px;
    height: 16px;
    color: #eaecef;
    opacity: 0.5;
  }
`;

const StyledInputStartDivider = styled.div`
  width: 1px;
  height: 16px;
  background: #3d3d3d;
`;

const StyledDevBuyEndContent = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #eaecef;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 142.857% */
  flex-shrink: 0;
  > img {
    margin-left: 6px;
  }
`;

const StyledTokenActionInputIcon = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
`;

const StyledCreateTokenFormBottom = styled.div`
  width: 100%;
  @media screen and (max-width: 1024px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 39;
    padding: 24px 10px;
    background: var(--background);
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }
`;

const StyledCreateTokenFormSubmitButton = styled(Button)`
  width: 100%;
  display: flex;
  height: 48px;
  padding: 0px 12px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  align-self: stretch;
  border-radius: 100px;
  background: linear-gradient(274deg, #ffc720 0%, #fcd535 49.5%);

  color: #1b1f29;
  font-size: 14px;
  font-style: normal;
  font-weight: 800;
  line-height: 150%; /* 21px */

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
