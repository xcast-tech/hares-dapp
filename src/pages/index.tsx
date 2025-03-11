import { SkeletonTokenList } from "@/components/token/list/skeleton";
import { TokenList } from "@/components/token/list";
import { tokenListApi, TokenListApiData } from "@/lib/apis";
import Image from "next/image";
import {
  Button,
  Input,
  InputProps,
  Select,
  SelectItem,
  SelectProps,
} from "@heroui/react";
import { debounce } from "lodash-es";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IToken } from "@/lib/types";
import { cn } from "@/lib/utils";
import styled from "@emotion/styled";
import styles from "@/styles/home.module.scss";
import ArrowDownIcon from "~@/icons/arrow-down.svg";
import SearchIcon from "~@/icons/search.svg";
import { TradesMarquee } from "@/components/token/marquee";
import ReactiveCard from "@/components/common/reactive-card";
import ShinyCard from "@/components/common/shiny";
import DotsLoadingIcon from "~@/icons/dots-loading.svg";
import InfiniteScroll from "@/components/common/infiniteScroll";

export default function Home() {
  const [search, setSearch] = useState("");
  const [list, setList] = useState<IToken[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const paginationDomRef = useRef<HTMLDivElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const [end, setEnd] = useState(false);
  const [sort, setSort] = useState("created_timestamp");

  const pageSize = 12;

  const sortOptions = [
    {
      label: "Latest Trade",
      value: "updated_timestamp",
    },
    {
      label: "Latest Creation",
      value: "created_timestamp",
    },
    {
      label: "Highest Marketcap",
      value: "totalSupply",
    },
  ];

  async function fetchList(data: TokenListApiData) {
    setLoading(true);

    try {
      const res = await tokenListApi(data);

      const currentPageList = res?.data?.list ?? [];

      const newList = [...list, ...currentPageList];
      setList(newList);
      setPage(res?.data?.page);

      const end = currentPageList.length < pageSize;
      setEnd(end);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  const handleNameChange: InputProps["onChange"] = (e) => {
    const search = e.target.value;
    setSearch(search);

    setList([]);
  };

  const handleNameChangeDebounce = debounce(handleNameChange, 500);

  const handleSortChange: SelectProps["onSelectionChange"] = async (ev) => {
    const newSort = ev?.currentKey as string;

    if (!newSort) {
      return;
    }

    window.scrollTo({ top: 0 });

    setSort(newSort);

    setList([]);
  };

  // useEffect(() => {
  //   if (!paginationDomRef.current) return;
  //   const callback = (entries: IntersectionObserverEntry[]) => {
  //     if (!end && !loading && entries[0].isIntersecting) {
  //       fetchList({
  //         sort,
  //         search,
  //         page: page + 1,
  //         pageSize,
  //       });
  //     }
  //   };

  //   intersectionObserverRef.current = new IntersectionObserver(callback);
  //   intersectionObserverRef.current.observe(paginationDomRef.current!);

  //   return () => {
  //     intersectionObserverRef.current?.disconnect();
  //   };
  // }, [
  //   loading,
  //   end,
  //   list,
  //   page,
  //   pageSize,
  //   sort,
  //   search,
  //   paginationDomRef.current,
  // ]);

  useEffect(() => {
    setEnd(false);
    fetchList({
      sort,
      search,
      page: 1,
      pageSize,
    });
  }, [sort, search]);

  return (
    <>
      <Head>
        <title>BAB.Fun</title>
      </Head>
      <StyledHome>
        <StyledHomeBanner>
          <ReactiveCard></ReactiveCard>
          <StyledHomeBannerTitle>Build And Build For Fun</StyledHomeBannerTitle>
          <StyledHomeCreateCoin>
            <Link href="/create">
              <ShinyCard color="#fcd535" radius={100} duration={3}>
                <StyledHomeCreateCoinBtn>
                  <StyledHomeCreateCoinBtnInner>
                    Start A New Coin
                  </StyledHomeCreateCoinBtnInner>
                </StyledHomeCreateCoinBtn>
              </ShinyCard>
            </Link>
          </StyledHomeCreateCoin>
        </StyledHomeBanner>
        <StyledHomeTool>
          <StyledHomeSearch>
            <StyledHomeSearchContainer>
              <StyledHomeSearchLeft>
                <SearchIcon />
                <StyledHomeSearchInputBox>
                  <StyledHomeSearchInput
                    type="text"
                    onChange={handleNameChangeDebounce}
                    placeholder="Search For Token"
                  />
                </StyledHomeSearchInputBox>
              </StyledHomeSearchLeft>
              <StyledHomeSearchRight>
                <Select
                  // classNames={{
                  //   trigger:
                  //     "!bg-[#1A1A1A] border border-solid border-[#262626]",
                  // }}
                  classNames={{
                    base: styles["select-base"],
                    popoverContent: styles["select-popover-content"],
                    listboxWrapper: styles["select-listbox-wrapper"],
                    trigger: styles["select-trigger"],
                    mainWrapper: styles["select-main-wrapper"],
                    innerWrapper: styles["select-inner-wrapper"],
                    value: styles["select-value"],
                    label: styles["select-label"],
                    selectorIcon: styles["select-selector-icon"],
                    listbox: styles["select-listbox"],
                  }}
                  selectedKeys={[sort]}
                  selectorIcon={<ArrowDownIcon />}
                  onSelectionChange={handleSortChange}
                >
                  {sortOptions.map((opt) => (
                    <SelectItem
                      classNames={{
                        base: styles["select-item-base"],
                        title: styles["select-item-title"],
                        wrapper: styles["select-item-wrapper"],
                      }}
                      key={opt.value}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>
              </StyledHomeSearchRight>
            </StyledHomeSearchContainer>
          </StyledHomeSearch>
          <StyledHomeSwiper>
            <TradesMarquee />
          </StyledHomeSwiper>
        </StyledHomeTool>

        <StyledHomeContent>
          <InfiniteScroll
            fetchMoreData={async () => {
              if (loading || end) return;
              return fetchList({
                sort,
                search,
                page: page + 1,
                pageSize,
              });
            }}
            hasMore={!end}
          >
            <>
              {list?.length ? (
                <TokenList list={list} />
              ) : (
                end &&
                !list?.length && (
                  <StyledNoData>
                    <Image width={120} height={120} src="search.svg" alt="" />
                  </StyledNoData>
                )
              )}
              {loading && !list.length && (
                <SkeletonTokenList list={Array(pageSize).fill({})} />
              )}
            </>
          </InfiniteScroll>

          {/* {!end && !loading && (
            <StyledPaginationBox ref={paginationDomRef}>
              <DotsLoadingIcon />
            </StyledPaginationBox>
          )} */}
        </StyledHomeContent>
      </StyledHome>
      {/* <div
        style={{
          width: "100%",
          height: "500px",
          background: "#000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button className="shiny-cta">
          <span>Get unlimited access</span>
        </button>
      </div> */}
    </>
  );
}

const StyledHome = styled.div`
  display: flex;
  flex-direction: column;
  background-image: url("/home-bg.png");
  background-size: 100% auto;
  background-repeat: no-repeat;
  @media screen and (max-width: 1024px) {
    padding-top: calc(var(--header-h));
  }
`;

const StyledHomeBanner = styled.div`
  position: relative;
  padding: 50px 0;
  padding-top: calc(var(--header-h) + 50px);
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.01);
  @media screen and (max-width: 1024px) {
    display: none;
  }
`;

const StyledHomeBannerTitle = styled.h1`
  text-align: center;
  font-family: var(--font-climate-crisis);
  font-size: 48px;
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
`;

const StyledHomeCreateCoin = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 1;
`;

const StyledHomeCreateCoinBtn = styled.button`
  width: 240px;
  height: 50px;
  padding: 3px;

  border-radius: 100px;
  border: 1.5px solid rgba(252, 213, 53, 0.4);
  background: #18191e;
`;

const StyledHomeCreateCoinBtnInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  color: #18191e;
  font-size: 15px;
  font-style: normal;
  font-weight: 700;
  line-height: 150%; /* 22.5px */
  text-transform: capitalize;

  border-radius: 100px;
  border: 1.5px solid rgba(252, 213, 53, 0.4);
  background: #18191e;

  border-radius: 100px;
  background: linear-gradient(274deg, #ffc720 9.5%, #fcd535 53.5%);
`;

const StyledHomeTool = styled.div`
  display: flex;
  flex-direction: column;
  position: sticky;
  top: var(--header-h);
  z-index: 39;
  background: #020308;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
`;

const StyledHomeSearch = styled.div`
  width: 100%;
  height: 54px;
  display: flex;
  padding: 0 32px;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  @media screen and (max-width: 1024px) {
    border-top: 0.5px solid rgba(255, 255, 255, 0.12);
    border-bottom: 0.5px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.01);
    padding: 0 12px;
  }
`;

const StyledHomeSearchContainer = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  height: 100%;
  background: rgba(255, 255, 255, 0.01);
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  border-right: 1px solid rgba(255, 255, 255, 0.12);
  @media screen and (max-width: 1024px) {
    margin: 0;
    border: none;
  }
`;

const StyledHomeSearchLeft = styled.div`
  flex: 1;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    width: 14px;
    height: 14px;
    color: #eaecef;
    opacity: 0.4;
  }

  @media screen and (max-width: 1024px) {
    padding: 0 10px;
    gap: 10px;
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const StyledHomeSearchInputBox = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
`;

const StyledHomeSearchInput = styled.input`
  flex: 1;
  width: 100%;
  color: #eaecef;

  font-size: 13px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  outline: none;
  border: none;
  background: transparent;
  &::placeholder {
    color: rgba(234, 236, 239, 0.4);
  }

  @media screen and (max-width: 1024px) {
    font-size: 12px;
    line-height: 150%; /* 18px */
  }
`;

const StyledHomeSearchRight = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  @media screen and (max-width: 1024px) {
    border-left: 0.5px solid rgba(255, 255, 255, 0.12);
  }
`;

const StyledHomeSwiper = styled.div``;

const StyledHomeContent = styled.div`
  padding: 32px;
  margin: 0 auto;
  width: 100%;
  max-width: 1264px;
  min-height: calc(100vh - 302px - 100px);
  // box-sizing: content-box;
  @media screen and (max-width: 1024px) {
    padding: 10px;
    min-height: calc(100vh - var(--header-h) - 100px);
  }
`;

const StyledNoData = styled.div`
  padding: 100px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledPaginationBox = styled.div`
  padding: 32px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
