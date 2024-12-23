import { SkeletonTokenList } from "@/components/skeleton-token-list";
import { TokenList } from "@/components/token-list";
import { tokenListApi, TokenListApiData } from "@/lib/apis";
import Image from "next/image";
import { Button, Input, InputProps, Pagination } from "@nextui-org/react";
import { debounce, set } from "lodash-es";
import Head from "next/head";
import Link from "next/link";
import { ChangeEventHandler, useEffect, useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const pageSize = 12;

  async function fetchList(data: TokenListApiData) {
    setLoading(true);

    try {
      const res = await tokenListApi(data);

      console.log("res", res);
      setList(res?.data?.list ?? []);
      setPage(res?.data?.page);

      const totalPage = Math.ceil(res?.data?.total / pageSize);
      setTotal(totalPage);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  const handleNameChange: InputProps["onChange"] = (e) => {
    const search = e.target.value;
    setSearch(search);

    fetchList({
      search,
      page: 1,
      pageSize,
    });
  };

  const handleNameChangeDebounce = debounce(handleNameChange, 500);

  const handlePageChange = (page: number) => {
    fetchList({
      search,
      page,
      pageSize,
    });
  };

  useEffect(() => {
    fetchList({
      search: "",
      page: 1,
      pageSize,
    });
  }, []);

  return (
    <>
      <Head>
        <title>hares.ai</title>
      </Head>
      <div className="">
        <div className="w-full flex justify-center mt-5 h-[210px] relative">
          <Image src="/left.png" fill className="object-left object-contain" alt={""} />
          <Image src="/right.png" fill className="object-right object-contain" alt={""} />

          <div className="h-full flex justify-center items-center">
            <Link href="/create">
              <Button className="bg-transparent h-[52px] rounded-[52px] w-[320px] border border-solid border-[#262626]">
                <div className="flex items-center justify-center gap-2">
                  <Image src="/btn-star.svg" height={16} width={32} alt={""} />
                  <div className="text-[20px] font-bold">[start a new coin]</div>
                  <Image src="/btn-star.svg" height={16} width={32} className="rotate-180" alt={""} />
                </div>
              </Button>
            </Link>
          </div>
        </div>

        <div className="-translate-y-1/2 w-[600px] mx-auto mb-4 flex justify-center gap-2 shadow-[0px_0px_0px_10px_#191919] rounded-[16px]">
          <Input type="text" placeholder="Search For Token" fullWidth onChange={handleNameChangeDebounce} classNames={{ inputWrapper: "h-[60px] text-[#666] text-[16px] !bg-[#141414]" }} />
        </div>

        <div className="p-4 mt-10">
          {loading ? (
            <SkeletonTokenList list={Array(pageSize).fill({})} />
          ) : list?.length ? (
            <TokenList list={list} />
          ) : (
            <div className="pt-[160px] flex justify-center">
              <Image width={120} height={120} src="search.svg" alt="" />
            </div>
          )}

          {total > 0 && (
            <div className="flex justify-center mt-4">
              <Pagination page={page} total={total} onChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
