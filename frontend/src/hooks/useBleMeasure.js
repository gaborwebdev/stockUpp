import { useState, useRef, useEffect } from "react";

export default function useBleMeasure() {
  const [status, setStatus] = useState("idle"); // idle | connecting | connected | error
  const [deviceName, setDeviceName] = useState(null);
  const [rawWeight, setRawWeight] = useState(null);
  const [netWeight, setNetWeight] = useState(null);
  const [clValue, setClValue] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const serverRef = useRef(null);
  const deviceRef = useRef(null);
  const characteristicRef = useRef(null);
  const valueHandlerRef = useRef(null);

  const SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
  const CHAR_UUID = "0000fff1-0000-1000-8000-00805f9b34fb";

  const connect = async (item) => {
    if (!navigator.bluetooth) {
      setErrorMsg("A böngésződ nem támogatja a Web Bluetooth API-t.");
      setStatus("error");
      return;
    }

    try {
      setStatus("connecting");
      setErrorMsg(null);

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
      characteristicRef.current = characteristic;

      // adatfeldolgozó
      valueHandlerRef.current = (event) => {
        const bytes = new Uint8Array(event.target.value.buffer);
        const high = bytes[5] ?? 0;
        const low = bytes[6] ?? 0;
        const measured = high * 256 + low;

        setRawWeight(measured);

        const nett = measured - (item?.emptyBottleWeight ?? 0);
        const safeNet = nett > 0 ? nett : 0;
        setNetWeight(safeNet);

        const cl = safeNet / (item?.density ?? 1);
        setClValue(Number(cl.toFixed(2)));
      };

      characteristic.addEventListener(
        "characteristicvaluechanged",
        valueHandlerRef.current
      );
      await characteristic.startNotifications();

      setStatus("connected");
    } catch (err) {
      setErrorMsg(err.message || String(err));
      setStatus("error");
    }
  };

  const disconnect = async () => {
    try {
      if (characteristicRef.current) {
        try {
          await characteristicRef.current.stopNotifications();
          characteristicRef.current.removeEventListener(
            "characteristicvaluechanged",
            valueHandlerRef.current
          );
        } catch (_) {}
      }
      if (serverRef.current?.connected) {
        serverRef.current.disconnect();
      }

      deviceRef.current = null;
      serverRef.current = null;
      characteristicRef.current = null;
      valueHandlerRef.current = null;

      setStatus("idle");
      setDeviceName(null);
      setRawWeight(null);
      setNetWeight(null);
      setClValue(null);
      setErrorMsg(null);
    } catch (_) {}
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    status,
    deviceName,
    rawWeight,
    netWeight,
    clValue,
    errorMsg,
    connect,
    disconnect,
  };
}
