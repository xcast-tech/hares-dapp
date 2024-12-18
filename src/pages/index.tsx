import { TokenList } from "@/components/token-list";
import { tokenListApi, TokenListApiData } from "@/lib/apis";
import { Button, Input, InputProps, Pagination } from "@nextui-org/react";
import { debounce, set } from "lodash-es";
import Link from "next/link";
import { ChangeEventHandler, useEffect, useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const pageSize = 12;

  async function fetchList(data: TokenListApiData) {
    const res = await tokenListApi(data);

    console.log("res", res);
    setList(res?.data?.list ?? []);
    setPage(res?.data?.page);

    const totalPage = Math.ceil(res?.data?.total / pageSize);
    setTotal(totalPage);
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
      name: "",
      page: 1,
      pageSize,
    });
  }, []);

  return (
    <div className="">
      <div className="w-full flex justify-center">
        <Link href="/create">
          <Button color="primary">[start a new coin]</Button>
        </Link>
      </div>

      <div className="p-4 mt-10">
        <div className="w-[300px] mx-auto mb-4 flex justify-center gap-2">
          <Input type="text" placeholder="search for token" fullWidth onChange={handleNameChangeDebounce} />
        </div>

        <TokenList list={list} />

        <div className="flex justify-center mt-4">
          <Pagination page={page} total={total} onChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
}
