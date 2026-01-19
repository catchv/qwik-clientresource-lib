# Qwik ClientResource Library ⚡️

## 내용
Qwik의 routeLoader$, useResource$ + <Resource> 사용은 HTML 렌더링을 블럭킹해서 화면의 초기 로딩시간을 증가시킨다.
이 라이브러리는 HTML의 처음 로딩 후 화면에 component가 보여질때 서버에 호출되어서 데이터를 받게 된다.
그리고 Qwik의 페이지 refresh시에 useResource$ 호출이 되지 않는데 해당 컴포넌트는 옵션을 통해서
refresh을 허용한다.

```
import { $, component$ } from "@builder.io/qwik";
import { server$, useNavigate, useLocation } from "@builder.io/qwik-city";
import { ClientResource } from "qwik-clientresource-library";

interface RevenueResponse {
  error?: string;
  code?: string;
  data?: Array<{ id: number; num: number }>;
}

export const fetchServerCallData = server$(async (): Promise<RevenueResponse> => {

  try{
    console.log("Fetching revenue data...");
    await new Promise((resolve) => setTimeout(resolve, 3 * 1000));
    console.log("Data fetch completed after 3 seconds.");

    return {
      data: [
        { id: 1, num: 10 },
        { id: 1, num: 10 },
        { id: 1, num: 10 },
        { id: 1, num: 10 },
      ],
    };
  } catch {
    throw new Error("Failed to fetch Test.");
  }
});

export const fetchClientCallData = $(async () => {
  try {
    // DB/API 호출
    const res = await fetch("http://localhost:5173/api/data");
    return await res.json();
  } catch (error) {
    return { error: "Failed to fetch revenue" + error };
  }
});

export const Index4 = component$(() => {
  // 상단에 QRL 함수들 정의
  const serverDataQrl = $(async () => {
    const result= await fetchServerCallData(); // 직접 await (catch는 useResource$에서)
    return result;
  });

  const clientDataQrl = $(async () => {
    const result= await fetchClientCallData(); // 직접 await (catch는 useResource$에서)
    return result;
  });  

  const onResolvedServerData = $((value: any) => (
    <div>onResolved: {JSON.stringify(value)}</div>
  ));

  const onResolvedClientData = $((value: {message: string}) => (
    <div>onResolved: 
      <span>{value.message}</span>
    </div>
  ));  

  const onRejectedData = $((error: Error) => (
    <div>Error: {error.message}</div>
  ));

  const onPendingData = $(() => <div>Loading...</div>);

  const nav = useNavigate();
  const loc = useLocation();

  return (
    <main>
      <h1 class="lusitana mb-4 text-xl md:text-2xl">Qwik routeLoader, useResource Stop!!!</h1>

      {loc.isNavigating && (
        <div class="loading-spinner">
          Loading... (navigating: {String(loc.isNavigating)})
        </div>
      )}      

      <button class="bg-yellow-300" onClick$={()=>{
        nav("", { forceReload: true });
      }} >HAHAHAHA</button>

      <div class="flex flex-col">
        <ClientResource
          refresh={true}
          fetchData={serverDataQrl}
          onResolved={onResolvedServerData}
          onRejected={onRejectedData}
          onPending={onPendingData}
        />
      </div>

      <div class="flex flex-col">
        <span>Client call</span>
        <ClientResource
          refresh={true}
          fetchData={clientDataQrl}
          onResolved={onResolvedClientData}
          onRejected={onRejectedData}
          onPending={onPendingData}
        />
      </div>


      <h1 class="lusitana mb-4 text-xl md:text-2xl">Qwik ClientResource Go!!!</h1>
    </main>
  );
});

export default Index4;
```