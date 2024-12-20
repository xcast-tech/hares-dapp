import { setUpApi, tokenApi, uploadFile } from "@/lib/apis";
import { Form, Input, Button, Textarea, Accordion, AccordionItem } from "@nextui-org/react";
import React, { FormEvent, useRef, useState } from "react";
import Image from "next/image";
import { useContract } from "@/hooks/useContract";
import { toast } from "react-toastify";
import { ABIs, EventTopic } from "@/lib/constant";
import { useRouter } from "next/router";
import { decodeEventLog } from "viem";

const Create = () => {
  const router = useRouter();
  const { createToken } = useContract();
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState("");

  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");

  const [loading, setLoading] = useState(false);

  console.log("Create", {
    name,
    ticker,
    desc,
    file,
  });

  async function handleCreateToken(name: string, symbol: string) {
    if (!name || !symbol) {
      toast("Invalid");
      return "";
    }

    try {
      const res = await createToken(name, symbol);
      console.log(res);
      const tokenCreatedEvent = res?.logs?.find?.((item) => item?.topics?.[0] === EventTopic.HaresTokenCreated);
      if (tokenCreatedEvent) {
        const event: any = decodeEventLog({
          abi: ABIs.HaresFactoryAbi,
          data: tokenCreatedEvent.data,
          topics: tokenCreatedEvent.topics,
        });
        const tokenAddress = ((event.args as any).tokenAddress || "").toLowerCase();
        console.log(tokenAddress);
        return tokenAddress;
      }
    } catch (error: any) {
      toast(error?.message);
    }
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
    console.log("onSubmit");

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
    <div>
      <div className="mx-auto flex justify-center max-w-full w-[600px]">
        <Form className="w-full" validationBehavior="native" onSubmit={handleSubmit}>
          <Input
            classNames={{ label: "w-[158px]", mainWrapper: "flex-1" }}
            isRequired
            labelPlacement="outside-left"
            label="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            classNames={{ label: "w-[158px]", mainWrapper: "flex-1" }}
            isRequired
            labelPlacement="outside-left"
            label="ticker"
            name="ticker"
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
          />

          <Textarea
            classNames={{ label: "w-[158px]", inputWrapper: "flex-1" }}
            labelPlacement="outside-left"
            label="description"
            name="description"
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <Input
            classNames={{ label: "w-[158px]", mainWrapper: "flex-1" }}
            isRequired
            labelPlacement="outside-left"
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
            <div className="pl-[158px]">
              <Image alt="" src={file} width={100} height={100} />
            </div>
          )}

          <Accordion selectionMode="multiple">
            <AccordionItem key="1" title="show more options">
              <div className="grid gap-2">
                <Input
                  classNames={{ label: "w-[158px]", mainWrapper: "flex-1" }}
                  labelPlacement="outside-left"
                  label="twitter link"
                  name="twitter"
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                />

                <Input
                  classNames={{ label: "w-[158px]", mainWrapper: "flex-1" }}
                  labelPlacement="outside-left"
                  label="telegram link"
                  name="telegram"
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                />

                <Input
                  classNames={{ label: "w-[158px]", mainWrapper: "flex-1" }}
                  labelPlacement="outside-left"
                  label="website"
                  name="website"
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </AccordionItem>
          </Accordion>

          <Button type="submit" color="primary" className="w-full mt-4" isLoading={loading}>
            create coin
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Create;
