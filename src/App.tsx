import { useState } from 'react';
import { useForm } from 'react-hook-form';
import InfiniteScroll from 'react-infinite-scroller';

const BASE_URL = 'https://tk2-110-56213.vs.sakura.ne.jp/';

async function fetchData(formData: FormData, cursor: Number) {
  const params = {
    id: formData.id,
    main_text: formData.main_text,
    cursor: cursor.toString(),
  };
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}?${queryString}`;
  const response = await fetch(url, {
    method: 'GET',
  });
  return (await response.json());
}

export default function App() {
  const [formData, setFormData] = useState<FormData>({ id: '', main_text: '' });
  const [result, setResult] = useState<Array<ResJSON>>([]);
  const [cursor, setCursor] = useState<number>(2147483647); // i32::MAX
  const [hasMore, setHasMore] = useState<boolean>(false);

  const handleFormSubmit = async (data: any) => {
    setFormData(data);
    let response = await fetchData(data, cursor);
    setResult(response);
    if (response.length === 0) {
      setHasMore(false);
      return;
    }
    setHasMore(true);
    setCursor(response[response.length - 1].no);
  };
  
  const loadMore = async () => {
    let response = await fetchData(formData, cursor);
    if (response.length === 0) {
      setHasMore(false);
      return;
    }
    setCursor(response[response.length - 1].no);
    setResult([...result, ...response]);
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          掲示板検索
        </h1>
        <Form onSubmit={handleFormSubmit}/>
        <Result result={result} hasMore={hasMore} loadMore={loadMore}/>
      </div>
    </div>
  );
}

interface FormData {
  id: string;
  main_text: string;
}

function Form({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const { register, handleSubmit } = useForm<FormData>()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-6 mb-8">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">ID:</label>
        <input 
          {...register('id')} 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">本文:</label>
        <input 
          {...register('main_text')} 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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

const loader = (
  <div key="loader" className="flex justify-center py-4 text-gray-600">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
  </div>
);

function Result({ result, loadMore, hasMore }: { result: Array<ResJSON>, loadMore: () => void, hasMore: boolean }) {
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

interface ResJSON {
  no: number;
  name_and_trip: string;
  datetime: Date;
  datetime_text: string;
  id: string;
  main_text: string;
  main_text_html: string;
  oekaki_id: number;
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
        className="text-gray-800 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: res.main_text_html }} 
      />
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
