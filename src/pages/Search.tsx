import { useState, useRef, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import InfiniteScroll from "react-infinite-scroller";
import { useSearchParams } from "react-router-dom";

import { ResJson, CountJson } from "../types";

const BASE_URL = import.meta.env.VITE_BASE_URL;

async function fetchData(endpoint: string, formData: FormData, cursor: number) {
  const params = {
    id: formData.id,
    main_text: formData.main_text,
    name_and_trip: formData.name_and_trip,
    cursor: cursor.toString(),
    ascending: formData.ascending.toString(),
    since: formData.since,
    until: formData.until,
  };
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/api/v1/${endpoint}?${queryString}`;
  const response = await fetch(url, {
    method: "GET",
  });
  return await response.json();
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState<FormData>(() => ({
    id: searchParams.get("id") || "",
    main_text: searchParams.get("main_text") || "",
    name_and_trip: searchParams.get("name_and_trip") || "",
    ascending: searchParams.get("ascending") === "true",
    since: searchParams.get("since") || "",
    until: searchParams.get("until") || "",
  }));
  const [result, setResult] = useState<Array<ResJson>>([]);
  const [count, setCount] = useState<CountJson | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const cursor = useRef<number>(0);
  const [isSearching, setIsSearching] = useState(false);
  
  const RESULT_LIMIT = 100;

  const handleFormSubmit = async (data: FormData) => {
    setIsSearching(true);
    setCount(null);
    try {
      setFormData(data);
      setSearchParams({
        id: data.id,
        main_text: data.main_text,
        name_and_trip: data.name_and_trip,
        ascending: data.ascending.toString(),
        since: data.since,
        until: data.until,
      });

      if (data.ascending) {
        cursor.current = 0;
      } else {
        cursor.current = 2147483647;
      }
      let response = await fetchData("search", data, cursor.current);
      setResult(response);
      if (response.length < RESULT_LIMIT) {
        setHasMore(false);
        return;
      }
      setHasMore(true);
      cursor.current = response[response.length - 1].no;

    } finally {
      setIsSearching(false);
    }
    const countResponse = await fetchData("search/count", data, cursor.current);
    setCount(countResponse);
  };

  const loadMore = async () => {
    let response = await fetchData("search", formData, cursor.current);
    if (response.length < RESULT_LIMIT) {
      setHasMore(false);
      return;
    }
    cursor.current = response[response.length - 1].no;
    setResult([...result, ...response]);
  };

  useEffect(() => {
    if (searchParams.toString()) {
      handleFormSubmit(formData);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          掲示板検索
        </h1>
        <Form 
          onSubmit={handleFormSubmit}
          defaultValues={formData}
          isSearching={isSearching}
        />
        {isSearching ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          </div>
        ) : (
          result.length > 0 && <Result result={result} count={count} hasMore={hasMore} loadMore={loadMore}/>
        )}
      </div>
    </div>
  );
}

interface FormData {
  id: string;
  main_text: string;
  name_and_trip: string;
  ascending: boolean;
  since: string;
  until: string;
}

function Form({
  onSubmit,
  defaultValues,
  isSearching
}: {
  onSubmit: (data: FormData) => void;
  defaultValues: FormData;
  isSearching: boolean;
}) {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: defaultValues,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white shadow-md rounded-lg p-6 mb-8"
    >
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          ID:
        <Controller
          name="id"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          )}
        />
        </label>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          名前:
        <Controller
          name="name_and_trip"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          )}
        />
        </label>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          本文:
        <Controller
          name="main_text"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          )}
        />
        </label>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          開始:
        <Controller
          name="since"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="date"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          )}
        />
        </label>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          終了:
        <Controller
          name="until"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="date"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          )}
        />
        </label>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          順番:
        </label>
        <Controller
          name="ascending"
          control={control}
          render={({ field: { onChange, value } }) => (
            <div className="flex items-center space-x-6">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={value === true}
                  onChange={() => onChange(true)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">昇順</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={value === false}
                  onChange={() => onChange(false)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">降順</span>
              </label>
            </div>
          )}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSearching}
          className={`
            flex items-center px-4 py-2 rounded
            ${isSearching 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-700'
            }
            text-white font-bold focus:outline-none focus:shadow-outline
          `}
        >
          {isSearching ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              検索中...
            </>
          ) : (
            '検索'
          )}
        </button>
      </div>
    </form>
  );
}

function Result({
  result,
  count,
  loadMore,
  hasMore,
}: { result: Array<ResJson>; count: CountJson | null; loadMore: () => void; hasMore: boolean }) {
  const loader = (
    <div key="loader" className="flex justify-center py-4 text-gray-600">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
    </div>
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <Count count={count} />
      <InfiniteScroll
        loadMore={loadMore}
        hasMore={hasMore}
        loader={loader}
        className="space-y-4"
      >
        <ul className="divide-y divide-gray-200">
          {result.map((res: ResJson) => (
            <Res key={res.no} res={res} />
          ))}
        </ul>
      </InfiniteScroll>
    </div>
  );
}

function Count({ count }: { count: CountJson | null }) {
  if (!count) {
    return null;
  }

  return (
    <div className="text-gray-800 prose prose-sm max-w-none prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline">
      検索結果: {count.total_res_count}件 (書き込みID数: {count.unique_id_count}件)
    </div>
  );
}

function Res({ res }: { res: ResJson }) {
  return (
    <li className="py-4">
      <div className="text-sm text-gray-600 mb-2">
        <NoLink no={res.no} /> <div className="inline">{res.name_and_trip}</div>{" "}
        <div className="inline">{res.datetime_text}</div>{" "}
        <div className="inline">ID: {res.id}</div>
      </div>
      <div
        className="text-gray-800 prose prose-sm max-w-none prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: res.main_text_html }}
      />
      {res.oekaki_id && <Oekaki res={res} />}
    </li>
  );
}

function NoLink({ no }: { no: number }) {
  const pageNo = Math.floor((no - 1) / 30) * 30 + 1;
  const url = `https://dic.nicovideo.jp/b/c/ch2598430/${pageNo}-#${no}`;
  return (
    <a
      href={url}
      target="_blank"
      className="text-blue-600 hover:text-blue-800 hover:underline"
    >
      {no}
    </a>
  );
}

function Oekaki({ res }: { res: ResJson }) {
  const imageUrl = `${BASE_URL}/images/${res.oekaki_id}.png`;
  return (
    <div className="mt-2 prose prose-sm">
      <img src={imageUrl} alt={res.oekaki_title} className="max-w-full" />
      <div className="text-gray-800">タイトル: {res.oekaki_title}</div>
      {res.original_oekaki_res_no && (
        <div className="text-gray-800">
          <NoLink no={res.original_oekaki_res_no} /> この絵を基にしています！
        </div>
      )}
    </div>
  );
}
