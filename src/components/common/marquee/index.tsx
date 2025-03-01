import React, { useState, useEffect, useRef, FC } from "react";
import styled from "@emotion/styled";

interface MarqueeProps {
  gap?: number;
  speed?: number;
  children: React.ReactNode;
}
const SeamlessMarquee: FC<MarqueeProps> = ({
  gap = 0,
  speed = 20,
  children,
}) => {
  return (
    <StyledMarquee>
      <StyledMarqueeTrack
        style={
          {
            "--marquee-speed": `${speed}s`,
            "--marquee-gap": `${gap}px`,
            "--marquee-direction": "forwards",
          } as React.CSSProperties
        }
      >
        {children}
      </StyledMarqueeTrack>
    </StyledMarquee>
  );
};

export default SeamlessMarquee;

const StyledMarquee = styled.div`
  :root {
    @keyframes marquee-move {
      to {
        transform: translateX(-50%);
      }
    }
  }
  width: 100%;
  height: 100%;
  overflow: clip;
  mask-image: linear-gradient(
    to right,
    transparent,
    #090a0e 5rem,
    #090a0e calc(100% - 5rem),
    transparent
  );

  @media screen and (max-width: 1024px) {
    mask-image: none;
  }
`;

const StyledMarqueeTrack = styled.div`
  display: flex;
  align-items: center;
  width: max-content;
  height: 100%;
  padding-left: var(--marquee-gap, 0);
  gap: var(--marquee-gap, 0);
  animation: marquee-move var(--marquee-speed, 20s) linear infinite
    var(--marquee-direction, forwards);
  animation-play-state: running;
  &:hover {
    animation-play-state: paused;
  }
`;
