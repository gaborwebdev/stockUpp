// src/hooks/useBleMeasure.js
import { useEffect, useRef, useState } from "react";

export default function useBleMeasure() {
  //
  // ─── STATE ────────────────────────────────────────────────────────────────
  //
  const [status, setStatus] = useState("idle"); 
  // idle | connecting | connected | error

  const [deviceName, setDeviceName] = useState(null);
  const [error, setError] = useState(null);

  const [raw, setRaw] = useState(null);   // mért súly (g)
  const [net, setNet] = useState(null);   // nettó súly (g)
  const [cl, setCl] = useState(null);     // számolt cl érték

  //
  // ─── CONFIG ────────────────────────────────────────────────────────────────
  //
  const SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
  const CHAR_UUID = "0000fff1-0000-1000-8000-00805f9b34fb";

  //
  // ─── REFS (persistent values) ──────────────────────────────────────────────
  //
  const deviceRef = useRef(null);
  const serverRef = useRef(null);
  const charRef = useRef(null);
  const valueHandlerRef = useRef(null);

  //
  // ─── MAIN PARSING FUNCTION ─────────────────────────────────────────────────
  //
  const handleValue = (event) => {
    try {
      const bytes = new Uint8Array(event.target.value.buffer);

      const high = bytes[5] ?? 0;
      const low = bytes[6] ?? 0;
      const measured = high * 256 + low;

      setRaw(measured);

      // net + cl számítás NEM itt történik!
      // A popup fogja kiszámolni, mert az item-densitiy és üveg-tömeg ott ismert.
      // Itt csak a mért nyers adatot tároljuk.
      
    } catch (err) {
      setError(err?.message || String(err));
      setStatus("error");
    }
  };

  //
  // ─── CONNECT ───────────────────────────────────────────────────────────────
  //
  const connect = async () => {
    if (!navigator.bluetooth) {
      setError("A böngésződ nem támogatja a Web Bluetooth API-t.");
      setStatus("error");
      return;
    }

    try {
      setStatus("connecting");
      setError(null);

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [SERVICE_UUID],
      });

      deviceRef.current = device;
      setDeviceName(device.name || device.id);

      const server = await device.gatt.connect();
      serverRef.current = server;

      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHAR_UUID);
      charRef.current = characteristic;

      // save handler so we can remove it on disconnect
      valueHandlerRef.current = handleValue;

      characteristic.addEventListener(
        "characteristicvaluechanged",
        valueHandlerRef.current
      );
      await characteristic.startNotifications();

      setStatus("connected");
    } catch (err) {
      setError(err?.message || String(err));
      setStatus("error");
    }
  };

  //
  // ─── DISCONNECT ────────────────────────────────────────────────────────────
  //
  const disconnect = async () => {
    try {
      if (charRef.current) {
        try {
          await charRef.current.stopNotifications();
          charRef.current.removeEventListener(
            "characteristicvaluechanged",
            valueHandlerRef.current
          );
        } catch (_) {}
      }

      if (serverRef.current?.connected) {
        serverRef.current.disconnect();
      }
    } catch (_) {}

    deviceRef.current = null;
    serverRef.current = null;
    charRef.current = null;
    valueHandlerRef.current = null;

    setStatus("idle");
    setDeviceName(null);
    setRaw(null);
    setNet(null);
    setCl(null);
    setError(null);
  };

  //
  // ─── AUTO CLEANUP ───────────────────────────────────────────────────────────
  //
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  //
  // ─── PUBLIC API ─────────────────────────────────────────────────────────────
  //
  return {
    status,
    deviceName,
    error,

    raw,   // mért súly (gramm)
    net,   // még nem használjuk itt
    cl,    // még nem használjuk itt
    // (net és cl később számítható a popupban / komponensben)

    connect,
    disconnect,
  };
}
