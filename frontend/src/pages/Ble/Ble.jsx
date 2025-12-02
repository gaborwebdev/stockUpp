// src/pages/Ble/Ble.jsx
// import "../../App.css";
import styles from "./Ble.module.css";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar";
import { useBle } from "../../context/BleContext";

const Ble = () => {
  const { status, deviceName, error, raw, cl, connect, disconnect } = useBle();

  return (
    <div className={styles["ble-page"]}>
      <BottomNavBar />
      <h2 className={styles["ble-header"]}>BLE Dashboard</h2>

      <div className={styles["ble-status-wrapper"]}>
        <section className={styles["ble-status"]}>
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
        </section>

        <div className={styles["ble-action-button-wrapper"]}>
          {status === "connected" ? (
            <button
              className={styles["ble-action-button"]}
              onClick={disconnect}
            >
              🔌 Disconnect BLE
            </button>
          ) : (
            <button className={styles["ble-action-button"]} onClick={connect}>
              🔗 Connect BLE
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <button onClick={() => alert("Debug popup vagy konzol információk")}>
          BLE Debug
        </button>
      </div>
    </div>
  );
};

export default Ble;
