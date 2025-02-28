import { FC } from "react";
import styled from "@emotion/styled";

interface ShinyCardProps {
  radius?: number;
  duration?: number;
  disabled?: boolean;
  children: React.ReactNode;
}
const ShinyCard: FC<ShinyCardProps> = ({
  radius = 16,
  duration = 3,
  disabled,
  children,
}) => {
  return disabled ? (
    children
  ) : (
    <StyledShinyCard radius={radius} duration={duration}>
      {children}
    </StyledShinyCard>
  );
};

export default ShinyCard;

const StyledShinyCard = styled.div<{ radius?: number; duration?: number }>`
  :root {
    @keyframes gradient-angle {
      to {
        --gradient-angle: 360deg;
      }
    }

    @keyframes shimmer {
      to {
        rotate: 360deg;
      }
    }

    @keyframes breathe {
      from,
      to {
        scale: 1;
      }
      50% {
        scale: 1.2;
      }
    }
    @property --gradient-angle {
      syntax: "<angle>";
      initial-value: 0deg;
      inherits: false;
    }

    @property --gradient-angle-offset {
      syntax: "<angle>";
      initial-value: 0deg;
      inherits: false;
    }

    @property --gradient-percent {
      syntax: "<percentage>";
      initial-value: 5%;
      inherits: false;
    }

    @property --gradient-shine {
      syntax: "<color>";
      initial-value: white;
      inherits: false;
    }
  }

  --shiny-cta-bg: #000000;
  --shiny-cta-bg-subtle: #1a1818;
  --shiny-cta-fg: #ffffff;
  --shiny-cta-highlight: #fcd535;
  --shiny-cta-highlight-subtle: #8484ff;
  --transition: 800ms cubic-bezier(0.25, 1, 0.5, 1);
  --animation: gradient-angle linear infinite;
  --duration: ${(props) => props.duration}s;
  --shadow-size: 2px;

  transition: var(--transition);
  transition-property: --gradient-angle-offset, --gradient-percent,
    --gradient-shine;
  animation: var(--animation) var(--duration),
    var(--animation) calc(var(--duration) / 0.4) reverse paused;
  animation-composition: add;
  isolation: isolate;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  outline-offset: 4px;
  font-family: inherit;
  border: 1px solid transparent;
  border-radius: ${(props) => props.radius}px;
  color: var(--shiny-cta-fg);
  background: linear-gradient(var(--shiny-cta-bg), var(--shiny-cta-bg))
      padding-box,
    conic-gradient(
        from calc(var(--gradient-angle) - var(--gradient-angle-offset)),
        transparent,
        var(--shiny-cta-highlight) var(--gradient-percent),
        var(--gradient-shine) calc(var(--gradient-percent) * 2),
        var(--shiny-cta-highlight) calc(var(--gradient-percent) * 3),
        transparent calc(var(--gradient-percent) * 4)
      )
      border-box;
  box-shadow: inset 0 0 0 1px var(--shiny-cta-bg-subtle);
`;
