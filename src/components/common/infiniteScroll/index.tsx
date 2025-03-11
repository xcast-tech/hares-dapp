import React, { FC, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import DotsLoadingIcon from "~@/icons/dots-loading.svg";

interface InfiniteScrollProps {
  children: React.ReactNode;
  fetchMoreData: () => Promise<unknown>;
  hasMore: boolean;
  offset?: number;
  mobileEnable?: boolean;
}

const InfiniteScroll: FC<InfiniteScrollProps> = ({
  children,
  fetchMoreData,
  hasMore,
  offset = 100,
  mobileEnable = false,
}) => {
  const observerRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setLoading(true);
          fetchMoreData().finally(() => setLoading(false));
        }
      },
      { rootMargin: `${offset}px`, threshold: 1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [fetchMoreData, hasMore, loading]);

  return (
    <StyledContainer>
      {children}
      {loading && (
        <StyledLoading>
          <DotsLoadingIcon />
        </StyledLoading>
      )}
      <StyledObserved mobileEnable={mobileEnable} ref={observerRef} />
    </StyledContainer>
  );
};

export default InfiniteScroll;

const StyledContainer = styled.div``;

const StyledLoading = styled.div`
  padding: 32px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledObserved = styled.div<{ mobileEnable: boolean }>`
  @media screen and (max-width: 1024px) {
    display: ${({ mobileEnable }) => (mobileEnable ? "block" : "none")};
  }
`;
