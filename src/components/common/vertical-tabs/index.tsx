import React, { useState, useRef, useEffect, FC, use } from "react";
import styled from "@emotion/styled";

// Main component
interface VerticalTabsProps {
  value: string;
  onChange: (value: string) => void;
  onClick?: (value: string) => void;
}
const VerticalTabs: FC<VerticalTabsProps> = ({
  value = "about",
  onChange,
  onClick,
}) => {
  const [activeTab, setActiveTab] = useState(value);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 });
  const tabRefs: { [key: string]: React.RefObject<HTMLButtonElement | null> } =
    {
      tab1: useRef(null),
      tab2: useRef(null),
      tab3: useRef(null),
    };

  const tabsMap: Record<string, string> = {
    about: "tab1",
    fun: "tab2",
    start: "tab3",
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange(tabId);
    onClick?.(tabId);
  };

  useEffect(() => {
    // Update indicator position when active tab changes
    const key = tabsMap[activeTab];
    if (tabRefs[key] && tabRefs[key].current) {
      const tabElement = tabRefs[key].current;
      setIndicatorStyle({
        top: tabElement.offsetTop,
        height: tabElement.offsetHeight,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    // Update indicator position when value changes
    setActiveTab(value);
  }, [value]);

  return (
    <TabsContainer>
      <FlexContainer>
        <TabNavigation>
          <ActiveIndicatorWrapper>
            <ActiveIndicator
              top={indicatorStyle.top}
              height={indicatorStyle.height}
            />
          </ActiveIndicatorWrapper>

          <TabButton
            ref={tabRefs.tab1}
            active={activeTab === "about"}
            onClick={() => handleTabClick("about")}
          >
            About BAB Token
          </TabButton>

          <TabButton
            ref={tabRefs.tab2}
            active={activeTab === "fun"}
            onClick={() => handleTabClick("fun")}
          >
            BAB.FUN
          </TabButton>

          <TabButton
            ref={tabRefs.tab3}
            active={activeTab === "start"}
            onClick={() => handleTabClick("start")}
          >
            Ready to Start Using BAB.FUN?
          </TabButton>
        </TabNavigation>

        {/* <TabContent>
          {activeTab === "tab1" && (
            <TabPane>
              <TabTitle>About BAB Token</TabTitle>
              <TabText>
                BAB Token is a digital asset designed for the BAB.FUN ecosystem.
              </TabText>
              <TabText>
                Learn more about the features, benefits, and use cases of BAB
                Token.
              </TabText>
            </TabPane>
          )}

          {activeTab === "tab2" && (
            <TabPane>
              <TabTitle>BAB.FUN</TabTitle>
              <TabText>
                BAB.FUN is a platform that provides entertainment and utility
                services.
              </TabText>
              <TabText>
                Discover how BAB.FUN is revolutionizing the digital experience
                for users.
              </TabText>
            </TabPane>
          )}

          {activeTab === "tab3" && (
            <TabPane>
              <TabTitle>Ready to Start Using BAB.FUN?</TabTitle>
              <TabText>
                Getting started with BAB.FUN is easy and straightforward.
              </TabText>
              <TabText>
                Follow these simple steps to begin your journey with BAB Token:
              </TabText>
              <TabList>
                <TabListItem>Create an account</TabListItem>
                <TabListItem>Connect your wallet</TabListItem>
                <TabListItem>Start exploring the platform</TabListItem>
              </TabList>
            </TabPane>
          )}
        </TabContent> */}
      </FlexContainer>
    </TabsContainer>
  );
};

export default VerticalTabs;

// Styled components
const TabsContainer = styled.div`
  color: white;
`;

const FlexContainer = styled.div`
  display: flex;
`;

const TabNavigation = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ActiveIndicatorWrapper = styled.div`
  position: absolute;
  width: 1px;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  z-index: 0;
`;

const ActiveIndicator = styled.div<{ top: number; height: number }>`
  position: absolute;
  width: 2px;
  background-color: #f0d000;
  border-radius: 4px;
  left: 0;
  transition: all 0.3s ease-in-out;
  top: ${(props) => props.top}px;
  height: ${(props) => props.height}px;
  z-index: 1;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 0 24px;
  text-align: left;
  background: transparent;
  border: none;
  color: ${(props) => (props.active ? "#fcd535" : "#EAECEF")};
  transition: color 0.2s ease;
  font-size: 16px;
  cursor: pointer;
  width: 192px;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%; /* 21px */

  &:hover {
    color: ${(props) => (props.active ? "#fcd535" : "#EAECEF")};
  }
`;

const TabContent = styled.div`
  flex: 1;
`;

const TabPane = styled.div`
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const TabTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const TabText = styled.p`
  color: #bbb;
  margin-bottom: 12px;
  line-height: 1.5;
`;

const TabList = styled.ul`
  list-style-type: disc;
  margin-left: 24px;
  margin-top: 8px;
  color: #bbb;
`;

const TabListItem = styled.li`
  margin-bottom: 4px;
`;
