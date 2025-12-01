// src/components/modals/BleMeasurePopUp/BleMeasurePopUp.jsx
import { useEffect, useMemo } from "react";

/**
 * Props:
 * - item: objektum az ital adataival (item.emptyBottleWeight (g), item.density (g/cl) opcionális)
 * - onClose: () => void
 * - onConfirm?: (clValue:number) => void
 * - ble: objektum a useBleMeasure hook visszatéréseivel (status, deviceName, raw, connect, disconnect, error, ...)
 *
 * IMPORTANT: ez a popup NEM kezeli a BLE kapcsolódás teljes lifecycle-át.
 * A connect/disconnect vezérlést a DoStock (header) végzi. A popup csak fogyasztja a ble adatokat.
 */
export default function BleMeasurePopup({
  item,
  onClose,
  onConfirm,
  ble = {},
}) {
  // biztonságos destructuring + default func-ok
  const {
    status = "idle", // idle | connecting | connected | error | not_available
    deviceName = null,
    raw = null, // nyers mért gramm
    error = null,
    connect = () => {},
    disconnect = () => {},
  } = ble;

  // default értékek az item-ből
  const emptyBottleWeight = item?.emptyBottleWeight ?? 0; // gramm
  const density = item?.density ?? 1; // g / cl

  // Számított nettó és cl értékek (useMemo mert raw gyakran frissül)
  const { netWeight, clValue } = useMemo(() => {
    const measured = Number(raw ?? 0);
    const nett = measured - emptyBottleWeight;
    const safeNet = nett > 0 ? nett : 0;
    const cl = safeNet > 0 ? safeNet / (density || 1) : 0;
    return {
      netWeight: safeNet,
      clValue: Number(cl.toFixed(2)),
    };
  }, [raw, emptyBottleWeight, density]);

  // Ha a popup megnyílik és szeretnél automatikusan indítani olvasást,
  // a DoStock-ban kezeld a connect-et. Itt opcionálisan lehet connect gomb.
  // Korábbi viselkedéshez hasonlóan a Confirm a cl értéket adja vissza,
  // de NEM disconnect-el automatikusan, hogy a DoStock kapcsolatot fenntarthassa.

  const handleConfirm = () => {
    if (typeof onConfirm === "function") onConfirm(clValue ?? 0);
    if (typeof onClose === "function") onClose();
    // NEM: disconnect();  <-- ne bontsa a kapcsolatot automatikusan
  };

  return (
    <div className="popup-overlay-ble">
      <div className="popup-content-ble">
        <h2>{item?.itemName ?? "Ismeretlen tétel"}</h2>

        <p className="status">
          BLE állapot: {status}
          {deviceName ? ` — ${deviceName}` : ""}
        </p>

        {/* NOT CONNECTED */}
        {status === "idle" && (
          <>
            <p>Nem csatlakoztál a mérleghez.</p>
            <button className="connect-btn" onClick={connect}>
              Csatlakozás BLE-hez
            </button>
          </>
        )}

        {/* CONNECTING */}
        {status === "connecting" && <p>Csatlakozás folyamatban…</p>}

        {/* CONNECTED */}
        {status === "connected" && (
          <>
            <p>Mért súly: {raw ?? "—"} g</p>
            <p>Üveg súlya: {emptyBottleWeight} g</p>
            <p>Nettó tömeg: {netWeight ?? "—"} g</p>
            <p>Számolt mennyiség: {clValue ?? "—"} cl</p>

            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <button
                className="measure-btn"
                onClick={() =>
                  console.log(
                    "Debug: current raw bytes/weight from BLE hook:",
                    raw
                  )
                }
              >
                Frissítés (debug)
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

        {/* ERROR */}
        {status === "error" && (
          <>
            <p style={{ color: "salmon" }}>
              Hiba: {error ?? "Ismeretlen hiba"}
            </p>
            <button className="not-available-btn" onClick={connect}>
              Újra próbálom
            </button>
          </>
        )}

        {status === "not_available" && (
          <p style={{ color: "red" }}>Eszköz nem elérhető.</p>
        )}

        <div className="popup-footer">
          <button
            className="not-available-btn"
            onClick={() => {
              // csak bezárjuk a popupot — NEM bontjuk a kapcsolatot automatikusan
              if (typeof onClose === "function") onClose();
            }}
          >
            Nincs eszköz
          </button>

          <button
            className="close-btn"
            onClick={() => {
              if (typeof onClose === "function") onClose();
            }}
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
}
