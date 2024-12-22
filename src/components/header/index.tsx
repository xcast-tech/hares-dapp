import React, { use } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { Avatar, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { Twitter } from "../twitter";
import { Warpcast } from "../wrapcast";
import { useFarcasterContext } from "@/hooks/farcaster";

export const Header = () => {
  const { userInfo } = useFarcasterContext();

  const { login, logout } = useFarcasterContext();

  const [isAboutOpen, setIsAboutOpen] = React.useState(false);

  const onOpenChange = (open: boolean) => {
    setIsAboutOpen(open);
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-[72px] backdrop-blur px-12 z-10 flex justify-between items-center gap-6">
      <Link href="/">
        <div className="flex items-center gap-3">
          <div className="bg-theme w-8 h-8 rounded-lg">
            <img src="/logo.png" alt="Hares.ai" />
          </div>
          <img src="/logo-text.svg" alt="Hares.ai" />
        </div>
      </Link>
      <div className="h-4 w-[1px] bg-[#3d3d3d]"></div>
      <button onClick={() => {setIsAboutOpen(true)}} className="text-[#999] text-sm hover:text-white">About Hares</button>
      <div className="h-4 w-[1px] bg-[#3d3d3d]"></div>
      <div className="flex-1 flex items-center gap-4">
        <div className="flex gap-2 items-center">
          <Link href={"/"} target="_blank" className="p-2">
            <Twitter height={40} />
          </Link>
          <Link href="https://warpcast.com/hares-ai" target="_blank" className="p-2">
            <Warpcast height={20} />
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div>
          {userInfo ? (
            <Button startContent={<Avatar className="w-6 h-6 text-tiny" {...(userInfo?.pfpUrl ? { src: userInfo?.pfpUrl } : { name: userInfo?.displayName })} />} variant="bordered" onPress={logout}>
              {userInfo?.displayName}
            </Button>
          ) : (
            <button onClick={login} className="p-4 text-white">
              Sign in
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
