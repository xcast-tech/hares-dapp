import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import {
  useAccount,
  useDisconnect,
  useSignMessage,
  useSwitchChain,
} from "wagmi"; // Replace with the actual hook import
import {
  ConnectButton,
  useConnectModal,
  useAccountModal,
  useChainModal,
} from "@rainbow-me/rainbowkit";
import { loginSignText, mainChain } from "@/lib/constant";

type ProfileType = {
  address: string;
};
interface GlobalContextType {
  isLogin: boolean;
  address: string | undefined;
  profile: ProfileType | undefined;
  isLoading: boolean;
  shouldSign: boolean;
  handleSign: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const { openConnectModal } = useConnectModal();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { address, chain, isConnected } = useAccount(); // 获取当前网络信息
  const [profile, setProfile] = useState<ProfileType>();
  const [isLoading, setIsLoading] = useState(true);
  const [signLoading, setSignLoading] = useState(false);
  const [shouldSign, setShouldSign] = useState(false);

  const isLogin = useMemo(() => {
    return (
      profile?.address?.toLocaleLowerCase() === address?.toLocaleLowerCase()
    );
  }, [profile, address]);

  const handleSign = async () => {
    try {
      console.log("- handleSign");
      if (!address) {
        openConnectModal?.();
        return;
      }

      // switchNetwork;
      if (chain?.id !== mainChain.id) {
        await switchChainAsync({
          chainId: mainChain.id,
        });
      }

      setSignLoading(true);
      const signature = await signMessageAsync({
        account: address,
        message: loginSignText,
      });

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
          signature,
        }),
      }).then((d) => d.json());

      if (res.code === 0) {
        fetchProfile();
        setShouldSign(false);
      }
      console.log("- handleSignres", res);
      // location.reload();
    } catch (err: any) {
      console.log("error", err);
      if (err.message.includes("User rejected the request.")) {
        setSignLoading(false);
        disconnect();
        return;
      }
      // toast({
      //   position: "top",
      //   title: err.message || "Sign message failed",
      //   status: "error",
      //   duration: 3000,
      //   isClosable: false,
      // });
    } finally {
      setSignLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/user");
      const data = await res.json();
      if (data.code === 0) {
        const profile = data.data;
        setProfile(data.data);
        return profile;
      }
      return null;
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isConnected || !address || !profile) return;
    if (profile.address?.toLowerCase() !== address.toLowerCase()) {
      setShouldSign(true);
      handleSign();
      return;
    }
  }, [isConnected, address, profile]);

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <GlobalContext.Provider
      value={{ isLogin, address, profile, isLoading, shouldSign, handleSign }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalCtx = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalCtx must be used within a GlobalProvider");
  }
  return context;
};
