import { useEffect, useRef, useState } from "react";

export default function BleMeasurePopup({ item, onClose, onConfirm }) {
  const [status, setStatus] = useState("idle"); 
  const [deviceName, setDeviceName] = useState(null);
  const [rawWeight, setRawWeight] = useState(null);
  const [netWeight, setNetWeight] = useState(null);
  const [clValue, setClValue] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
  const CHAR_UUID = "0000fff1-0000-1000-8000-00805f9b34fb";

  const serverRef = useRef(null);
  const deviceRef = useRef(null);
  const characteristicRef = useRef(null);
  const valueHandlerRef = useRef(null);

  const emptyBottleWeight = item?.emptyBottleWeight ?? 0;
  const density = item?.density ?? 1;

  // --- BLE DATA HANDLER ---
  const handleCharacteristicValue = (event) => {
    try {
      const bytes = new Uint8Array(event.target.value.buffer);

      // Parse weight from 5-6 byte (your existing BLE logic)
      const high = bytes[5] ?? 0;
      const low = bytes[6] ?? 0;
      const measured = high * 256 + low;

      setRawWeight(measured);

      const nett = measured - emptyBottleWeight;
      const safeNet = nett > 0 ? nett : 0;
      setNetWeight(safeNet);

      const cl = safeNet / (density || 1);
      setClValue(Number(cl.toFixed(2)));

    } catch (err) {
      setErrorMsg(err.message || String(err));
      setStatus("error");
    }
  };

  // --- CONNECT ---
  const connectToScale = async () => {
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

      valueHandlerRef.current = handleCharacteristicValue;

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

  // --- DISCONNECT ---
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

    } catch (_) {}
  };

  const handleConfirm = () => {
    if (typeof onConfirm === "function") {
      onConfirm(clValue ?? 0);
    }
    onClose();
    disconnect();
  };

  // --- CLEANUP ON UNMOUNT ---
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className="popup-overlay-ble">
      <div className="popup-content-ble">
        <h2>{item?.itemName ?? "Mérés"}</h2>

        <p className="status">
          Állapot: {status}
          {deviceName ? ` — ${deviceName}` : ""}
        </p>

        {/* NOT CONNECTED */}
        {status === "idle" && (
          <>
            <p>Csatlakozz a BLE mérleghez.</p>
            <button className="connect-btn" onClick={connectToScale}>
              Csatlakozás
            </button>
          </>
        )}

        {/* CONNECTING */}
        {status === "connecting" && <p>Csatlakozás...</p>}

        {/* CONNECTED */}
        {status === "connected" && (
          <>
            <p>Mért súly: {rawWeight ?? "—"} g</p>
            <p>Üveg súlya: {emptyBottleWeight} g</p>
            <p>Nettó tömeg: {netWeight ?? "—"} g</p>
            <p>Számolt mennyiség: {clValue ?? "—"} cl</p>

            <button className="confirm-btn" onClick={handleConfirm}>
              Mentés
            </button>
          </>
        )}

        {/* ERROR */}
        {status === "error" && (
          <>
            <p style={{ color: "salmon" }}>Hiba: {errorMsg}</p>
            <button className="connect-btn" onClick={connectToScale}>
              Újra próbálom
            </button>
          </>
        )}

        <div className="popup-footer">
          <button
            className="close-btn"
            onClick={() => {
              onClose();
              disconnect();
            }}
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
}
