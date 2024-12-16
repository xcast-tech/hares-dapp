import { AuthClientError } from "@farcaster/auth-client";
import { Dialog } from "../dialog";
import styles from "./index.module.css";
import { QRCode } from "@farcaster/auth-kit";
import Image from "next/image";

export function QRCodeDialog({ open, onClose, url, isError, error }: { open: boolean; onClose: () => void; url: string; isError: boolean; error?: AuthClientError }) {
  return (
    <Dialog open={open} titleId="Sign in with Farcaster" onClose={onClose}>
      <div className="fc-authkit-qrcode-dialog">
        <div className={styles.body}>
          <Image className={styles.close} src="/login/close.svg" width={20} height={20} alt="" onClick={onClose} />
          {isError ? (
            <>
              <div className={styles.siwfHeading}>Error</div>
              <div className={styles.instructions}>{error?.message ?? "Unknown error, please try again."}</div>
            </>
          ) : (
            <>
              <div className={styles.siwfHeading}>Sign in with Farcaster</div>
              <div className={styles.instructions}>To sign in with Farcaster, scan the code below with your phone's camera.</div>
              <div className={styles.qrCodeImage}>
                <div className="qrcode-wrap">
                  <QRCode uri={url} size={240} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 500,
                  }}
                  onClick={() => {
                    window.open(url, "_blank");
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width={12} height={18} fill="none">
                    <title>Sign in With Farcaster QR Code</title>
                    <path
                      fill="#7C65C1"
                      fillRule="evenodd"
                      d="M0 3a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3Zm4-1.5v.75c0 .414.336.75.75.75h2.5A.75.75 0 0 0 8 2.25V1.5h1A1.5 1.5 0 0 1 10.5 3v12A1.5 1.5 0 0 1 9 16.5H3A1.5 1.5 0 0 1 1.5 15V3A1.5 1.5 0 0 1 3 1.5h1Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span style={{ marginLeft: "9px", color: "rgb(124, 101, 193)" }}>I'm using my phone →</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
