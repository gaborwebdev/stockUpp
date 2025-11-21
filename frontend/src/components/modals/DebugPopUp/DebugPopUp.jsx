import { useState, useRef } from "react";

export default function BleDebugLive({ onClose }) {
  const [status, setStatus] = useState("not_connected");
  const [deviceName, setDeviceName] = useState(null);
  const [currentBytes, setCurrentBytes] = useState([]);
  const [currentWeight, setCurrentWeight] = useState("");

  const serverRef = useRef(null);
  const deviceRef = useRef(null);
  const characteristicRef = useRef(null);
  const valueHandlerRef = useRef(null);

  const handleCharacteristicValue = (event) => {
    const buffer = event.target.value.buffer;
    const byteArray = Array.from(new Uint8Array(buffer));

    setCurrentBytes(byteArray);

    // Opció: ha van logikád a súly számítására (gramm), ide teheted
    // pl.: setCurrentWeight(computeWeightFromBytes(byteArray));
    const high = byteArray[5] ?? 0;
    const low = byteArray[6] ?? 0;
    const sum = high * 256 + low;

    setCurrentWeight(sum);
  };

  const connectToScale = async () => {
    try {
      setStatus("connecting");
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["0000fff0-0000-1000-8000-00805f9b34fb"],
      });
      deviceRef.current = device;
      setDeviceName(device.name || device.id);

      const server = await device.gatt.connect();
      serverRef.current = server;

      const service = await server.getPrimaryService(
        "0000fff0-0000-1000-8000-00805f9b34fb"
      );
      const characteristic = await service.getCharacteristic(
        "0000fff1-0000-1000-8000-00805f9b34fb"
      );
      characteristicRef.current = characteristic;

      valueHandlerRef.current = handleCharacteristicValue;
      characteristic.addEventListener(
        "characteristicvaluechanged",
        valueHandlerRef.current
      );
      await characteristic.startNotifications();
      setStatus("connected");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const disconnect = async () => {
    try {
      if (characteristicRef.current) {
        characteristicRef.current.removeEventListener(
          "characteristicvaluechanged",
          valueHandlerRef.current
        );
        await characteristicRef.current.stopNotifications();
      }
      if (serverRef.current && serverRef.current.connected) {
        serverRef.current.disconnect();
      }
      setStatus("not_connected");
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="popup-overlay-ble">
      <div className="popup-content-ble">
        <h2>BLE Debug (Live)</h2>
        <p>
          BLE állapot: {status} {deviceName ? `— ${deviceName}` : ""}
        </p>

        {status === "not_connected" && (
          <button onClick={connectToScale}>Csatlakozás BLE-hez</button>
        )}

        {status === "connected" && (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontFamily: "monospace",
              }}
            >
              <p>
                <strong>Current weight (g):</strong> {currentWeight || "—"}
              </p>
              {currentBytes.map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.2rem 0",
                    borderBottom: "1px solid #ccc",
                  }}
                >
                  <span>Byte[{i}]</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={() => {
              disconnect();
              onClose();
            }}
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
}
