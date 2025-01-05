import React, { use, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import {
  Avatar,
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { Twitter } from "../twitter";
import { Warpcast } from "../wrapcast";
import { useFarcasterContext } from "@/hooks/farcaster";
import { cn } from "@/lib/utils";
import { Expand } from "../icons/expand";
import { Close } from "../icons/close";
import style from "./style.module.css";
import { HaresAiTwitterLink, HaresAiWarpcastLink } from "@/lib/constant";

const ChevronDownIcon = () => {
  return (
    <svg fill="none" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.9188 8.17969H11.6888H6.07877C5.11877 8.17969 4.63877 9.33969 5.31877 10.0197L10.4988 15.1997C11.3288 16.0297 12.6788 16.0297 13.5088 15.1997L15.4788 13.2297L18.6888 10.0197C19.3588 9.33969 18.8788 8.17969 17.9188 8.17969Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const Header = () => {
  const { userInfo } = useFarcasterContext();

  const { login, logout } = useFarcasterContext();

  const [isAboutOpen, setIsAboutOpen] = React.useState(false);

  const [expand, setExpand] = useState(false);

  const onOpenChange = (open: boolean) => {
    setIsAboutOpen(open);
  };

  return (
    <div className={cn("fixed top-0 left-0 right-0 h-[52px] backdrop-blur px-4 z-10 flex justify-between items-center", "xl:h-[72px] lx:px-12 xl:gap-6")}>
      <Link href="/">
        <div className="flex items-center gap-3">
          <div className={cn("bg-theme overflow-hidden w-6 h-6 rounded-[6px]", "xl:w-8 xl:h-8 xl:rounded-[8px]")}>
            <img src="/logo.png" alt="Hares.ai" />
          </div>
          <img src="/logo-text.svg" alt="Hares.ai" className="h-[12px] xl:h-[18px]" />
        </div>
      </Link>

      <div className="hidden lg:flex-1 lg:flex lg:items-center lg:gap-6">
        <div className="h-4 w-[1px] bg-[#3d3d3d]"></div>
        <button
          onClick={() => {
            setIsAboutOpen(true);
          }}
          className="text-[#999] text-sm hover:text-white"
        >
          About Hares
        </button>
        <div className="h-4 w-[1px] bg-[#3d3d3d]"></div>
        <div className="flex-1 flex items-center gap-4">
          <div className="flex gap-2 items-center">
            <Link href={HaresAiTwitterLink} target="_blank" className="p-2">
              <Twitter height={20} />
            </Link>
            <Link href={HaresAiWarpcastLink} target="_blank" className="p-2">
              <Warpcast height={20} />
            </Link>
          </div>
        </div>
      </div>

      <div>
        {!expand ? (
          <Expand
            onClick={() => {
              setExpand(true);
            }}
          />
        ) : (
          <Close
            onClick={() => {
              setExpand(false);
            }}
          />
        )}

        <div
          className={cn("hidden absolute z-[1000] top-[52px] left-0 right-0 h-[calc(100vh-52px)]", {
            block: expand,
          })}
        >
          <div className="absolute z-0 inset-0 backdrop-blur-xl bg-black/80"></div>
          <div className="relative z-10 p-4 bg-[#141414] rounded-b-[16px] border-solid border-b-1 border-[#262626]">
            <div className={style.connectBtn}>
              <ConnectButton />
            </div>

            <div className="mt-2">
              {userInfo ? (
                <Dropdown placement="bottom">
                  <DropdownTrigger>
                    <Button fullWidth startContent={<Avatar className="w-6 h-6 text-tiny" {...(userInfo?.pfpUrl ? { src: userInfo?.pfpUrl } : { name: userInfo?.displayName })} />} variant="bordered">
                      {userInfo?.displayName}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu disallowEmptySelection aria-label="Merge options" className="max-w-[300px]" selectionMode="single">
                    <DropdownItem key="merge" onPress={logout}>
                      Sign out
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              ) : (
                <Button fullWidth variant="bordered" onPress={login}>
                  Connect Facaster
                </Button>
              )}
            </div>

            <div className="h-px bg-[#262626] my-4"></div>

            <div>
              <Button
                fullWidth
                variant="bordered"
                onPress={() => {
                  setIsAboutOpen(true);
                }}
              >
                About Hares
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                fullWidth
                variant="bordered"
                onPress={() => {
                  window.open(HaresAiTwitterLink, "_blank");
                }}
              >
                <Twitter height={20} />
              </Button>

              <Button
                fullWidth
                variant="bordered"
                onPress={() => {
                  window.open(HaresAiWarpcastLink, "_blank");
                }}
              >
                <Warpcast height={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={cn("hidden", "xl:flex items-center gap-2")}>
        <div>
          {userInfo ? (
            <ButtonGroup variant="flat">
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button startContent={<Avatar className="w-6 h-6 text-tiny" {...(userInfo?.pfpUrl ? { src: userInfo?.pfpUrl } : { name: userInfo?.displayName })} />} variant="bordered">
                    {userInfo?.displayName}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu disallowEmptySelection aria-label="Merge options" className="max-w-[300px]" selectionMode="single">
                  <DropdownItem key="merge" onPress={logout}>
                    Sign out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </ButtonGroup>
          ) : (
            <button onClick={login} className="p-4 text-white">
              Connect Facaster
            </button>
          )}
        </div>
        <ConnectButton />
      </div>

      <Modal isOpen={isAboutOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">About Hares</ModalHeader>
              <ModalBody>
                <div>
                  Launch Meme Tokens on Base—Zero Code, Instant Trading
                  <br />
                  <br />
                  Minimize bot front-running during the bonding curve phase through Farcaster accounts and cryptography, ensuring a fair project launch.
                  <br />
                  <br />
                  Once the bonding curve collects approximately <span className="font-bold">4.2 ETH</span>, it migrates to a <span className="font-bold">Uniswap V3 Pool</span>. The collected{" "}
                  <span className="font-bold">4.2 ETH</span> and <span className="font-bold">200M remaining tokens</span> are pooled, launching with an initial market cap of around{" "}
                  <span className="font-bold">$84,000 USD</span>.
                  <br />
                  <br />
                  Upon graduation, meme developers receive <span className="font-bold">0.1 ETH</span> as a launch incentive and retain <span className="font-bold">50% of Uniswap LP fees</span> to
                  support continuous meme growth and innovation.
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  OK
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
