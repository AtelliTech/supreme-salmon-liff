"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { HTTPError } from "ky";
import { useRef } from "react";

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useRef(
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
      queryCache: new QueryCache({
        onError: (error) => {
          if (error instanceof HTTPError) {
            console.log("HTTP status:", error.response.status, error.data);

            if (error.data?.code === 404 && error.data?.error_message === "User not found") {
              console.log("User not found. Redirecting to sign-up page.");
              window.location.href = "/sign-up"; 
            }

          }
        },
      }),
      mutationCache: new MutationCache({
        onError: (error) => {
          if (error instanceof HTTPError) {
            console.log("HTTP status:", error.response.status, error.data);
          }
        },
      }),
    }),
  ).current;

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
