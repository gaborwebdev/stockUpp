// StockRowEditor.jsx
import { useState } from "react";
import CountedButtons from "../CountedButtons/CountedButtons.jsx";

const StockRowEditor = ({
  countedData,
  subItem,
  setStockCounts,
  onRequestReMeasure, // (idx) => void   -- open CountPopUp / BLE based on entry type
  onRequestBleReMeasure, // (idx) => void -- explicit BLE re-measure (optional)
}) => {
  const [editing, setEditing] = useState(false);

  if (countedData.length === 0) {
    return <span>-</span>;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      {!editing ? (
        <>
          <span>
            {countedData.map((entry, idx) => {
              const val = entry.longForm
                ? `${entry.count}*${entry.toBase}`
                : entry.convertedValue % 1 === 0
                ? entry.convertedValue
                : entry.convertedValue.toFixed(2);
              return (
                <span key={idx}>
                  {idx > 0 && " + "}
                  {val}
                </span>
              );
            })}
          </span>
          <button
            onClick={() => setEditing(true)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
            title="Edit counted values"
          >
            ✏️
          </button>
        </>
      ) : (
        <div style={{ width: "100%" }}>
          <CountedButtons
            countedData={countedData}
            onDelete={(idx) => {
              const updated = [...countedData];
              updated.splice(idx, 1);
              setStockCounts((prev) => ({
                ...prev,
                [subItem.itemName]: {
                  ...prev[subItem.itemName],
                  counted: updated,
                  total: updated.reduce((sum, e) => sum + e.convertedValue, 0),
                },
              }));
              if (updated.length === 0) setEditing(false);
            }}
            onReMeasure={(idx) => {
              // delegate to parent DoStock to handle currentEdit + open popup
              if (!countedData[idx]) return;
              const entry = countedData[idx];
              if (entry.type && entry.type.startsWith("BLE")) {
                // BLE re-measure
                if (typeof onRequestBleReMeasure === "function") {
                  onRequestBleReMeasure(idx);
                } else if (typeof onRequestReMeasure === "function") {
                  onRequestReMeasure(idx);
                }
              } else {
                // normal re-measure
                if (typeof onRequestReMeasure === "function") {
                  onRequestReMeasure(idx);
                }
              }
            }}
          />
          <div style={{ marginTop: "0.25rem" }}>
            <button onClick={() => setEditing(false)}>Bezár</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockRowEditor;
