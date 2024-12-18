import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Logo from "@/../public/logo.svg";
import Link from "next/link";
import { Avatar, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { Twitter } from "../twitter";
import { Warpcast } from "../wrapcast";
import { useProfile } from "@farcaster/auth-kit";
import { useFarcasterContext } from "@/hooks/farcaster";

export const Header = () => {
  const {
    isAuthenticated,
    profile: { username, fid, bio, displayName, pfpUrl },
  } = useProfile();

  const { login, logout } = useFarcasterContext();

  const [isAboutOpen, setIsAboutOpen] = React.useState(false);

  const onOpenChange = (open: boolean) => {
    setIsAboutOpen(open);
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-[80px] backdrop-blur px-4 z-10 flex justify-between items-center gap-4">
      <Link href="/">
        <div className="flex items-center gap-2">
          <Logo height={32} />
          <div className="font-semibold">hares.ai</div>
        </div>
      </Link>

      <div className="flex-1 flex items-center gap-4">
        <Button
          color="primary"
          variant="light"
          onPress={() => {
            setIsAboutOpen(true);
          }}
        >
          About Hares
        </Button>

        <div className="flex gap-2 items-center">
          <Link href={"/"} target="_blank">
            <Twitter height={40} />
          </Link>

          <Link href={"/"} target="_blank">
            <Warpcast height={20} />
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div>
          {isAuthenticated ? (
            <Button startContent={<Avatar src={pfpUrl} className="w-6 h-6" />} variant="bordered" onPress={logout}>
              {username}
            </Button>
          ) : (
            <Button onPress={login} size="sm">
              sign in
            </Button>
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
