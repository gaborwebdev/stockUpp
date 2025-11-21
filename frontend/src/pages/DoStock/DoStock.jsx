// DoStock.jsx
import "../../App.css";
import CountPopUp from "../../components/modals/CountPopUp/CountPopUp.jsx";
import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import stockData from "../../data/stockListData.json";
import BleMeasurePopup from "../../components/modals/BleMeasurePopUp/BleMeasurePopUp.jsx";
import BleDebugPopup from "../../components/debugPopup/debugPopup";
import StockRowEditor from "../../components/StockRowEditor/StockRowEditor.jsx";

const DoStock = () => {
  const [stockCounts, setStockCounts] = useState(() => {
    const initial = {};
    stockData.forEach((cat) => {
      cat.items.forEach((item) => {
        initial[item.itemName] = {};
      });
    });
    return initial;
  });

  const [popupOpen, setPopupOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentType, setCurrentType] = useState(null);

  // BLE setup
  const [blePopupOpen, setBlePopupOpen] = useState(false);
  const [bleItem, setBleItem] = useState(null);

  // Current edit context: { itemName, index } vagy null
  const [currentEdit, setCurrentEdit] = useState(null);

  // 🆕 Italcsoportok összegyűjtése
  const allGroups = [
    ...new Set(stockData.flatMap((cat) => cat.items.map((i) => i.itemGroup))),
  ];
  const [selectedGroups, setSelectedGroups] = useState([]);

  // Debug popup state
  const [debugOpen, setDebugOpen] = useState(false);

  // 🧠 Szűrt adatok — ha nincs kiválasztva semmi, akkor mindent mutatunk
  const filteredData = stockData.map((cat) => ({
    ...cat,
    items:
      selectedGroups.length === 0
        ? cat.items
        : cat.items.filter((i) => selectedGroups.includes(i.itemGroup)),
  }));

  useEffect(() => {
    document.body.style.overflow = popupOpen ? "hidden" : "auto";
  }, [popupOpen]);

  // HELP: replace-or-append on confirm
  const handleConfirm = (count) => {
    if (!currentItem || !currentType) return;

    const itemName = currentItem.itemName;
    const baseUnit = currentItem.baseUnit || "unit";
    const typeConfig = currentItem.measurementType[currentType] || {};

    const convertedValue = count * (typeConfig.toBase ?? 1);

    setStockCounts((prev) => {
      const prevItem = prev[itemName] || {};
      const prevCounted = Array.isArray(prevItem.counted)
        ? [...prevItem.counted]
        : [];

      if (
        currentEdit &&
        currentEdit.itemName === itemName &&
        Number.isFinite(currentEdit.index)
      ) {
        // Replace existing entry at index
        const idx = currentEdit.index;
        prevCounted[idx] = { type: currentType, count, convertedValue };
      } else {
        // Append as new
        prevCounted.push({ type: currentType, count, convertedValue });
      }

      const newTotal = parseFloat(
        prevCounted.reduce((s, e) => s + (e.convertedValue || 0), 0).toFixed(6)
      );

      return {
        ...prev,
        [itemName]: {
          baseUnit: prevItem.baseUnit || baseUnit,
          total: newTotal,
          counted: prevCounted,
        },
      };
    });

    // reset edit context and close popup
    setCurrentEdit(null);
    setPopupOpen(false);
  };

  // BLE confirm also supports replace
  const handleBleConfirm = (measuredCl, item) => {
    if (!item) return;

    const itemName = item.itemName;

    // Rövid italok és pálinkák literben tárolják a BLE mérést
    const shouldSaveInLiter =
      item.itemGroup === "rövid_italok" || item.itemGroup === "pálinkák";

    const baseUnit = shouldSaveInLiter ? "liter" : "cl";

    // konverzió literbe, ha szükséges
    const convertedValue = shouldSaveInLiter
      ? measuredCl * 0.01 // cl → liter
      : measuredCl; // marad cl

    setStockCounts((prev) => {
      const prevItem = prev[itemName] || {};
      const prevCounted = Array.isArray(prevItem.counted)
        ? [...prevItem.counted]
        : [];

      if (
        currentEdit &&
        currentEdit.itemName === itemName &&
        Number.isFinite(currentEdit.index)
      ) {
        // Replace existing entry at index
        const idx = currentEdit.index;
        prevCounted[idx] = {
          type: shouldSaveInLiter ? "BLE_liter" : "BLE_cl",
          count: measuredCl,
          convertedValue,
        };
      } else {
        // Append
        prevCounted.push({
          type: shouldSaveInLiter ? "BLE_liter" : "BLE_cl",
          count: measuredCl,
          convertedValue,
        });
      }

      const newTotal = parseFloat(
        prevCounted.reduce((s, e) => s + (e.convertedValue || 0), 0).toFixed(6)
      );

      return {
        ...prev,
        [itemName]: {
          baseUnit,
          total: newTotal,
          counted: prevCounted,
        },
      };
    });

    // reset edit context and close popup
    setCurrentEdit(null);
    setBlePopupOpen(false);
  };

  const handleBleMeasureClick = (item) => {
    console.log("BLE mérés indítása:", item.itemName);
    setCurrentEdit(null); // adding new by default
    setBleItem(item);
    setBlePopupOpen(true);
  };

  return (
    <div className="App do-stock">
      <header className="add-buttons-group do-stock-header">
        <p>New stock</p>
        <Link to="/">
          <button className="add-buttons case">Go Back</button>
        </Link>

        <button className="debug-button" onClick={() => setDebugOpen(true)}>
          BLE Debug
        </button>
      </header>

      {/* 🧩 Italcsoport szűrő gombok */}
      <div className="group-filters">
        {allGroups.map((group) => (
          <button
            key={group}
            className={selectedGroups.includes(group) ? "active" : ""}
            onClick={() =>
              setSelectedGroups((prev) =>
                prev.includes(group)
                  ? prev.filter((g) => g !== group)
                  : [...prev, group]
              )
            }
          >
            {group}
          </button>
        ))}
        <button className="reset-filter" onClick={() => setSelectedGroups([])}>
          Összes
        </button>
      </div>

      {/* 🔽 Szűrt lista */}
      {filteredData.map((item, index) => {
        // Csak azok az elemek, amelyek megfelelnek az aktív szűrőknek
        const visibleItems = item.items;

        // Ha nincs megjelenítendő ital ebben a kategóriában, ne mutassuk a címet sem
        if (visibleItems.length === 0) return null;

        return (
          <Fragment key={index}>
            <h3>Category: {item.category}</h3>

            {visibleItems.map((subItem, subIndex) => {
              const countedData = stockCounts[subItem.itemName]?.counted || [];
              // Long-form flag meghatározása:
              const enrichedData = countedData.map((entry) => {
                const unitInfo = subItem.measurementType[entry.type] || {};
                return {
                  ...entry,
                  toBase: unitInfo.toBase ?? 1,
                  longForm: unitInfo["long-form"] || false,
                };
              });

              // re-measure callbacks (passed down)
              const requestReMeasure = (idx) => {
                // set edit context and open CountPopUp for that item/type
                setCurrentEdit({ itemName: subItem.itemName, index: idx });
                const entry = enrichedData[idx];
                // If entry exists, open according popup
                if (!entry) return;
                if (entry.type && entry.type.startsWith("BLE")) {
                  // BLE re-measure flow
                  setBleItem(subItem);
                  setBlePopupOpen(true);
                } else {
                  setCurrentItem(subItem);
                  setCurrentType(entry.type);
                  setPopupOpen(true);
                }
              };

              const requestBleReMeasure = (idx) => {
                setCurrentEdit({ itemName: subItem.itemName, index: idx });
                setBleItem(subItem);
                setBlePopupOpen(true);
              };

              return (
                <div className="row-in-stock" key={subIndex}>
                  <div className="item-name-and-counted">
                    <div className="item-name">{subItem.itemName}</div>
                    <StockRowEditor
                      countedData={enrichedData}
                      subItem={subItem}
                      setStockCounts={setStockCounts}
                      onRequestReMeasure={requestReMeasure}
                      onRequestBleReMeasure={requestBleReMeasure}
                    />
                  </div>

                  <div className="left-side-group">
                    <div className="total-in-stock">
                      <div className="total-title">Total:</div>
                      <div className="total-value">
                        {(() => {
                          const itemData = stockCounts[subItem.itemName];
                          const total =
                            itemData && itemData.total !== undefined
                              ? itemData.total
                              : subItem.itemOnStock || 0;

                          const isDecimalNeeded =
                            subItem.itemGroup === "pálinkák" ||
                            subItem.itemGroup === "rövid italok" ||
                            (subItem.baseUnit === "liter" && total % 1 !== 0);

                          return isDecimalNeeded
                            ? total.toFixed(2)
                            : Math.round(total);
                        })()}
                      </div>
                    </div>

                    <div className="add-buttons-group">
                      {subItem.measurementType &&
                        Object.entries(subItem.measurementType).map(
                          ([type]) => (
                            <div key={type}>
                              <button
                                className="add-buttons bottle"
                                onClick={() => {
                                  // adding new measurement -> clear edit context
                                  setCurrentEdit(null);
                                  setCurrentItem(subItem);
                                  setCurrentType(type);
                                  setPopupOpen(true);
                                }}
                              >
                                {type}
                              </button>
                            </div>
                          )
                        )}

                      {/* BLE */}
                      {subItem.isBleMeasurable && (
                        <button
                          className="add-buttons ble-button"
                          onClick={() => {
                            setCurrentEdit(null);
                            handleBleMeasureClick(subItem);
                          }}
                        >
                          Mérés BLE-vel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </Fragment>
        );
      })}

      {/* PopUp */}
      {popupOpen && currentItem && (
        <CountPopUp
          itemName={currentItem.itemName}
          maxCount={currentItem.measurementType[currentType].maxCount}
          step={currentItem.measurementType[currentType].step}
          onConfirm={handleConfirm}
          onClose={() => {
            setPopupOpen(false);
            setCurrentEdit(null);
          }}
          blePopupOpen={blePopupOpen}
          setBlePopupOpen={setBlePopupOpen}
          bleItem={bleItem}
        />
      )}
      {/* BLE PopUp */}
      {blePopupOpen && bleItem && (
        <BleMeasurePopup
          item={bleItem}
          onClose={() => {
            setBlePopupOpen(false);
            setCurrentEdit(null);
          }}
          onConfirm={(measuredCl) => handleBleConfirm(measuredCl, bleItem)}
        />
      )}
      {/* BLE Debug PopUp */}
      {debugOpen && <BleDebugPopup onClose={() => setDebugOpen(false)} />}
    </div>
  );
};

export default DoStock;
