import React, { use, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import Link from "next/link";
import VerticalTabs from "@/components/common/vertical-tabs";
import { useSearchParams } from "next/navigation";
import { debounce, throttle } from "lodash-es";

const BabtComponent = () => {
  const searchParams = useSearchParams();
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeTab, setActiveTab] = React.useState("about");

  const tabsMap: Record<string, number> = {
    about: 0,
    fun: 1,
    start: 2,
  };
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.history.replaceState(null, "", `#${tabId}`);
  };

  const handleScrollTo = (tabId: string) => {
    const idx = tabsMap[tabId];
    if (sectionsRef.current[idx]) {
      window.scrollTo({
        top: sectionsRef.current[idx].offsetTop - 118,
        behavior: "smooth",
      });
    }
  };

  // useEffect(() => {
  //   const idx = tabsMap[activeTab];
  //   if (sectionsRef.current[idx]) {
  //     window.scrollTo({
  //       top: sectionsRef.current[idx].offsetTop - 118,
  //       behavior: "smooth",
  //     });
  //   }
  // }, [activeTab]);

  useEffect(() => {
    // Parse the hash from the URL
    const hash = window.location.hash.substring(1); // Remove the '#' character
    if (hash && tabsMap[hash] !== undefined) {
      setActiveTab(hash);
      handleScrollTo(hash);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      sectionsRef.current.forEach((section, index) => {
        if (section && scrollTop >= section.offsetTop - 118) {
          const id = section.getAttribute("id");
          setActiveTab(id || "about");
          window.history.replaceState(null, "", `#${id || "about"}`);
        }
      });
    };

    const throttleScroll = throttle(handleScroll, 100);

    window.addEventListener("scroll", throttleScroll);

    return () => {
      window.removeEventListener("scroll", throttleScroll);
    };
  }, [sectionsRef.current]);

  return (
    <BabtMain>
      <BabtBG1 src="/babt-bg-1.png" alt="BABT Background 1" />
      <BabtBG2 src="/babt-bg-2.png" alt="BABT Background 1" />
      <BabtTabsWrapper>
        <BabtTabs>
          <VerticalTabs
            value={activeTab}
            onChange={handleTabChange}
            onClick={handleScrollTo}
          />
        </BabtTabs>
      </BabtTabsWrapper>
      <Container>
        <AboutContainer
          id="about"
          ref={(el) => {
            sectionsRef.current[0] = el;
          }}
        >
          <AboutImage src="/bab-token.gif" alt="About Image" />
          <AboutTitle>About BAB Token</AboutTitle>
          <AboutDesc>
            Binance Account Bound (BAB) Token is an official token from Binance
            that proves a user has completed KYC verification. Each user can
            only have one BABT, and it is non-transferable. It helps verify if a
            wallet is controlled by a real user, preventing bots or malicious
            activity.
          </AboutDesc>
          <Link href="https://www.binance.com/en/BABT" target="_blank">
            <AboutBtn>Mint BAB Token</AboutBtn>
          </Link>
        </AboutContainer>
        <FunBox
          id="fun"
          ref={(el) => {
            sectionsRef.current[1] = el;
          }}
        >
          <FunTitle>BAB.FUN</FunTitle>
          <FunDesc>
            Inspired by the BAB token, BAB.FUN deeply values the contributions
            of a dedicated group of passionate supporters from the very early
            stages of a token. We leverages BAB token-gate to ensure a bot-proof
            launch experience. During the bonding curve phase, only wallets
            holding BAB token are eligible to buy/sell, preventing unfair
            advantages and ensuring a fair distribution.
          </FunDesc>
          <FunSection>
            <FunSectionImg src="/fun-section-1.svg" alt="BABT Icon" />
            <FunSectionTitle>Tokenomics</FunSectionTitle>
            <FunSectionDesc>
              All tokens issued through BAB.Fun have a total supply of{" "}
              <b>1 billion</b>, with <b>80%</b> allocated during the bonding
              curve phase. Once the bonding curve collects approximately{" "}
              <b>19.1 BNB</b>, the protocol seamlessly transitions to a
              PancakeSwap V3 pool. At this stage, the accumulated BNB, along
              with 200M remaining tokens, are pooled together, kickstarting the
              token’s liquidity with an initial market cap of around{" "}
              <b>$62,000 USD</b>.
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
        <StartFunContainer
          id="start"
          ref={(el) => {
            sectionsRef.current[2] = el;
          }}
        >
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
            <StartFunImageMobile src="/start-fun-mobile.png" alt="Start Fun" />
          </StartFunImageBox>
          <MobileStartFunQR>
            <img src="/start-fun-qr.png" alt="QR Code" />
          </MobileStartFunQR>
        </StartFunContainer>
      </Container>
    </BabtMain>
  );
};

export default BabtComponent;

const BabtMain = styled.main`
  position: relative;
`;

const BabtBG1 = styled.img`
  position: absolute;
  top: calc(var(--header-h) + 40px);
  left: 0;
  z-index: 0;
  width: auto;
  height: 460px;
  pointer-events: none;
`;

const BabtBG2 = styled.img`
  position: absolute;
  top: calc(var(--header-h) + 280px);
  right: 0;
  z-index: 0;
  width: auto;
  height: 460px;
  pointer-events: none;
`;

const BabtTabsWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 60px;
  height: 100vh;
  z-index: 3;
  pointer-events: none;
`;

const BabtTabs = styled.div`
  position: sticky;
  top: calc(var(--header-h) + 68px);
  left: 0;
  z-index: 3;
  pointer-events: auto;
  @media screen and (max-width: 1024px) {
    display: none;
  }
`;

const Container = styled.div`
  position: relative;
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
  z-index: 2;
  @media screen and (max-width: 1024px) {
    padding: 0 20px;
    padding-top: var(--header-h);
    padding-bottom: 40px;
    gap: 40px;
  }
`;

const AboutContainer = styled.div`
  display: flex;
  padding: 40px 48px;
  flex-direction: column;
  align-items: center;
  align-self: stretch;

  @media screen and (max-width: 1024px) {
    padding: 20px 0;
  }
`;

const AboutImage = styled.img`
  width: 280px;
  height: 280px;
  flex-shrink: 0;
  aspect-ratio: 1/1;

  @media screen and (max-width: 1024px) {
    width: 180px;
    height: 180px;
  }
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

  @media screen and (max-width: 1024px) {
    font-size: 24px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
`;

const AboutDesc = styled.p`
  margin-top: 16px;
  color: #eaecef;
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 150%; /* 24px */
  @media screen and (max-width: 1024px) {
    color: #eaecef;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: 150%; /* 22.5px */
    text-align: left;
  }
`;

const AboutBtn = styled.button`
  margin-top: 48px;
  display: flex;
  width: 320px;
  height: 48px;
  padding: 0px 12px;
  justify-content: center;
  align-items: center;
  gap: 6px;
  border-radius: 24px;
  background: linear-gradient(274deg, #ffc720 0%, #fcd535 49.5%);

  color: #1b1f29;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%; /* 21px */

  @media screen and (max-width: 1024px) {
    margin-top: 20px;
    display: flex;
    width: 100%;
    max-width: 335px;
    height: 48px;
    padding: 0px 12px;
    justify-content: center;
    align-items: center;
    gap: 6px;
  }
`;

const FunBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
  @media screen and (max-width: 1024px) {
    gap: 8px;
  }
`;

const FunTitle = styled.h2`
  position: relative;
  color: #eaecef;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%; /* 42px */
  &::before {
    content: "";
    position: absolute;
    left: -30px;
    bottom: -8px;
    width: 72px;
    height: 72px;
    background-image: url("/babt-dot.svg");
    background-size: contain;
    background-repeat: no-repeat;
  }
  @media screen and (max-width: 1024px) {
    color: #eaecef;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 150%; /* 30px */
  }
`;

const FunDesc = styled.p`
  color: #eaecef;
  text-align: justify;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 160%; /* 20.8px */
  text-align: left;
  @media screen and (max-width: 1024px) {
    color: #eaecef;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 160%; /* 19.2px */
  }
`;

const FunSection = styled.div`
  display: flex;
  padding: 40px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  margin-top: 16px;

  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.01);

  @media screen and (max-width: 1024px) {
    margin-top: 8px;
    padding: 20px;
  }
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
  @media screen and (max-width: 1024px) {
    color: #eaecef;
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 150%; /* 27px */
  }
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

  @media screen and (max-width: 1024px) {
  }
`;

const StartFunContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StartFunTitle = styled.h2`
  position: relative;
  color: #eaecef;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%; /* 42px */
  &::before {
    content: "";
    position: absolute;
    left: -30px;
    bottom: -8px;
    width: 72px;
    height: 72px;
    background-image: url("/babt-dot.svg");
    background-size: contain;
    background-repeat: no-repeat;
  }
  @media screen and (max-width: 1024px) {
    color: #eaecef;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 150%; /* 30px */
  }
`;

const StartFunImageBox = styled.div`
  position: relative;
  width: 100%;
`;

const StartFunImage = styled.img`
  width: 100%;
  height: auto;
  @media screen and (max-width: 1024px) {
    display: none;
  }
`;

const StartFunImageMobile = styled.img`
  display: none;
  @media screen and (max-width: 1024px) {
    display: block;
    width: 100%;
    height: auto;
  }
`;

const StartFunTouchItem1 = styled.div`
  position: absolute;
  top: 41%;
  right: 10%;
  width: 26%;
  height: 8%;
  cursor: pointer;
  z-index: 2;
  @media screen and (max-width: 1024px) {
    width: 30%;
    right: 4.5%;
  }
`;

const StartFunTouchItem2 = styled.div`
  position: absolute;
  bottom: 21.5%;
  right: 10%;
  width: 26%;
  height: 6%;
  cursor: pointer;
  z-index: 2;
  @media screen and (max-width: 1024px) {
    width: 30%;
    right: 4.5%;
  }
`;

const MobileStartFunQR = styled.div`
  display: none;
  @media screen and (max-width: 1024px) {
    display: flex;
    margin-top: 16px;
    justify-content: center;
    align-items: center;
    img {
      width: 90px;
      height: auto;
    }
  }
`;
