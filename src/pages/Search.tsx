import { useState, useRef, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import InfiniteScroll from 'react-infinite-scroller';
import { ResJSON } from '../types/ResJSON';
import { useSearchParams } from 'react-router-dom';

const BASE_URL = 'https://tk2-110-56213.vs.sakura.ne.jp';

async function fetchData(formData: FormData, cursor: number) {
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
  const url = `${BASE_URL}/api/v1/search?${queryString}`;
  const response = await fetch(url, {
    method: 'GET',
  });
  return (await response.json());
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formData, setFormData] = useState<FormData>(() => ({
    id: searchParams.get('id') || '',
    main_text: searchParams.get('main_text') || '',
    name_and_trip: searchParams.get('name_and_trip') || '',
    ascending: searchParams.get('ascending') === 'true',
    since: searchParams.get('since') || '',
    until: searchParams.get('until') || '',
  }));
  const [result, setResult] = useState<Array<ResJSON>>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const cursor = useRef<number>(0);

  const handleFormSubmit = async (data: FormData) => {
    setFormData(data);
    // Update URL parameters
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
      cursor.current = 2147483647; // i32::MAX
    }
    let response = await fetchData(data, cursor.current);
    setResult(response);
    if (response.length === 0) {
      setHasMore(false);
      return;
    }
    setHasMore(true);
    cursor.current = response[response.length - 1].no;
  };
  
  const loadMore = async () => {
    let response = await fetchData(formData, cursor.current);
    if (response.length === 0) {
      setHasMore(false);
      return;
    }
    cursor.current = response[response.length - 1].no;
    setResult([...result, ...response]);
  }

  useEffect(() => {
    if (searchParams.toString()) {
      handleFormSubmit(formData);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          掲示板検索
        </h1>
        <Form 
          onSubmit={handleFormSubmit}
          defaultValues={formData}
        />
        {result.length > 0 && <Result result={result} hasMore={hasMore} loadMore={loadMore}/>}
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

function Form({ onSubmit, defaultValues }: { 
    onSubmit: (data: FormData) => void,
    defaultValues: FormData 
}) {
    const { control, handleSubmit } = useForm<FormData>({
        defaultValues: defaultValues
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-6 mb-8">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">ID:</label>
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
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">名前:</label>
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
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">本文:</label>
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
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">開始:</label>
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
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">終了:</label>
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
      </div>
      <div className="mb-6">
       <label className="block text-gray-700 text-sm font-bold mb-2">
         順番:
       </label>
       <Controller 
         name="ascending"
         control={control}
         render={({ field: {onChange, value} }) => (
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
        <input 
          type='submit' 
          value="検索"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer"
        />
      </div>
    </form>
  )
}

function Result({ result, loadMore, hasMore }: { result: Array<ResJSON>, loadMore: () => void, hasMore: boolean }) {
  const loader = (
    <div key="loader" className="flex justify-center py-4 text-gray-600">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
    </div>
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <InfiniteScroll
        loadMore={loadMore}
        hasMore={hasMore}
        loader={loader}
        className="space-y-4"
      >
        <ul className="divide-y divide-gray-200">
          {result.map((res: ResJSON) => <Res key={res.no} res={res} />)}
        </ul>
      </InfiniteScroll>
    </div>
  );
}

function Res({ res }: { res: ResJSON }) {
  return (
    <li className="py-4">
      <div className="text-sm text-gray-600 mb-2">
        <NoLink no={res.no} />
        {" "}
        <div className="inline">{res.name_and_trip}</div>
        {" "}
        <div className="inline">{res.datetime_text}</div>
        {" "}
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

function Oekaki({ res }: { res: ResJSON }) {
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
  )
}
