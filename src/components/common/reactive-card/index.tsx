import { FC, useEffect, useRef } from "react";
import styled from "@emotion/styled";

interface ReactiveCardProps {
  children?: React.ReactNode;
}

const ReactiveCard: FC<ReactiveCardProps> = ({ children }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    /**
     * return a value that has been rounded to a set precision
     * @param {Number} value the value to round
     * @param {Number} precision the precision (decimal places), default: 3
     * @returns {Number}
     */
    const round = (value: number, precision = 3) =>
      parseFloat(value.toFixed(precision));

    /**
     * return a value that has been limited between min & max
     * @param {Number} value the value to clamp
     * @param {Number} min minimum value to allow, default: 0
     * @param {Number} max maximum value to allow, default: 100
     * @returns {Number}
     */
    const clamp = (value: number, min = 0, max = 100) => {
      return Math.min(Math.max(value, min), max);
    };

    /**
     * return a value that has been re-mapped according to the from/to
     * - for example, adjust(10, 0, 100, 100, 0) = 90
     * @param {Number} value the value to re-map (or adjust)
     * @param {Number} fromMin min value to re-map from
     * @param {Number} fromMax max value to re-map from
     * @param {Number} toMin min value to re-map to
     * @param {Number} toMax max value to re-map to
     * @returns {Number}
     */
    // const adjust = (value, fromMin, fromMax, toMin, toMax) => {
    //   return round(
    //     toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin)
    //   );
    // };

    const cardUpdate = (e: any) => {
      // normalise touch/mouse
      var pos = [e.clientX, e.clientY];
      e.preventDefault();
      if (e.type === "touchmove") {
        pos = [e.touches[0].clientX, e.touches[0].clientY];
      }
      var dimensions = card.getBoundingClientRect();
      var l = pos[0] - dimensions.left;
      var t = pos[1] - dimensions.top;
      var h = dimensions.height;
      var w = dimensions.width;
      var px = clamp(Math.abs((100 / w) * l), 0, 100);
      var py = clamp(Math.abs((100 / h) * t), 0, 100);

      card.setAttribute(
        "style",
        `
      --pointer-x: ${px}%;
      --pointer-y: ${py}%;
    `
      );
    };

    card.addEventListener("mousemove", cardUpdate);
    card.addEventListener("touchmove", cardUpdate);

    return () => {
      card.removeEventListener("mousemove", cardUpdate);
      card.removeEventListener("touchmove", cardUpdate);
    };
  }, []);
  return (
    <StyledReactiveCard ref={cardRef}>
      <div className="rac-inside">{children}</div>
    </StyledReactiveCard>
  );
};

export default ReactiveCard;

const StyledReactiveCard = styled.div`
  :root {
    @property --bgrotate {
      initial-value: 120deg;
      inherits: false;
      syntax: "<angle>";
    }
    @property --bgrotate2 {
      initial-value: 255deg;
      inherits: false;
      syntax: "<angle>";
    }
    @property --text {
      initial-value: 220deg;
      inherits: false;
      syntax: "<angle>";
    }
  }

  --canvas: 220;
  --fg: hsl(var(--canvas), 39%, 95%);
  --link: hsl(var(--canvas), 90%, 80%);
  --linkh: hsl(150, 95%, 70%);
  --wgt: 200;
  --ar: 0.718;
  --br: 0;
  --hl: 0;
  --bg: hsl(var(--canvas), 15%, 12%);
  --t: all 0.66s
    linear(
      0,
      0.007,
      0.028 2.1%,
      0.112 4.6%,
      0.224 6.9%,
      0.604 14.2%,
      0.713,
      0.803,
      0.879,
      0.939,
      0.985 26.2%,
      1.019 28.9%,
      1.034 30.7%,
      1.045,
      1.051 34.8%,
      1.053 37.2%,
      1.046 41.6%,
      1.012 54.7%,
      1.001 62.8%,
      0.997 73%,
      1
    );

  aspect-ratio: var(--ar);
  border-radius: var(--br);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translate3d(0, 0, 0.1px);
  z-index: 0;
  &:hover {
    --hl: 1;
  }

  .rac-inside {
    display: flex;
    align-items: center;
    border-radius: inherit;
    overflow: hidden;
    justify-content: center;
    // background: hsl(var(--canvas), 15%, 16%);
    border-radius: inherit;
    content: "";
    grid-column: 1/-1;
    grid-row: 1/-1;
    inset: 1px;
    position: absolute;
    z-index: 1;

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      background-image: radial-gradient(
        farthest-corner circle at var(--pointer-x) var(--pointer-y),
        hsl(248deg 25% 80% / 10%) 12%,
        hsl(207deg 40% 30% / 1%) 90%
      );
      mix-blend-mode: overlay;
      filter: brightness(1) contrast(1.2);
      opacity: var(--hl);
      transition: var(--t);
    }
  }
`;

const StyledReactiveCardInside = styled.div`
  display: flex;
  align-items: center;
  border-radius: inherit;
  overflow: hidden;
  justify-content: center;
  background: hsl(var(--canvas), 15%, 16%);
  border-radius: inherit;
  content: "";
  grid-column: 1/-1;
  grid-row: 1/-1;
  inset: 1px;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: radial-gradient(
      farthest-corner circle at var(--pointer-x) var(--pointer-y),
      hsl(248, 25%, 80%) 12%,
      hsla(207, 40%, 30%, 0.2) 90%
    );
    mix-blend-mode: overlay;
    filter: brightness(1) contrast(1.2);
    opacity: var(--hl);
    transition: var(--t);
  }
`;
