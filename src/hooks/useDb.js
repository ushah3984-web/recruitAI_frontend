import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getState, subscribe } from "../api/db";

/** Re-renders when the mock database changes. */
export const useDbVersion = () => useSyncExternalStore(subscribe, getState);

/**
 * Runs an async service call and exposes { data, loading, error, reload }.
 * Re-runs when `deps` change and silently whenever the database changes,
 * so lists stay current after mutations (stand-in for refetching from the API).
 */
export function useQuery(fetcher, deps = []) {
  const db = useDbVersion();
  const key = JSON.stringify(deps);
  const [res, setRes] = useState({ key: null, data: null, error: "" });
  const fetcherRef = useRef(fetcher);
  useEffect(() => { fetcherRef.current = fetcher; });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const data = await fetcherRef.current();
        if (live) setRes({ key, data, error: "" });
      } catch (e) {
        if (live) setRes({ key, data: null, error: e.message || "Something went wrong." });
      }
    })();
    return () => { live = false; };
  }, [key, db, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const loading = res.key !== key;
  return { data: loading ? null : res.data, loading, error: loading ? "" : res.error, reload };
}
