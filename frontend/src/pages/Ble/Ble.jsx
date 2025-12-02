// src/pages/Ble/Ble.jsx
import "../../App.css";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import { useBle } from "../../context/BleContext";

const Ble = () => {
  const { status, deviceName, error, raw, cl, connect, disconnect } = useBle();

  return (
    <div className="App ble-page">
      <BottomNavBar />
      <h2>BLE Dashboard</h2>

      <section className="ble-status">
        <div>
          <strong>Status:</strong> {status}
        </div>
        <div>
          <strong>Device:</strong> {deviceName ?? "—"}
        </div>
        <div>
          <strong>Raw (g):</strong> {raw ?? "—"}
        </div>
        <div>
          <strong>CL:</strong> {cl ?? "—"}
        </div>
        {error && (
          <div className="ble-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={{ marginTop: 10 }}>
          {status === "connected" ? (
            <button onClick={disconnect}>🔌 Disconnect BLE</button>
          ) : (
            <button onClick={connect}>🔗 Connect BLE</button>
          )}
        </div>

        <div style={{ marginTop: 10 }}>
          <button onClick={() => alert("Debug popup vagy konzol információk")}>
            BLE Debug
          </button>
        </div>
      </section>
    </div>
  );
};

export default Ble;
