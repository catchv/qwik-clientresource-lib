import { $, component$ } from "@builder.io/qwik";
import { server$, useNavigate, useLocation } from "@builder.io/qwik-city";
import { ClientResource } from "./components/clientresource/clientresource"

interface RevenueResponse {
  error?: string;
  code?: string;
  data?: Array<{ id: number; num: number }>;
}

export const fetchServerCallData = server$(async (): Promise<RevenueResponse> => {

  try{
    console.log("Fetching data...");
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
    const result= await fetchServerCallData(); 
    return result;
  });

  const clientDataQrl = $(async () => {
    const result= await fetchClientCallData(); 
    return result;
  });  

  const onResolvedServerData = $((value: unknown) => (
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
      <h1 class="lusitana mb-4 text-2xl">Qwik routeLoader, useResource Stop!!!</h1>

      {loc.isNavigating && (
        <div class="">
          Loading... (navigating: {String(loc.isNavigating)})
        </div>
      )}      

      <button class="bg-yellow-300 rounded-xl py-1 px-3" onClick$={()=>{
        nav();
      }} >Refresh</button>

      <div class="flex flex-col">
        <span class="text-2xl">Server call</span>
        <ClientResource
          refresh={true}
          fetchData={serverDataQrl}
          onResolved={onResolvedServerData}
          onRejected={onRejectedData}
          onPending={onPendingData}
        />
      </div>

      <div class="flex flex-col">
        <span class="text-2xl">Client call</span>
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
