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
  useBalance,
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
import { isMobile as checkIsMobile } from "@/lib/utils";
import { useHaresContract } from "@/hooks/useHaresContract";

type ProfileType = {
  address: string;
};
interface GlobalContextType {
  isLogin: boolean;
  address: `0x${string}` | undefined;
  profile: ProfileType | undefined;
  isLoading: boolean;
  shouldSign: boolean;
  tradingLoading: boolean;
  setTradingLoading: (loading: boolean) => void;
  handleSign: () => void;
  isActionReady: boolean;
  isCorrectChain: boolean;
  isMobile: boolean;
  handleSwitchNetwork: () => Promise<void>;
  isBABValidated: boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const { validate } = useHaresContract();
  const { openConnectModal } = useConnectModal();
  const { switchChainAsync } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { address, chain, isConnected } = useAccount();
  const [profile, setProfile] = useState<ProfileType>();
  const [isLoading, setIsLoading] = useState(true);
  const [signLoading, setSignLoading] = useState(false);
  const [shouldSign, setShouldSign] = useState(false);
  const [tradingLoading, setTradingLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isBABValidated, setIsBABValidated] = useState(false);

  const isCorrectChain = useMemo(() => {
    return chain?.id === mainChain.id;
  }, [chain, mainChain]);

  const isActionReady = useMemo(() => {
    return Boolean(isConnected && address && !shouldSign);
  }, [isConnected, address, shouldSign]);

  const isLogin = useMemo(() => {
    return (
      profile?.address?.toLocaleLowerCase() === address?.toLocaleLowerCase()
    );
  }, [profile, address]);

  const handleSwitchNetwork = async () => {
    await switchChainAsync({
      chainId: mainChain.id,
    });
  };

  const handleSign = async () => {
    try {
      console.log("- handleSign");
      if (!address) {
        openConnectModal?.();
        return;
      }

      console.log("--- isCorrectChain", isCorrectChain);
      // switchNetwork;
      if (!isCorrectChain) {
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
    if (address && isConnected) {
      validate?.(address).then((res) => {
        setIsBABValidated(res);
      });
    }
  }, [isConnected, address, profile]);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsMobile(checkIsMobile());
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isLogin,
        address,
        profile,
        isLoading,
        isActionReady,
        isCorrectChain,
        shouldSign,
        handleSign,
        tradingLoading,
        setTradingLoading,
        handleSwitchNetwork,
        isMobile,
        isBABValidated,
      }}
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
