import { SkeletonTokenList } from "@/components/skeleton-token-list";
import { TokenList } from "@/components/token-list";
import { tokenListApi, TokenListApiData } from "@/lib/apis";
import Image from "next/image";
import { Button, Input, InputProps, Select, SelectItem, SelectProps } from "@nextui-org/react";
import { debounce } from "lodash-es";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IToken } from "@/lib/types";
import { cn } from "@/lib/utils";

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

    setSort(newSort);

    setList([]);
  };

  useEffect(() => {
    const callback = (entries: IntersectionObserverEntry[]) => {
      if (!end && !loading && entries[0].isIntersecting) {
        fetchList({
          sort,
          search,
          page: page + 1,
          pageSize,
        });
      }
    };

    intersectionObserverRef.current = new IntersectionObserver(callback);
    intersectionObserverRef.current.observe(paginationDomRef.current!);

    return () => {
      intersectionObserverRef.current?.disconnect();
    };
  }, [loading, end, list, page, pageSize, sort, search]);

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
        <title>hares.ai</title>
      </Head>
      <div className="pb-[80px]">
        <div className={cn("w-full flex justify-center h-[120px] relative", "xl:h-[210px]")}>
          <Image src="/left.png" fill className="object-left object-contain" alt={""} />
          <Image src="/right.png" fill className="object-right object-contain" alt={""} />

          <div className="h-full flex items-center relative">
            <Link href="/create">
              <Button
                className={cn(
                  "absolute top-[30px] left-0 -translate-x-1/2 bg-transparent w-[310px] h-[30px] rounded-[30px]",
                  "xl:top-[64px] xl:w-[320px] xl:h-[52px] xl:rounded-[52px] xl:border xl:border-solid xl:border-[#262626]"
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <Image src="/btn-star.svg" height={16} width={32} alt={""} />
                  <div className="text-[20px] font-bold">[start a new coin]</div>
                  <Image src="/btn-star.svg" height={16} width={32} className="rotate-180" alt={""} />
                </div>
              </Button>
            </Link>
          </div>
        </div>

        <div className={cn("-translate-y-1/2 mx-6 mb-4 flex justify-center gap-2 shadow-[0px_0px_0px_10px_#191919] rounded-[16px]", "xl:w-[600px] xl:mx-auto")}>
          <Input
            type="text"
            placeholder="Search For Token"
            fullWidth
            onChange={handleNameChangeDebounce}
            classNames={{ inputWrapper: cn("h-[40px] text-[#666] text-[16px] !bg-[#141414]", "xl:h-[60px]") }}
          />
        </div>

        <div className="p-4 mt-5 xl:mt-10">
          <div className="mb-4">
            <Select className="w-[180px]" classNames={{ trigger: "!bg-[#1A1A1A] border border-solid border-[#262626]" }} label="Sort" selectedKeys={[sort]} onSelectionChange={handleSortChange}>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value}>{opt.label}</SelectItem>
              ))}
            </Select>
          </div>

          {list?.length ? (
            <TokenList list={list} />
          ) : (
            end && (
              <div className="pt-[160px] flex justify-center">
                <Image width={120} height={120} src="search.svg" alt="" />
              </div>
            )
          )}

          {loading && <SkeletonTokenList list={Array(pageSize).fill({})} className="mt-4" />}

          <div ref={paginationDomRef}></div>
        </div>
      </div>
    </>
  );
}
