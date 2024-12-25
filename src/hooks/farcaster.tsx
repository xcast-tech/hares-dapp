import { QRCodeDialog } from "@/components/farcaster-dialog";
import { StatusAPIResponse, useSignIn } from "@farcaster/auth-kit";
import { redirect, usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { pick } from "lodash-es";
import { FarcasterUserInfo } from "@/lib/types";

const FarcasterContext = createContext<{
  login(): void;
  logout(): void;
  clearUserInfo(): void;
  userInfo: FarcasterUserInfo | null;
}>({
  login: () => { },
  logout: () => { },
  clearUserInfo: () => { },
  userInfo: null,
});

const FarcasterUserInfoLocalKey = "haresai-farcaster-user-info";

export const useFarcasterContext = () => useContext(FarcasterContext);

export default function FarcasterProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [modalVisible, setModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState<FarcasterUserInfo | null>(null);

  const clearUserInfo = () => {
    setUserInfo(null);
  };

  const handleSuccess = useCallback(async (response: StatusAPIResponse) => {
    setModalVisible(false);
    // const { message, signature } = response;
    const info = pick(response, ["fid", "displayName", "pfpUrl", "username", "message", "signature"]);
    localStorage.setItem(FarcasterUserInfoLocalKey, JSON.stringify(info));
    setUserInfo(info);
  }, []);

  const signInState = useSignIn({
    nonce: process.env.NEXT_PUBLIC_FARCASTER_NONCE,
    onSuccess: handleSuccess,
  });

  const {
    signIn,
    signOut,
    // isSuccess,
    connect,
    reconnect,
    isError,
    error,
    channelToken,
    url,
    // data,
    // validSignature
  } = signInState;

  useEffect(() => {
    console.log("Channel token:", channelToken);
    if (!channelToken) {
      connect();
    }
  }, [channelToken, connect]);

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const login = useCallback(() => {
    if (isError) {
      console.log("Reconnecting...", isError);
      reconnect();
    }

    signIn();
    if (url && isMobile()) {
      window.open(url, "_blank");
    }

    if (url) {
      console.log("Opening modal...", url);
      setModalVisible(true);
    }
  }, [isError, reconnect, signIn, url]);

  // const authenticated = isSuccess && validSignature

  const logout = useCallback(() => {
    signOut();
    localStorage.removeItem(FarcasterUserInfoLocalKey);
    setUserInfo(null);
  }, [signOut]);

  useEffect(() => {
    const farcasterUserInfoLocalJson = localStorage.getItem(FarcasterUserInfoLocalKey);
    if (farcasterUserInfoLocalJson) {
      try {
        setUserInfo(JSON.parse(farcasterUserInfoLocalJson));
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  return (
    <>
      <FarcasterContext.Provider value={{ login, logout, clearUserInfo, userInfo }}>{children}</FarcasterContext.Provider>
      {url && <QRCodeDialog open={modalVisible && !isMobile()} onClose={() => setModalVisible(false)} url={url} isError={isError} error={error} />}
    </>
  );
}
