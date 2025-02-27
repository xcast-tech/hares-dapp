import React, { FC, useEffect, useRef, useState, useCallback } from "react";
import { LatelyTrade } from "@/lib/types";
import { SwiperCard } from "./card";

interface SwiperContainerProps {
  slides: LatelyTrade[];
}

export const SwiperContainer: FC<SwiperContainerProps> = ({ slides }) => {
  // Constants
  const slideWidth = 400; // Fixed width for each slide
  const slidesGap = 20; // Gap between slides

  // State
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);

  // Memoize extended slides to prevent unnecessary re-renders
  const extendedSlides = React.useMemo(
    () => [...slides, ...slides, ...slides],
    [slides]
  );

  const totalWidth = slides.length * slideWidth;

  // Handle automatic scrolling
  useEffect(() => {
    if (isDragging) return;

    const scroll = (timestamp: number) => {
      // Only update position every 30ms for smoother animation
      if (
        !lastTimestampRef.current ||
        timestamp - lastTimestampRef.current > 30
      ) {
        lastTimestampRef.current = timestamp;

        setPosition((prev) => {
          const newPosition = prev - 1;
          // Reset to first group end position when reaching second group end
          if (newPosition <= -(totalWidth * 2)) {
            return -totalWidth;
          }
          return newPosition;
        });
      }

      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);

    // Cleanup animation frame on unmount or when dependencies change
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDragging, totalWidth]);

  // Event handlers with useCallback to prevent unnecessary recreations
  // const handleTouchStart = useCallback(
  //   (e: React.TouchEvent | React.MouseEvent) => {
  //     setIsDragging(true);
  //     const clientX =
  //       "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
  //     setStartX(clientX);
  //     setCurrentTranslate(position);

  //     // Cancel any ongoing animation
  //     if (animationRef.current) {
  //       cancelAnimationFrame(animationRef.current);
  //       animationRef.current = null;
  //     }
  //   },
  //   [position]
  // );

  // const handleTouchMove = useCallback(
  //   (e: React.TouchEvent | React.MouseEvent) => {
  //     if (!isDragging) return;

  //     const clientX =
  //       "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
  //     const diff = clientX - startX;
  //     setPosition(currentTranslate + diff);
  //   },
  //   [isDragging, startX, currentTranslate]
  // );

  // const handleTouchEnd = useCallback(() => {
  //   setIsDragging(false);

  //   // Optional: Snap to closest slide position
  //   const slidePosition =
  //     Math.round(position / (slideWidth + slidesGap)) *
  //     (slideWidth + slidesGap);
  //   setPosition(slidePosition);
  // }, [position, slideWidth, slidesGap]);

  // CSS styles
  const slideStyles = {
    transform: `translateX(${position}px)`,
    transition: isDragging ? "none" : "transform 0.3s ease",
    display: "flex",
  };

  return (
    <div ref={containerRef} className="h-full overflow-hidden">
      <div style={slideStyles} className="h-full">
        {extendedSlides.map((slide, index) => (
          <div
            key={`${slide.id}-${index}`}
            className="flex-shrink-0"
            style={{
              width: `${slideWidth}px`,
              marginRight: `${slidesGap}px`,
            }}
          >
            <SwiperCard trade={slide} />
          </div>
        ))}
      </div>
    </div>
  );
};
