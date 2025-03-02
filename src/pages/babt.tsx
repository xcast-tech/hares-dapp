import React from "react";
import styled from "@emotion/styled";
import Link from "next/link";

const BabtComponent = () => {
  return (
    <Container>
      <AboutContainer>
        <AboutImage src="/bab-token.gif" alt="About Image" />
        <AboutTitle>About BAB Token</AboutTitle>
        <AboutDesc>
          Binance Account Bound (BAB) Token is an official token from Binance
          that proves a user has completed KYC verification. Each user can only
          have one BABT, and it is non-transferable. It helps verify if a wallet
          is controlled by a real user, preventing bots or malicious activity.
        </AboutDesc>
      </AboutContainer>
      <FunBox>
        <FunTitle>BAB.FUN</FunTitle>
        <FunDesc>
          Inspired by the BAB token, BAB.FUN deeply values the contributions of
          a dedicated group of passionate supporters from the very early stages
          of a token. We leverages BAB token-gate to ensure a bot-proof launch
          experience. During the bonding curve phase, only wallets holding BAB
          token are eligible to buy/sell, preventing unfair advantages and
          ensuring a fair distribution.
        </FunDesc>
        <FunSection>
          <FunSectionImg src="/fun-section-1.svg" alt="BABT Icon" />
          <FunSectionTitle>Tokenomics</FunSectionTitle>
          <FunSectionDesc>
            All tokens issued through BAB.Fun have a total supply of{" "}
            <b>1 billion</b>, with <b>80%</b> allocated during the bonding curve
            phase. Once the bonding curve collects approximately <b>19.1 BNB</b>
            , the protocol seamlessly transitions to a PancakeSwap V3 pool. At
            this stage, the accumulated BNB, along with 200M remaining tokens,
            are pooled together, kickstarting the token’s liquidity with an
            initial market cap of around <b>$62,000 USD</b>.
          </FunSectionDesc>
        </FunSection>
        <FunSection>
          <FunSectionImg src="/fun-section-2.svg" alt="BABT Icon" />
          <FunSectionTitle>Creator Reward</FunSectionTitle>
          <FunSectionDesc>
            Enjoy <b>40%</b> perpetual LP fee rewards, providing long-term
            incentives for token creators.
          </FunSectionDesc>
        </FunSection>
      </FunBox>
      <StartFunContainer>
        <StartFunTitle>Ready to Start Using BAB.FUN?</StartFunTitle>
        <StartFunImageBox>
          <Link
            href="https://www.binance.com/join?ref=456192355"
            target="_blank"
          >
            <StartFunTouchItem1></StartFunTouchItem1>
          </Link>
          <Link href="https://www.binance.com/en/BABT" target="_blank">
            <StartFunTouchItem2></StartFunTouchItem2>
          </Link>
          <StartFunImage src="/start-fun.png" alt="Start Fun" />
        </StartFunImageBox>
      </StartFunContainer>
    </Container>
  );
};

export default BabtComponent;

const Container = styled.div`
  border-radius: 8px;
  padding: 0 24px;
  max-width: 824px;
  min-height: 100vh;
  margin: 0 auto;
  padding-top: var(--header-h);
  display: flex;
  flex-direction: column;
  gap: 64px;
  padding-bottom: 60px;
  @media screen and (max-width: 1024px) {
    padding: 0 12px;
  }
`;

const AboutContainer = styled.div`
  display: flex;
  padding: 40px 48px;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
`;

const AboutImage = styled.img`
  width: 280px;
  height: 280px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
`;

const AboutTitle = styled.h1`
  margin-top: 24px;
  text-align: center;
  font-family: var(--font-climate-crisis);
  font-size: 36px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  background: linear-gradient(
    96deg,
    #1c1c1c -9.54%,
    #fff 49.6%,
    #303030 105.26%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const AboutDesc = styled.p`
  margin-top: 16px;
  color: #eaecef;
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 150%; /* 24px */
`;

const FunBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;
`;

const FunTitle = styled.h2`
  color: #eaecef;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%; /* 42px */
`;

const FunDesc = styled.p`
  color: #eaecef;
  text-align: justify;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 160%; /* 20.8px */
`;

const FunSection = styled.div`
  display: flex;
  padding: 40px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-self: stretch;

  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.01);
`;

const FunSectionImg = styled.img`
  width: 80px;
  height: 80px;
`;

const FunSectionTitle = styled.h3`
  margin-top: 8px;
  color: #eaecef;
  text-align: center;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%; /* 27px */
`;

const FunSectionDesc = styled.p`
  margin-top: 16px;
  color: rgba(234, 236, 239, 0.8);
  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 180%; /* 21.6px */
  > b {
    color: #fcd535;
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: 180%;
  }
`;

const StartFunContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StartFunTitle = styled.h2`
  color: #eaecef;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%; /* 42px */
`;

const StartFunImageBox = styled.div`
  position: relative;
  width: 100%;
`;

const StartFunImage = styled.img`
  width: 100%;
  height: auto;
`;

const StartFunTouchItem1 = styled.div`
  position: absolute;
  top: 41%;
  right: 10%;
  width: 26%;
  height: 8%;
  cursor: pointer;
  z-index: 2;
`;

const StartFunTouchItem2 = styled.div`
  position: absolute;
  top: 51%;
  right: 10%;
  width: 26%;
  height: 8%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  z-index: 2;
`;
