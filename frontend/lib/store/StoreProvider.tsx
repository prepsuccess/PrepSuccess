"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { storageChecked } from "@/lib/auth/authSlice";
import { getAccessToken } from "@/lib/auth/session";
import { makeStore, type AppStore } from "./store";

export function StoreProvider({
  children,
  store: given,
}: {
  children: ReactNode;
  store?: AppStore;
}) {
  const [store] = useState(() => given ?? makeStore());

  useEffect(() => {
    // localStorage only exists in the browser, so the session is detected after mount.
    store.dispatch(storageChecked({ hasToken: Boolean(getAccessToken()) }));
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
