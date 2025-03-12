import { Html, Head, Main, NextScript } from "next/document";
import { Analytics } from "@vercel/analytics/react";
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>BAB.fun</title>
        <link rel="icon" href="/babfun-logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Build And Build For Fun." />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className={`antialiased`}>
        <Main />
        <NextScript />
        <Analytics />
      </body>
    </Html>
  );
}
