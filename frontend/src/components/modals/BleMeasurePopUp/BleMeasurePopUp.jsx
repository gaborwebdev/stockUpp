export default function BleMeasurePopup({ item, onClose, onConfirm, ble = {}}) {
  const { status, deviceName, rawWeight, netWeight, clValue, errorMsg, connect, disconnect } = ble;

  const handleConfirm = () => {
    if (typeof onConfirm === "function") onConfirm(clValue ?? 0);
    onClose();
    disconnect();
  };

  return (
    <div className="popup-overlay-ble">
      <div className="popup-content-ble">
        <h2>{item?.itemName ?? "Mérés"}</h2>

        <p className="status">
          Állapot: {status}
          {deviceName ? ` — ${deviceName}` : ""}
        </p>

        {status === "idle" && (
          <>
            <p>Csatlakozz a BLE mérleghez.</p>
            <button onClick={() => connect(item)}>Csatlakozás</button>
          </>
        )}

        {status === "connecting" && <p>Csatlakozás...</p>}

        {status === "connected" && (
          <>
            <p>Mért súly: {rawWeight ?? "—"} g</p>
            <p>Nettó: {netWeight ?? "—"} g</p>
            <p>Számolt mennyiség: {clValue ?? "—"} cl</p>
            <button onClick={handleConfirm}>Mentés</button>
          </>
        )}

        {status === "error" && (
          <>
            <p style={{ color: "salmon" }}>Hiba: {errorMsg}</p>
            <button onClick={() => connect(item)}>Újra próbálom</button>
          </>
        )}

        <button
          onClick={() => {
            onClose();
            disconnect();
          }}
        >
          Bezárás
        </button>
      </div>
    </div>
  );
}
