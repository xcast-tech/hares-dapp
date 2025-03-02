import { ConnectButton } from "@rainbow-me/rainbowkit";
import styled from "@emotion/styled";
import { useGlobalCtx } from "@/context/useGlobalCtx";
import DisconnectIcon from "~@/icons/disconnect.svg";
import Avatar from "boring-avatars";

const WalletConnectButton = () => {
  const { shouldSign, handleSign, isMobile } = useGlobalCtx();
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
                shouldSign={shouldSign}
                balance={account.displayBalance}
                walletAddress={account.address}
                onClick={(sign) => {
                  console.log("CryptoBalanceDisplay onClick shouldSign:", sign);
                  if (sign) {
                    handleSign();
                    return;
                  }
                  openAccountModal();
                }}
              />
            );

          // 连接钱包
          return (
            <ConnectBtnBox>
              <ConnectBtn disabled={!ready} onClick={openConnectModal}>
                Connect Wallet
              </ConnectBtn>
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
  shouldSign?: boolean;
  balance?: string;
  walletAddress: string;
  onClick?: (shouldSign?: boolean) => void;
}

const CryptoBalanceDisplay: React.FC<WalletInfoProps> = ({
  address,
  shouldSign,
  balance,
  walletAddress,
  onClick,
}) => {
  const { isMobile } = useGlobalCtx();
  // Truncate wallet address
  const truncatedAddress =
    walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4);

  return (
    <ConnectBtnBox>
      <ProfileBtn
        onClick={() => {
          console.log("ProfileBtn onClick");
          onClick && onClick(shouldSign);
        }}
      >
        {shouldSign ? (
          <SignMessage>Sign Message</SignMessage>
        ) : (
          <>
            {/* <BalanceText>{balance}</BalanceText> */}
            <Avatar className="wallet-avatar" name={address} variant="beam" />
            <WalletAddress>{truncatedAddress}</WalletAddress>
            <DisconnectIcon className="disconnect-icon" />
          </>
        )}
      </ProfileBtn>
    </ConnectBtnBox>
  );
};

const ConnectBtnBox = styled.div`
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
`;
const ConnectBtn = styled.button`
  display: flex;
  height: 40px;
  padding: 0px 24px;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  border: 1px solid rgba(234, 236, 239, 0.12);

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
  display: flex;
  height: 40px;
  padding: 0px 12px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 16px;
  border: 1px solid rgba(234, 236, 239, 0.12);

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
