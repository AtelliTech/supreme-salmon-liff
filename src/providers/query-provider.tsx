"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { HTTPError } from "ky";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bid = searchParams.get("bid");

  const queryClient = useRef(
    new QueryClient({
      queryCache: new QueryCache({
        onError: (error) => {
          if (error instanceof HTTPError) {
            if (error.response.status === 401) {
              if (!bid) {
                router.push(`/login`);
                return;
              }

              router.push(`/login?bid=${bid}`);
            }
          }
        },
      }),
      mutationCache: new MutationCache({
        onError: (error) => {
          if (error instanceof HTTPError) {
            if (error.response.status === 401) {
              if (!bid) {
                router.push(`/login`);
                return;
              }
              router.push(`/login?bid=${bid}`);
            }
          }
        },
      }),
    }),
  ).current;

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
