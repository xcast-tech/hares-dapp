import { ConnectButton } from "@rainbow-me/rainbowkit";
import styled from "@emotion/styled";
import { useGlobalCtx } from "@/context/useGlobalCtx";
import DisconnectIcon from "~@/icons/disconnect.svg";
import Avatar from "boring-avatars";
import { useAccount, useConnect, useConnectors, useDisconnect } from "wagmi";

const WalletConnectButton = () => {
  const { signLoading, shouldSign, handleSign, isMobile } = useGlobalCtx();
  const { isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  return (
    <>
      {/* <ConnectButton /> */}
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          connectModalOpen,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== "loading";
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === "authenticated");

          if (connected)
            return (
              <CryptoBalanceDisplay
                address={account.address}
                balance={account.displayBalance}
                walletAddress={account.address}
                onClick={() => {
                  openAccountModal();
                }}
                onDisconnect={disconnect}
              />
            );

          // 连接钱包
          return (
            <ConnectBtnBox>
              <ConnectBtnBoxInner>
                <ConnectBtn
                  disabled={signLoading}
                  onClick={() => {
                    if (connectModalOpen) return;
                    openConnectModal();
                  }}
                >
                  {connectModalOpen && isConnecting
                    ? "Waiting for Connect..."
                    : "Connect Wallet"}
                </ConnectBtn>
              </ConnectBtnBoxInner>
            </ConnectBtnBox>
          );
        }}
      </ConnectButton.Custom>
    </>
  );
};

export default WalletConnectButton;

interface WalletInfoProps {
  address?: string;
  balance?: string;
  walletAddress: string;
  onClick?: () => void;
  onDisconnect?: () => void;
}

const CryptoBalanceDisplay: React.FC<WalletInfoProps> = ({
  address,
  balance,
  walletAddress,
  onClick,
  onDisconnect,
}) => {
  const {
    shouldSign,
    signLoading,
    handleSign,
    isMobile,
    isActionReady,
    isCorrectChain,
    handleSwitchNetwork,
  } = useGlobalCtx();
  // Truncate wallet address
  const truncatedAddress =
    walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4);

  return (
    <>
      <ConnectBtnBox>
        <ConnectBtnBoxInner>
          <ProfileBtn
            onClick={async () => {
              if (signLoading) return;
              if (!isActionReady) {
                handleSign();
                return;
              }
              if (!isCorrectChain) {
                await handleSwitchNetwork();
              }
              onClick && onClick();
            }}
          >
            {!isCorrectChain ? (
              <SignMessage>Wrong Network</SignMessage>
            ) : shouldSign ? (
              <SignMessage>
                {signLoading ? "Waiting for Sign..." : "Sign Message"}
              </SignMessage>
            ) : (
              <>
                {/* <BalanceText>{balance}</BalanceText> */}
                <Avatar
                  className="wallet-avatar"
                  name={address}
                  variant="beam"
                />
                <WalletAddress>{truncatedAddress}</WalletAddress>
                <DisconnectIcon
                  className="disconnect-icon"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDisconnect && onDisconnect();
                  }}
                />
              </>
            )}
          </ProfileBtn>
        </ConnectBtnBoxInner>
      </ConnectBtnBox>
    </>
  );
};

const ConnectBtnBox = styled.div`
  padding: 1px;
  border-radius: 16px;
  background-image: linear-gradient(
    60deg,
    rgba(234, 236, 239, 0.2) 0%,
    rgba(234, 236, 239, 0.2) 80%,
    rgba(255, 255, 255, 0.8) 100%
  );
`;

const ConnectBtnBoxInner = styled.div`
  border-radius: 16px;
  background: var(--background);
  height: 40px;
`;

const ConnectBtn = styled.button`
  display: flex;
  height: 40px;
  padding: 0px 24px;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  // border: 1px solid rgba(234, 236, 239, 0.12);
  background-image: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05) 80%,
    rgba(255, 255, 255, 0.4) 100%
  );

  color: #eaecef;

  text-align: center;
  font-size: 13px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%;

  &:disabled {
    opacity: 0.5;
  }

  @media screen and (max-width: 1024px) {
    padding: 0px 12px;
    width: 100%;
  }
`;

// finish style like rainbowkit wallet button
const ProfileBtn = styled.button`
  position: relative;
  display: flex;
  height: 40px;
  padding: 0px 12px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 16px;
  // border: 1px solid rgba(234, 236, 239, 0.2);

  border-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.2) 80%,
      rgba(255, 255, 255, 0.5)
    )
    10;

  color: #eaecef;

  text-align: center;
  font-size: 13px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%;

  .wallet-avatar {
    width: 20px;
    height: 20px;
  }

  .disconnect-icon {
    width: 14px;
    height: 14px;
    color: #fff;
    opacity: 0.5;
  }

  &:hover {
    .disconnect-icon {
      opacity: 1;
    }
  }

  &:disabled {
    opacity: 0.5;
  }

  @media screen and (max-width: 1024px) {
    width: 100%;
  }
`;

const SignMessage = styled.span`
  padding: 8px 12px;
`;

const WalletAddress = styled.span`
  margin-right: 4px;
`;

const StyledDisconnectIcon = styled.button`
  width: 14px;
  height: 14px;
  color: #fff;
  opacity: 0.5;
`;
