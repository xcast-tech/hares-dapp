import { ConnectButton } from "@rainbow-me/rainbowkit";
import styled from "@emotion/styled";
import { formatAddressString } from "@/lib/utils";

const WalletConnectButton = () => {
  return (
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
        // const ready = mounted && authenticationStatus !== 'loading';
        // const connected =
        //   ready &&
        //   account &&
        //   chain &&
        //   (!authenticationStatus ||
        //     authenticationStatus === 'authenticated');

        if (account?.address)
          return (
            <ConnectBtn onClick={openAccountModal}>
              {formatAddressString(account.address)}
            </ConnectBtn>
          );

        // 连接钱包
        return (
          <ConnectBtn onClick={openConnectModal}>Connect Wallet</ConnectBtn>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletConnectButton;

// finish style like rainbowkit wallet button
const ConnectBtn = styled.button`
  background: linear-gradient(90deg, #ff7a18, #af002d 70%);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  padding: 12px 24px;
  text-align: center;
  transition: background 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #af002d, #ff7a18 70%);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 122, 24, 0.5);
  }

  &:active {
    background: linear-gradient(90deg, #af002d, #ff7a18 70%);
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  }
`;
