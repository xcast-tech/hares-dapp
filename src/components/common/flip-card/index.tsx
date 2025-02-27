import React, { useRef, useEffect, FC } from "react";
import styled from "@emotion/styled";

// Main component
interface HoverFlipCardProps {
  children?: React.ReactNode;
}
const HoverFlipCard: FC<HoverFlipCardProps> = ({ children }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: any) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();

      // Calculate mouse position relative to card
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate relative position (0-1 range)
      const xRatio = mouseX / rect.width;
      const yRatio = mouseY / rect.height;

      // Calculate rotation angle (max 20 degrees)
      // Note: Using reverse direction for flip effect
      const rotateY = -10 * (xRatio - 0.5) * 2; // Horizontal rotation
      const rotateX = 10 * (yRatio - 0.5) * 2; // Vertical rotation

      // Set CSS variables for shine effect
      card.style.setProperty("--mouse-x", `${mouseX}px`);
      card.style.setProperty("--mouse-y", `${mouseY}px`);

      // Apply 3D transform
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`;
      // card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    };

    const handleMouseLeave = () => {
      // Set CSS variables for shine effect
      if (!card) return;

      card.style.transform =
        "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
    };

    const handleMouseEnter = () => {
      if (!card) return;
      card.style.transition = "transform 0.1s";

      // Remove transition after a short delay for smoother movement
      setTimeout(() => {
        card.style.transition = "transform 0.05s ease-out";
      }, 100);
    };

    // Add event listeners
    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);
    card.addEventListener("mouseenter", handleMouseEnter);

    // Clean up
    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      card.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);
  return (
    <CardWrapper ref={cardRef}>
      <CardContent>{children}</CardContent>
    </CardWrapper>
  );
};

export default HoverFlipCard;

// Styled components

const CardWrapper = styled.div`
  background: transparent;
  transition: transform 0.05s ease-out;
  transform-style: preserve-3d;
  position: relative;

  // &::before {
  //   content: "";
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   right: 0;
  //   bottom: 0;
  //   background: linear-gradient(
  //     135deg,
  //     rgba(255, 255, 255, 0.3) 0%,
  //     rgba(255, 255, 255, 0) 60%
  //   );
  //   z-index: 1;
  //   transition: opacity 0.3s;
  //   transform: translateZ(1px);
  // }

  // &::after {
  //   content: "";
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   right: 0;
  //   bottom: 0;
  //   background: radial-gradient(
  //     circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
  //     rgba(255, 255, 255, 0.8) 0%,
  //     rgba(255, 255, 255, 0) 50%
  //   );
  //   opacity: 0;
  //   z-index: 2;
  //   transition: opacity 0.3s;
  //   mix-blend-mode: overlay;
  // }

  // &:hover::after {
  //   opacity: 0.6;
  // }
`;

const CardContent = styled.div`
  transform: translateZ(20px);
`;
