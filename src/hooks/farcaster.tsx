import { QRCodeDialog } from "@/components/farcaster-dialog";
import { StatusAPIResponse, useSignIn } from "@farcaster/auth-kit";
import { redirect, usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const FarcasterContext = createContext({
  login: () => {},
  logout: () => {},
  clearUserInfo: () => {},
  userInfo: null as any,
});

export const useFarcasterContext = () => useContext(FarcasterContext);

export default function FarcasterProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [modalVisible, setModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const clearUserInfo = () => {
    setUserInfo(null);
  };

  const handleSuccess = useCallback(async (response: StatusAPIResponse) => {
    setModalVisible(false);
    const { message, signature } = response;
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
  }, [signOut]);

  return (
    <>
      <FarcasterContext.Provider value={{ login, logout, clearUserInfo, userInfo }}>{children}</FarcasterContext.Provider>
      {url && <QRCodeDialog open={modalVisible && !isMobile()} onClose={() => setModalVisible(false)} url={url} isError={isError} error={error} />}
    </>
  );
}
