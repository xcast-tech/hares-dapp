import { cn } from "@/lib/utils";
import { Card, Skeleton } from "@heroui/react";
import React, { FC } from "react";
import styled from "@emotion/styled";

interface TokenProps {}

function Token({}: TokenProps) {
  return (
    <StyledTokenCard>
      <StyledTokenCardPic>
        <StyledTokenCardPicInner></StyledTokenCardPicInner>
      </StyledTokenCardPic>
      <StyledTokenInfo>
        <StyledTokenName></StyledTokenName>
        <StyledTokenCA></StyledTokenCA>
        <StyledTokenDesc></StyledTokenDesc>
        {/* <StyledTokenDesc></StyledTokenDesc> */}
      </StyledTokenInfo>
      <StyledTokenPublic>
        <StyledTokenMCA></StyledTokenMCA>
        <StyledTokenSocialBox>
          {[1, 2].map((item, index) => {
            return <StyledTokenSocialBtn key={index}></StyledTokenSocialBtn>;
          })}
        </StyledTokenSocialBox>
      </StyledTokenPublic>
    </StyledTokenCard>
  );
}

interface TokenListProps {
  list: any[];
  className?: string;
}

export const SkeletonTokenList: FC<TokenListProps> = ({ list, className }) => {
  return (
    <StyledSkeleton>
      {list?.map((item, i) => {
        return <Token key={i} />;
      })}
    </StyledSkeleton>
  );
};

const StyledSkeleton = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  @media screen and (max-width: 1200px) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

const StyledTokenCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: #020202;
  padding: 12px;
  border: 1px solid rgba(234, 236, 239, 0.2);
  &::before {
    content: "";
    position: absolute;
    top: 12px;
    left: 0;
    width: 1px;
    height: calc(100% - 24px);
    background-image: linear-gradient(
      to bottom,
      rgba(234, 236, 239, 0.12) 30%,
      rgba(255, 255, 255, 0.4) 80%,
      rgba(234, 236, 239, 0.12)
    );
  }
  &::after {
    content: "";
    position: absolute;
    top: 12px;
    right: 0;
    width: 1px;
    height: calc(100% - 24px);
    background-image: linear-gradient(
      to bottom,
      rgba(234, 236, 239, 0.12) 0%,
      rgba(255, 255, 255, 0.8) 40%,
      rgba(234, 236, 239, 0.12)
    );
  }
`;

const StyledTokenCardPic = styled.div`
  position: relative;
  padding-top: 100%;
`;

const StyledTokenCardPicInner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 8px;
  background: linear-gradient(
    151deg,
    rgba(234, 236, 239, 0.1) 0%,
    rgba(234, 236, 239, 0) 50.75%
  );

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
  }
`;

const StyledTokenInfo = styled.div`
  padding-top: 12px;
  padding-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: transparent;
`;

const StyledTokenName = styled.h3`
  height: 22px;
  border-radius: 4px;
  background: transparent;
`;

const StyledTokenCA = styled.p`
  margin-top: 2px;
  height: 10px;
  border-radius: 4px;
  background: transparent;
`;

const StyledTokenDesc = styled.p`
  margin-top: 2px;
  height: 16px;
  border-radius: 4px;
  background: transparent;
`;

const StyledTokenPublic = styled.div`
  padding-top: 8px;
  display: flex;
  align-items: center;
`;

const StyledTokenMCA = styled.b`
  margin-top: 1px;
  width: 50px;
  height: 10px;
  border-radius: 4px;
  background: transparent;
`;

const StyledTokenSocialBox = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;

const StyledTokenSocialBtn = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: transparent;
`;
