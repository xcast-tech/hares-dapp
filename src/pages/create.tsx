import { setUpApi, tokenApi, uploadFile } from "@/lib/apis";
import { Form, Input, Button, Textarea, Accordion, AccordionItem, Card, Select, SelectItem } from "@nextui-org/react";
import React, { FormEvent, PropsWithChildren, useRef, useState } from "react";
import Image from "next/image";
import { useHaresContract } from "@/hooks/useHaresContract";
import { toast } from "react-toastify";
import { ABIs, EventTopic } from "@/lib/constant";
import { useRouter } from "next/router";
import { decodeEventLog } from "viem";
import { cn } from "@/lib/utils";
import { Twitter } from "@/components/twitter";

function Title({ children, className, required }: PropsWithChildren<{ className?: string; required?: boolean }>) {
  return (
    <div className={cn("text-[14px] mb-3 font-medium", className)}>
      {children}
      {required && <span className="text-[#F31260] ml-1">*</span>}
    </div>
  );
}

function AnchorIcon() {
  return (
    <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-90">
      <path d="M10.8335 7.02363L15.3035 11.4936L16.482 10.3151L10.0001 3.83329L3.51831 10.3151L4.69683 11.4936L9.16679 7.02363V17.1666H10.8335V7.02363Z" fill="#6A3CD6" />
    </svg>
  );
}

const Create = () => {
  const router = useRouter();
  const { createToken: createBondingCurveToken } = useHaresContract();
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState("");

  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");

  const [devBuyAmount, setDevBuyAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateToken(name: string, symbol: string) {
    if (!name || !symbol) {
      toast("Invalid");
      return "";
    }

    try {
      const res = await createBondingCurveToken(name, symbol, devBuyAmount);
      const tokenCreatedEvent = res?.logs?.find?.((item) => item?.topics?.[0] === EventTopic.HaresTokenCreated);
      if (tokenCreatedEvent) {
        const event: any = decodeEventLog({
          abi: ABIs.HaresFactoryAbi,
          data: tokenCreatedEvent.data,
          topics: tokenCreatedEvent.topics,
        });
        const tokenAddress = ((event.args as any).tokenAddress || "").toLowerCase();
        return tokenAddress;
      }
    } catch (error: any) {
      toast(error?.message);
    }
    return "";
  }

  async function loopToken({ address }: { address: string }) {
    const res = await tokenApi({ address });
    if (res?.data?.picture) {
      router.push(`/token/${address}`);
    } else {
      setTimeout(() => {
        loopToken({ address });
      }, 2000);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!file) {
      toast("Please upload image");
      return;
    }

    try {
      setLoading(true);

      const address = await handleCreateToken(name.trim(), ticker.trim());

      if (address) {
        setUpApi({
          address,
          picture: file,
          website: website.trim(),
          twitter: twitter.trim(),
          telegram: telegram.trim(),
          desc: desc.trim(),
        });

        loopToken({ address });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-8">
      <Card className={cn("mx-4 p-8 flex justify-center", "xl:mx-auto xl:w-[600px] xl:max-w-full xl:shadow-[0px_0px_0px_8px_#262626]")}>
        <Form className="w-full grid grid-cols-1 gap-6" validationBehavior="native" onSubmit={handleSubmit}>
          <div>
            <Title required>Name</Title>
            <Input
              className="!mt-0"
              classNames={{ label: "hidden", mainWrapper: "flex-1", inputWrapper: "!bg-[#1A1A1A] border border-solid border-[#262626] h-[52px]" }}
              labelPlacement="outside"
              isRequired
              label="name"
              name="name"
              type="text"
              value={name}
              errorMessage="This field is required"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Title required>Ticker</Title>
            <Input
              className="!mt-0"
              classNames={{ label: "hidden", mainWrapper: "flex-1", inputWrapper: "!bg-[#1A1A1A] border border-solid border-[#262626] h-[52px]" }}
              labelPlacement="outside"
              isRequired
              label="ticker"
              name="ticker"
              type="text"
              value={ticker}
              errorMessage="This field is required"
              onChange={(e) => setTicker(e.target.value)}
            />
          </div>

          <div>
            <Title>Description</Title>
            <Textarea
              classNames={{ label: "hidden", inputWrapper: "flex-1 !bg-[#1A1A1A] border border-solid border-[#262626] h-[52px]" }}
              label="description"
              name="description"
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div>
            <Title required>Image</Title>
            <label htmlFor="image-file" className="cursor-pointer">
              <div className="flex items-center px-3 text-[14px] rounded-[12px] bg-[#1A1A1A] border border-solid border-[#262626] h-[52px]">Please choose image</div>
            </label>
            <Input
              id="image-file"
              className="hidden"
              classNames={{ label: "hidden", mainWrapper: "flex-1", inputWrapper: "!bg-[#1A1A1A] border border-solid border-[#262626] h-[52px]" }}
              label="image"
              name="file"
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/gif"
              onChange={async (e: any) => {
                const file = e?.nativeEvent?.target?.files?.[0];
                if (file) {
                  const res = await uploadFile(file);

                  const url = res?.data?.url;
                  if (url) {
                    setFile(url);
                  }
                } else {
                  setFile("");
                }
              }}
            />
            {file && (
              <div className="mt-4">
                <Image alt="" src={file} width={120} height={120} className="object-cover object-center" />
              </div>
            )}
          </div>

          <Accordion selectionMode="multiple">
            <AccordionItem key="1" indicator={<AnchorIcon />} title={<div className="text-[#6A3CD6] text-[14px] font-medium">Show More Options</div>}>
              <div className="grid gap-2">
                <Input
                  className="!mt-0"
                  classNames={{ label: "hidden", mainWrapper: "flex-1", inputWrapper: "!bg-[#1A1A1A] border border-solid border-[#262626] h-[52px]" }}
                  labelPlacement="outside"
                  label="twitter link"
                  name="twitter"
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  startContent={
                    <div className="flex items-center">
                      <div className="w-4">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M11.4513 2.57678H13.2914L9.27137 7.17141L14.0006 13.4237H10.2976L7.39736 9.63171L4.07876 13.4237H2.23757L6.53739 8.5092L2.00061 2.57678H5.79758L8.41919 6.04278L11.4513 2.57678ZM10.8055 12.3223H11.8251L5.24355 3.62031H4.14941L10.8055 12.3223Z"
                            fill="white"
                          />
                        </svg>
                      </div>

                      <div className="mx-5 w-px h-4 bg-[#3D3D3D]"></div>
                    </div>
                  }
                />

                <Input
                  className="!mt-0"
                  classNames={{ label: "hidden", mainWrapper: "flex-1", inputWrapper: "!bg-[#1A1A1A] border border-solid border-[#262626] h-[52px]" }}
                  labelPlacement="outside"
                  label="telegram link"
                  name="telegram"
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  startContent={
                    <div className="flex items-center">
                      <div className="w-4">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M14.2498 3.57051L12.3527 12.5172C12.2096 13.1487 11.8364 13.3058 11.306 13.0083L8.41539 10.8783L7.02063 12.2198C6.86627 12.3741 6.73718 12.5032 6.43971 12.5032L6.64738 9.55931L12.0047 4.71832C12.2377 4.51065 11.9542 4.39559 11.6427 4.60326L5.01968 8.77353L2.16841 7.8811C1.5482 7.68746 1.53697 7.26089 2.2975 6.96342L13.45 2.66686C13.9664 2.47322 14.4182 2.78192 14.2498 3.57051Z"
                            fill="white"
                          />
                        </svg>
                      </div>

                      <div className="mx-5 w-px h-4 bg-[#3D3D3D]"></div>
                    </div>
                  }
                />

                <Input
                  className="!mt-0"
                  classNames={{ label: "hidden", mainWrapper: "flex-1", inputWrapper: "!bg-[#1A1A1A] border border-solid border-[#262626] h-[52px]" }}
                  labelPlacement="outside"
                  label="website"
                  name="website"
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  startContent={
                    <div className="flex items-center">
                      <div className="w-4">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M1.71411 8.63164H5.17446C5.28753 10.6966 5.95153 12.6147 7.022 14.2417C4.20189 13.8034 1.99886 11.4997 1.71411 8.63164ZM1.71411 7.36826C1.99886 4.50025 4.20189 2.19653 7.022 1.7583C5.95153 3.38524 5.28753 5.3034 5.17446 7.36826H1.71411ZM14.2855 7.36826H10.8251C10.7121 5.3034 10.0481 3.38524 8.97764 1.7583C11.7978 2.19653 14.0008 4.50025 14.2855 7.36826ZM14.2855 8.63164C14.0008 11.4997 11.7978 13.8034 8.97764 14.2417C10.0481 12.6147 10.7121 10.6966 10.8251 8.63164H14.2855ZM6.44001 8.63164H9.55962C9.45122 10.3896 8.89344 12.0259 7.99979 13.4272C7.10614 12.0259 6.54841 10.3896 6.44001 8.63164ZM6.44001 7.36826C6.54841 5.61039 7.10614 3.97408 7.99979 2.57279C8.89344 3.97408 9.45122 5.61039 9.55962 7.36826H6.44001Z"
                          />
                        </svg>
                      </div>

                      <div className="mx-5 w-px h-4 bg-[#3D3D3D]"></div>
                    </div>
                  }
                />

                <div className="mt-6">
                  <Title>Dev Buy</Title>
                  <Input
                    className="!mt-0"
                    classNames={{ label: "hidden", mainWrapper: "flex-1", inputWrapper: "!bg-[#1A1A1A] border border-solid border-[#262626] h-[52px]" }}
                    labelPlacement="outside"
                    isRequired
                    label="dev buy"
                    name="devBuy"
                    type="number"
                    endContent="ETH"
                    placeholder="Amount in ETH"
                    value={devBuyAmount}
                    onChange={(e) => setDevBuyAmount(e.target.value)}
                  />
                </div>
              </div>
            </AccordionItem>
          </Accordion>

          <div className="px-2">
            <Button type="submit" className="w-full bg-[#6A3CD6] h-[52px]" isLoading={loading}>
              create coin
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Create;
