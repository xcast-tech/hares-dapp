import React, { use, useMemo, useState } from "react";
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
} from "@heroui/react";
import { Twitter } from "../twitter";
import { Warpcast } from "../wrapcast";
import { cn } from "@/lib/utils";
import { Expand } from "../icons/expand";
import { Close } from "../icons/close";
import { HaresAiTwitterLink, HaresAiWarpcastLink } from "@/lib/constant";
import { useConnect, useDisconnect, useAccountEffect } from "wagmi";
import ConnectButton from "@/components/connect-button";
import styled from "@emotion/styled";
import LogoIcon from "~@/icons/logo.svg";
import XIcon from "~@/icons/x.svg";
import MenuIcon from "~@/icons/menu.svg";
import { usePathname } from "next/navigation";
import styles from "./style.module.scss";
import DrawerRight from "@/components/common/drawer/right";

export const Header = () => {
  const [isAboutOpen, setIsAboutOpen] = React.useState(false);
  const pathname = usePathname();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // const [expand, setExpand] = useState(false);

  // const onOpenChange = (open: boolean) => {
  //   setIsAboutOpen(open);
  // };

  const navs = useMemo(() => {
    return [
      {
        text: "Board",
        href: "/",
        type: "path",
        active: pathname === "/",
      },
      {
        text: "Create Coin",
        href: "/create",
        type: "path",
        active: pathname === "/create",
      },
      {
        key: "babt",
        text: "About BABT",
        type: "modal",
      },
    ];
  }, [pathname]);

  const rightNavs = [
    {
      type: "link",
      link: "https://twitter.com/haresai",
      icon: <XIcon />,
    },
  ];

  useAccountEffect({
    onDisconnect() {
      console.log("wallet connect Disconnected!");
      fetch("/api/logout", {
        method: "POST",
      })
        .then((d) => d.json())
        .then((d) => {
          if (d.code === 0) {
            window.location.reload();
          }
        });
    },
  });

  return (
    <StyledHeader expend={isOpen}>
      <StyledHeaderContainer>
        <StyledHeaderLeft>
          <Link href="/">
            <StyledHeaderLogo>
              <LogoIcon />
            </StyledHeaderLogo>
          </Link>
          <StyledHeaderNavs>
            {navs.map((nav) => {
              if (nav.type === "path") {
                return (
                  <Link href={nav.href ?? "/"} key={nav.text}>
                    <StyledHeaderNav active={nav.active}>
                      {nav.text}
                    </StyledHeaderNav>
                  </Link>
                );
              } else if (nav.type === "modal") {
                return (
                  <StyledHeaderNav
                    active={nav.active}
                    onClick={() => {
                      setIsAboutOpen(true);
                    }}
                  >
                    {nav.text}
                  </StyledHeaderNav>
                );
              }
            })}
          </StyledHeaderNavs>
        </StyledHeaderLeft>
        <StyledHeaderRight>
          <StyledHeaderRightNavs>
            {rightNavs.map((nav) => {
              if (nav.type === "link") {
                return (
                  <Link href={nav.link} key={nav.link}>
                    <StyledHeaderRightNav>{nav.icon}</StyledHeaderRightNav>
                  </Link>
                );
              }
            })}
          </StyledHeaderRightNavs>
          <StyledConnectBox>
            <ConnectButton />
          </StyledConnectBox>
        </StyledHeaderRight>

        <MobileStyledNavs>
          <Link href="/create">
            <MobileStyledCreateCoin>
              <MobileStyledCreateCoinInner>
                start a new coin
              </MobileStyledCreateCoinInner>
            </MobileStyledCreateCoin>
          </Link>
          <MobileStyledExpand>
            <MobileStyledExpandMenu onClick={onOpen}>
              <MenuIcon className="menu-icon" />
            </MobileStyledExpandMenu>
            <DrawerRight isOpen={isOpen} onOpenChange={onOpenChange}>
              <>
                <MobileStyledMenuNavs>
                  {navs.map((nav, idx) => {
                    return (
                      <>
                        {nav.type === "path" ? (
                          <Link href={nav.href!} key={idx}>
                            <MobileStyledMenuNav active={nav.active}>
                              {nav.text}
                            </MobileStyledMenuNav>
                          </Link>
                        ) : (
                          <MobileStyledMenuNav key={idx} active={nav.active}>
                            {nav.text}
                          </MobileStyledMenuNav>
                        )}
                        <MobileStyledMenuDivider />
                      </>
                    );
                  })}
                </MobileStyledMenuNavs>
                <MobileStyledConnectBox>
                  <ConnectButton />
                </MobileStyledConnectBox>
              </>
            </DrawerRight>
          </MobileStyledExpand>
        </MobileStyledNavs>

        {/* <div className="hidden lg:flex-1 lg:flex lg:items-center lg:gap-6">
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
      </div> */}

        {/* <div className={cn("xl:hidden")}>
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
            className={cn(
              "hidden absolute z-[1000] top-[52px] left-0 right-0 h-[calc(100vh-52px)]",
              {
                block: expand,
              }
            )}
          >
            <div className="absolute z-0 inset-0 backdrop-blur-xl bg-black/80"></div>
            <div className="relative z-10 p-4 bg-[#141414] rounded-b-[16px] border-solid border-b-1 border-[#262626]">
              <div>
                <ConnectButton />
              </div>

              <div className="h-px bg-[#262626] my-4"></div>

              <div>
                <Button
                  fullWidth
                  variant="bordered"
                  onPress={() => {
                    setIsAboutOpen(true);
                  }}
                  className="font-medium"
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
        </div> */}

        {/* <div className={cn("hidden", "xl:flex items-center gap-2")}>
          <ConnectButton />
        </div> */}

        {/* <Modal isOpen={isAboutOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  About Hares
                </ModalHeader>
                <ModalBody>
                  <div>
                    Launch Meme Tokens on Base—Zero Code, Instant Trading
                    <br />
                    <br />
                    Minimize bot front-running during the bonding curve phase
                    through Farcaster accounts and cryptography, ensuring a fair
                    project launch.
                    <br />
                    <br />
                    Once the bonding curve collects approximately{" "}
                    <span className="font-bold">4.2 ETH</span>, it migrates to a{" "}
                    <span className="font-bold">Uniswap V3 Pool</span>. The
                    collected <span className="font-bold">4.2 ETH</span> and{" "}
                    <span className="font-bold">200M remaining tokens</span> are
                    pooled, launching with an initial market cap of around{" "}
                    <span className="font-bold">$84,000 USD</span>.
                    <br />
                    <br />
                    Upon graduation, meme developers receive{" "}
                    <span className="font-bold">0.1 ETH</span> as a launch
                    incentive and retain{" "}
                    <span className="font-bold">50% of Uniswap LP fees</span> to
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
        </Modal> */}
      </StyledHeaderContainer>
    </StyledHeader>
  );
};

const StyledHeader = styled.div<{ expend: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: ${(props) => (props.expend ? 40 : 1000)};
  background: rgba(2, 3, 8, 0.9);

  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  box-sizing: content-box;

  @media screen and (max-width: 1024px) {
    background: rgba(255, 255, 255, 0.01);
    border-bottom: 0.5px solid rgba(255, 255, 255, 0.12);
  }
`;

const StyledHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 60px;
  height: var(--header-h);
  width: 100%;
  max-width: 1200px;
  box-sizing: content-box;
  margin: 0 auto;

  @media screen and (max-width: 1024px) {
    padding: 0 10px;
  }
`;

const StyledHeaderLeft = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 40px;
`;

const StyledHeaderLogo = styled.div`
  width: 80px;
  color: #fcd535;
  @media screen and (max-width: 1024px) {
    width: 70px;
  }
`;

const StyledHeaderNavs = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 40px;
  color: #eaecef;

  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%;

  @media screen and (max-width: 1024px) {
    display: none;
  }
`;

const StyledHeaderNav = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  opacity: ${(props) => (props.active ? 1 : 0.4)};
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
`;

const StyledHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  @media screen and (max-width: 1024px) {
    display: none;
  }
`;

const StyledHeaderRightNavs = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const StyledHeaderRightNav = styled.button`
  padding: 8px;
  color: #fff;
  opacity: 0.4;
  &:hover {
    opacity: 1;
  }
  svg {
    width: 24px;
    height: 24px;
  }
`;

const StyledConnectBox = styled.div``;

const MobileStyledNavs = styled.div`
  display: none;
  @media screen and (max-width: 1024px) {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 20px;
  }
`;
const MobileStyledCreateCoin = styled.div`
  display: none;
  @media screen and (max-width: 1024px) {
    display: flex;
    height: 36px;
    padding: 3px;
    gap: 10px;

    border-radius: 100px;
    border: 1.5px solid rgba(252, 213, 53, 0.4);
    background: #090920;
  }
`;

const MobileStyledCreateCoinInner = styled.div`
  display: flex;
  padding: 0px 12px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex: 1 0 0;

  border-radius: 100px;
  background: linear-gradient(274deg, #ffc720 0%, #fcd535 49.5%);

  color: #020308;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%; /* 18px */
  text-transform: capitalize;
`;

const MobileStyledExpand = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MobileStyledExpandMenu = styled.button`
  padding: 0;
  outline: none;
  width: 24px;
  height: 24px;
  background: transparent;
  .menu-icon {
    width: 24px;
    height: 24px;
    color: #eaecef;
  }
`;

const MobileStyledMenuNavs = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MobileStyledMenuNav = styled.button<{ active?: boolean }>`
  width: 100%;
  outline: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  color: #eaecef;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 150%; /* 27px */
`;

const MobileStyledMenuDivider = styled.div`
  width: 100%;
  height: 1px;
  background: #2b3139;
`;

const MobileStyledConnectBox = styled.div`
  width: 100%;
`;
