import { track as originTrack } from "@vercel/analytics";

export const isMobileDevice = () => {
  if (typeof window === "undefined") return false;
  return (
    /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.matchMedia("(max-width: 1024px)").matches
  );
};

export const track = async (event: string, params: any) => {
  const time = new Date();
  const date = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
  const mobile = isMobileDevice();

  originTrack(event, {
    ...params,
    mobile,
    date,
  });
};
