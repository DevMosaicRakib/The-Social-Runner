import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Overloaded function signatures for better type safety
export async function apiRequest(url: string, options?: RequestInit): Promise<any>;
export async function apiRequest(method: string, url: string, data?: unknown): Promise<Response>;
export async function apiRequest(
  urlOrMethod: string,
  urlOrOptions?: string | RequestInit,
  data?: unknown,
): Promise<any> {
  let url: string;
  let options: RequestInit;

  // Handle new signature: apiRequest(url, options)
  if (typeof urlOrOptions === 'object' || urlOrOptions === undefined) {
    url = urlOrMethod;
    options = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      ...urlOrOptions,
    };
  } 
  // Handle legacy signature: apiRequest(method, url, data)
  else {
    const method = urlOrMethod;
    url = urlOrOptions;
    options = {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    };
  }

  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  
  // For new signature, return JSON directly
  if (typeof urlOrOptions === 'object' || urlOrOptions === undefined) {
    return await res.json();
  }
  
  // For legacy signature, return Response
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
