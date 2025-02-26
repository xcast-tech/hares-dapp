import { cn } from "@/lib/utils";
import { Card, Skeleton } from "@heroui/react";
import React, { FC } from "react";
import styled from "@emotion/styled";

interface TokenProps {}

function Token({}: TokenProps) {
  return (
    <StyledTokenCard>
      <StyledTokenCardPic></StyledTokenCardPic>
      <StyledTokenInfo>
        <StyledTokenName></StyledTokenName>
        <StyledTokenCA></StyledTokenCA>
        <StyledTokenDesc></StyledTokenDesc>
        <StyledTokenDesc></StyledTokenDesc>
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
  grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
  gap: 16px;
`;

const StyledTokenCard = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid #eaecef;
  background: #020202;
  padding: 12px;
`;

const StyledTokenCardPic = styled.div`
  position: relative;
  padding-top: 100%;
  border-radius: 8px;
  background: #1e1e1e;
`;

const StyledTokenInfo = styled.div`
  padding-top: 12px;
  padding-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid #1e1e1e;
`;

const StyledTokenName = styled.h3`
  height: 22px;
  border-radius: 4px;
  background: #1e1e1e;
`;

const StyledTokenCA = styled.p`
  margin: 2px 0;
  height: 12px;
  border-radius: 4px;
  background: #1e1e1e;
`;

const StyledTokenDesc = styled.p`
  margin-top: 2px;
  height: 12px;
  border-radius: 4px;
  background: #1e1e1e;
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
  background: #1e1e1e;
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
  background: #1e1e1e;
`;
