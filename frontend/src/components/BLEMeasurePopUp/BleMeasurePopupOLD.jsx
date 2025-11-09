import { useState } from "react";

export default function BleMeasurePopup({ item, onClose }) {
  const [status, setStatus] = useState("not_connected");

  const handleConnect = () => {
    console.log("BLE: connection attempt...");
    setStatus("connecting");

    setTimeout(() => {
      console.log("BLE: connected successfully.");
      setStatus("connected");
    }, 1000);
  };

  const handleMeasure = () => {
    console.log(`BLE: starting measurement for ${item.itemName}...`);
    setTimeout(() => {
      console.log("BLE: measurement complete. Weight = 750g (demo)");
    }, 800);
  };

  const handleNotAvailable = () => {
    console.log("BLE: device not available.");
    setStatus("not_available");
  };

  return (
    <div className="popup-overlay-ble">
      <div className="popup-content-ble">
        <h2>{item.itemName}</h2>
        <p className="status">BLE állapot: {status}</p>

        {status === "not_connected" && (
          <button className="connect-btn" onClick={handleConnect}>
            Csatlakozás BLE-hez
          </button>
        )}

        {status === "connecting" && <p>Csatlakozás folyamatban...</p>}

        {status === "connected" && (
          <>
            <button className="measure-btn" onClick={handleMeasure}>
              Mérés indítása
            </button>
          </>
        )}

        {status === "not_available" && (
          <p style={{ color: "red" }}>Eszköz nem elérhető.</p>
        )}

        <div className="popup-footer">
          <button
            className="not-available-btn"
            onClick={handleNotAvailable}
          >
            Nincs eszköz
          </button>
          <button className="close-btn" onClick={onClose}>
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
}
