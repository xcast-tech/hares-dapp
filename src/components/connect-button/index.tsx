import { ConnectButton } from "@rainbow-me/rainbowkit";
import styled from "@emotion/styled";
import { useGlobalCtx } from "@/context/useGlobalCtx";

const WalletConnectButton = () => {
  const { shouldSign, handleSign } = useGlobalCtx();
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
            <ConnectBtn disabled={!ready} onClick={openConnectModal}>
              Connect Wallet
            </ConnectBtn>
          );
        }}
      </ConnectButton.Custom>
    </>
  );
};

export default WalletConnectButton;

interface WalletInfoProps {
  shouldSign?: boolean;
  balance?: string;
  walletAddress: string;
  onClick?: (shouldSign?: boolean) => void;
}

const CryptoBalanceDisplay: React.FC<WalletInfoProps> = ({
  shouldSign,
  balance,
  walletAddress,
  onClick,
}) => {
  // Truncate wallet address
  const truncatedAddress =
    walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4);

  return (
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
          <BalanceText>{balance}</BalanceText>
          <WalletAddressContainer>
            <WalletAddress>{truncatedAddress}</WalletAddress>
            <DropdownIcon>
              <svg
                fill="none"
                height="7"
                width="14"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Dropdown</title>
                <path
                  d="M12.75 1.54001L8.51647 5.0038C7.77974 5.60658 6.72026 5.60658 5.98352 5.0038L1.75 1.54001"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  xmlns="http://www.w3.org/2000/svg"
                ></path>
              </svg>
            </DropdownIcon>
          </WalletAddressContainer>
        </>
      )}
    </ProfileBtn>
  );
};

const ConnectBtn = styled.button`
  background-color: #6a3cd6;
  color: white;
  font-size: 16px;
  font-weight: 700;
  height: 40px;
  line-height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.125s;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  transform: scale(1);

  &:hover {
    transform: scale(1.025);
  }

  &:disabled {
    background-color: #a4c2f4;
    cursor: not-allowed;
  }
`;

// finish style like rainbowkit wallet button
const ProfileBtn = styled.button`
  display: flex;
  align-items: center;
  background-color: #1a1b1f;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: all 0.125s;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  transform: scale(1);

  &:hover {
    transform: scale(1.025);
  }

  &:disabled {
    background-color: #a4c2f4;
    cursor: not-allowed;
  }
`;

const SignMessage = styled.span`
  padding: 8px 12px;
`;

const BalanceText = styled.span`
  padding: 8px;
  padding-left: 12px;
`;

const WalletAddressContainer = styled.div`
  padding: 6px 8px;
  display: flex;
  align-items: center;
  margin-left: auto;
  background: linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.075),
    rgba(255, 255, 255, 0.15)
  );
  border-radius: 12px;
  height: 36px;
`;

const WalletAddress = styled.span`
  margin-right: 4px;
`;

const DropdownIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
