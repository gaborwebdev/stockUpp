import { useEffect, useRef, useState } from "react";

/**
 * Props:
 * - item: objektum az ital adataival (item.uvegSuly (g), item.fajsuly (g/cl) opcionális)
 * - onClose: () => void
 * - onConfirm?: (clValue:number) => void  // opcionális: ha szeretnéd menteni a mért cl-t
 */
export default function BleMeasurePopup({ item, onClose, onConfirm }) {
  const [status, setStatus] = useState("not_connected"); // not_connected | connecting | connected | error | not_available
  const [deviceName, setDeviceName] = useState(null);
  const [rawWeight, setRawWeight] = useState(null); // grammban, nyers mért érték
  const [netWeight, setNetWeight] = useState(null); // nettó (mért - uveg)
  const [clValue, setClValue] = useState(null); // számított cl
  const [errorMsg, setErrorMsg] = useState(null);

  // helyőrző UUID-ek (a te kódban használtak)
  const SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
  const CHAR_UUID = "0000fff1-0000-1000-8000-00805f9b34fb";

  const serverRef = useRef(null);
  const deviceRef = useRef(null);
  const characteristicRef = useRef(null);
  const valueHandlerRef = useRef(null);

  // default értékek, ha nincs a JSON-ban
  const uvegSuly = item?.uvegSuly ?? 0; // gramm
  const fajsuly = item?.fajsuly ?? 1; // g / cl (ha nincs, 1 g/cl -> 1g = 1cl) - igazítsd ha mást szeretnél

  // Helper: feldolgozza a karakterisztikumból jövő adatot
  const handleCharacteristicValue = (event) => {
    try {
      const buffer = event.target.value.buffer;
      const bytes = Array.from(new Uint8Array(buffer));
      console.log("BLE bytes:", bytes);

      // --- itt a te tesztkódod alapján használjuk a 18. bájtot ---
      // vedd figyelembe: ellenőrizzük, hogy létezik-e az index
      if (bytes.length > 18) {
        const g = bytes[18]; // egyszerű demo: az utolsó bájt a gramm
        const measured = Number(g);
        setRawWeight(measured);

        // nettó és cl számítás
        const nett = measured - uvegSuly;
        setNetWeight(nett > 0 ? nett : 0);

        const cl = nett > 0 ? nett / (fajsuly || 1) : 0;
        setClValue(Number(cl.toFixed(2)));
        console.log(`Parsed weight: ${measured} g, nettó: ${nett} g, cl: ${cl.toFixed(2)}`);
      } else {
        // ha más a payload forma, csak logoljuk, ne törjön a komponens
        console.warn("BLE payload túl rövid a várt 19 bájthoz:", bytes.length);
      }
    } catch (err) {
      console.error("Error parsing characteristic value:", err);
      setErrorMsg(err.message || String(err));
      setStatus("error");
    }
  };

  // Connect flow
  const connectToScale = async () => {
    if (!navigator.bluetooth) {
      setErrorMsg("A böngésződ nem támogatja a Web Bluetooth API-t.");
      setStatus("not_available");
      console.warn("Web Bluetooth nem elérhető");
      return;
    }

    try {
      setStatus("connecting");
      setErrorMsg(null);
      console.log("BLE: requestDevice...");

      const device = await navigator.bluetooth.requestDevice({
        // acceptAllDevices: true, // ha specifikus filtert tudsz, érdemes használni
        //filters: [{ services: [SERVICE_UUID] }],
        acceptAllDevices: true,
        optionalServices: [SERVICE_UUID],
      });

      deviceRef.current = device;
      setDeviceName(device.name || device.id);

      console.log("BLE: connecting to GATT...");
      const server = await device.gatt.connect();
      serverRef.current = server;

      // get service + characteristic
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHAR_UUID);
      characteristicRef.current = characteristic;

      // register handler
      valueHandlerRef.current = handleCharacteristicValue;
      characteristic.addEventListener(
        "characteristicvaluechanged",
        valueHandlerRef.current
      );

      await characteristic.startNotifications();
      console.log("BLE: started notifications");
      setStatus("connected");
    } catch (err) {
      console.error("BLE connect error:", err);
      setErrorMsg(err.message || String(err));
      setStatus("error");
      // cleanup partial connections
      try {
        if (serverRef.current && serverRef.current.connected) {
          serverRef.current.disconnect();
        }
      } catch (e) {
        /* ignore */
      }
    }
  };

  // Disconnect + cleanup
  const disconnect = async () => {
    try {
      // stop notifications
      if (characteristicRef.current) {
        try {
          await characteristicRef.current.stopNotifications();
          characteristicRef.current.removeEventListener(
            "characteristicvaluechanged",
            valueHandlerRef.current
          );
        } catch (e) {
          // sok eszköz dobhat ilyet ha már leállt
          console.warn("Error stopping notifications:", e);
        }
      }

      if (serverRef.current && serverRef.current.connected) {
        serverRef.current.disconnect();
      }

      deviceRef.current = null;
      serverRef.current = null;
      characteristicRef.current = null;
      valueHandlerRef.current = null;
      setStatus("not_connected");
      console.log("BLE: disconnected and cleaned up");
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  };

  // Mérés (Confirm) — átadja a számított cl értéket (ha van)
  const handleConfirm = () => {
    console.log("BLE: confirm, cl:", clValue);
    if (typeof onConfirm === "function") onConfirm(clValue ?? 0);
    onClose();
    // opcionálisan disconnect
    disconnect();
  };

  // Komponens unmount cleanup: leiratkozás és disconnect
  useEffect(() => {
    return () => {
      (async () => {
        if (characteristicRef.current && valueHandlerRef.current) {
          try {
            characteristicRef.current.removeEventListener(
              "characteristicvaluechanged",
              valueHandlerRef.current
            );
          } catch (e) {
            /* ignore */
          }
        }
        if (serverRef.current && serverRef.current.connected) {
          try {
            serverRef.current.disconnect();
          } catch (e) {
            /* ignore */
          }
        }
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="popup-overlay-ble">
      <div className="popup-content-ble">
        <h2>{item?.itemName ?? "Ismeretlen tétel"}</h2>

        <p className="status">BLE állapot: {status}{deviceName ? ` — ${deviceName}` : ""}</p>

        {status === "not_connected" && (
          <>
            <p>Nem csatlakoztál a mérleghez.</p>
            <button className="connect-btn" onClick={connectToScale}>
              Csatlakozás BLE-hez
            </button>
          </>
        )}

        {status === "connecting" && <p>Csatlakozás folyamatban…</p>}

        {status === "connected" && (
          <>
            <p>Mért súly: {rawWeight ?? "—"} g</p>
            <p>Üveg súlya: {uvegSuly} g</p>
            <p>Nettó tömeg: {netWeight ?? "—"} g</p>
            <p>Számolt mennyiség: {clValue ?? "—"} cl</p>

            <div style={{ width: "100%", marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <button className="measure-btn" onClick={() => console.log("Demo: measurement read (notifications already running)")}>
                Frissítés (demo)
              </button>
              <button
                className="confirm-btn"
                onClick={handleConfirm}
                style={{ backgroundColor: "#21a1f1" }}
              >
                Mentés (Confirm)
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <p style={{ color: "salmon" }}>Hiba: {errorMsg}</p>
            <button className="not-available-btn" onClick={() => setStatus("not_available")}>
              Jelzem: nincs eszköz
            </button>
          </>
        )}

        {status === "not_available" && <p style={{ color: "red" }}>Eszköz nem elérhető.</p>}

        <div className="popup-footer">
          <button className="not-available-btn" onClick={() => { console.log("User: device not available"); setStatus("not_available"); }}>
            Nincs eszköz
          </button>
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
