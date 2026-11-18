import { useCallback, useEffect, useRef, useState } from "react";

const CHUNK_MS = 5000;

/**
 * Browser Capture Module (SDS §3.2 / Fig. 8.4): webcam + microphone via getUserMedia, screen via
 * getDisplayMedia, both recorded with MediaRecorder in timesliced chunks handed to `onChunk`.
 * Chunks that cannot be delivered (offline) are queued and flushed when the connection returns.
 * `simulated` mode skips real devices so the flow can be demoed on machines without a camera.
 */
export function useCapture({ onChunk, onScreenStopped }) {
  const [status, setStatus] = useState("idle"); // idle | requesting | ready | error
  const [error, setError] = useState("");
  const [screenActive, setScreenActive] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const camStream = useRef(null);
  const screenStream = useRef(null);
  const recorders = useRef([]);
  const queue = useRef([]);
  const camEl = useRef(null);
  const screenEl = useRef(null);
  const cb = useRef({ onChunk, onScreenStopped });
  useEffect(() => { cb.current = { onChunk, onScreenStopped }; });

  const flush = useCallback(async () => {
    while (queue.current.length && navigator.onLine) {
      const item = queue.current[0];
      try { await cb.current.onChunk(item.type, item.size); queue.current.shift(); } catch { break; }
    }
  }, []);
  useEffect(() => {
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, [flush]);

  const record = (stream, type) => {
    if (typeof MediaRecorder === "undefined") return;
    const rec = new MediaRecorder(stream);
    rec.ondataavailable = (e) => { if (e.data?.size) { queue.current.push({ type, size: e.data.size }); flush(); } };
    rec.start(CHUNK_MS);
    recorders.current.push(rec);
  };

  const attach = useCallback(() => {
    if (camEl.current && camStream.current) camEl.current.srcObject = camStream.current;
    if (screenEl.current && screenStream.current) screenEl.current.srcObject = screenStream.current;
  }, []);

  const grabScreen = async () => {
    const s = await navigator.mediaDevices.getDisplayMedia({ video: true });
    screenStream.current = s;
    s.getVideoTracks()[0].addEventListener("ended", () => { setScreenActive(false); cb.current.onScreenStopped?.(); });
    setScreenActive(true);
    record(s, "screen");
    return s;
  };

  const start = useCallback(async ({ simulate = false } = {}) => {
    setStatus("requesting"); setError("");
    if (simulate) { setSimulated(true); setScreenActive(true); setStatus("ready"); return true; }
    try {
      if (!navigator.mediaDevices?.getUserMedia || !navigator.mediaDevices?.getDisplayMedia) throw Object.assign(new Error("unsupported"), { name: "NotSupportedError" });
      camStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      record(camStream.current, "webcam");
      await grabScreen();
      setStatus("ready");
      setTimeout(attach, 0);
      return true;
    } catch (e) {
      camStream.current?.getTracks().forEach((t) => t.stop());
      recorders.current.forEach((r) => r.state !== "inactive" && r.stop());
      recorders.current = []; camStream.current = null; screenStream.current = null;
      const msg = e.name === "NotAllowedError" ? "Permission was blocked. Allow camera, microphone and screen sharing in the browser prompt to continue; the interview cannot start until all three are granted."
        : e.name === "NotFoundError" ? "No camera or microphone was found on this device."
        : e.name === "NotSupportedError" ? "This browser does not support screen capture. Use a recent desktop version of Chrome, Edge or Firefox."
        : "Capture could not be started. Check your devices and try again.";
      setError(msg); setStatus("error");
      return false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attach]);

  const reshare = useCallback(async () => {
    try { await grabScreen(); setTimeout(attach, 0); return true; } catch { return false; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attach]);

  const stop = useCallback(async () => {
    recorders.current.forEach((r) => r.state !== "inactive" && r.stop());
    recorders.current = [];
    await new Promise((r) => setTimeout(r, 300)); // let final dataavailable events fire
    await flush();
    camStream.current?.getTracks().forEach((t) => t.stop());
    screenStream.current?.getTracks().forEach((t) => t.stop());
    camStream.current = null; screenStream.current = null;
    setScreenActive(false); setStatus("idle");
  }, [flush]);

  useEffect(() => () => {
    recorders.current.forEach((r) => r.state !== "inactive" && r.stop());
    camStream.current?.getTracks().forEach((t) => t.stop());
    screenStream.current?.getTracks().forEach((t) => t.stop());
  }, []);

  return { status, error, screenActive, simulated, start, stop, reshare, camEl, screenEl, attach, pendingChunks: () => queue.current.length };
}
