import {
  component$,
  isBrowser,
  JSXOutput,
  QRL,
  Resource,
  useResource$,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

export interface ClientResourceProps<T> {
  refresh: boolean;
  fetchData: QRL<() => Promise<T>>;
  // readonly value: ResourceReturn<T> | Signal<Promise<T> | T> | Promise<T>;
  onResolved: QRL<(value: T) => JSXOutput | Promise<JSXOutput>>;
  onPending?: QRL<() => JSXOutput | Promise<JSXOutput>>;
  onRejected?: QRL<(reason: Error) => JSXOutput | Promise<JSXOutput>>;
}

export const ClientResource = component$(
  <T,>(props: ClientResourceProps<T>) => {
    const run = useSignal(0); // 트리거

    const resource = useResource$(async ({ track, cleanup }) => {
      track(() => run.value); // run이 바뀔 때만 재실행
      if (run.value == 0) return; // 숨김 상태면 fetch 안 함(선택)

      const controller = new AbortController();
      cleanup(() => controller.abort());

      return await props.fetchData(); // 여기에 catch 추가로 로컬 처리
    });

    useVisibleTask$(() => {
      if (isBrowser) {
        run.value++;
      }
    });

    const loc = useLocation();

    useTask$(({ track }) => {
      track(() => loc.isNavigating);

      if (isBrowser && props.refresh) {
        run.value++;
      }
    });

    return (
      <>
        <Resource
          value={resource}
          onResolved={(value) =>
            value != null ? props.onResolved(value) : null
          }
          onRejected={
            props.onRejected
              ? (e) => {
                  // console.log("props.onRejected!(e)", e);
                  return props.onRejected!(e);
                }
              : undefined
          }
          onPending={props.onPending ? () => props.onPending!() : undefined}
        />
      </>
    );
  },
);
