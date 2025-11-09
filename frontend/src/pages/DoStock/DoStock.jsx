import "../../App.css";
import CountPopUp from "../../components/CountPopUp/CountPopUp";
import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import stockData from "../../stockListData.json";
import BleMeasurePopup from "../../components/BLEMeasurePopUp/BleMeasurePopup";

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

  // 🆕 Italcsoportok összegyűjtése
  const allGroups = [
    ...new Set(stockData.flatMap((cat) => cat.items.map((i) => i.itemGroup))),
  ];
  const [selectedGroups, setSelectedGroups] = useState([]);

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

  const handleConfirm = (count) => {
    if (!currentItem || !currentType) return;

    const itemName = currentItem.itemName;
    const baseUnit = currentItem.baseUnit || "unit";
    const typeConfig = currentItem.measurementType[currentType] || {};

    const convertedValue = count * (typeConfig.toBase ?? 1);

    setStockCounts((prev) => {
      const prevItem = prev[itemName] || {};
      const prevCounted = Array.isArray(prevItem.counted)
        ? prevItem.counted
        : [];

      const newTotal = parseFloat(
        ((prevItem.total || 0) + convertedValue).toFixed(6)
      );

      return {
        ...prev,
        [itemName]: {
          baseUnit: prevItem.baseUnit || baseUnit,
          total: newTotal,
          counted: [
            ...prevCounted,
            { type: currentType, count, convertedValue },
          ],
        },
      };
    });

    setPopupOpen(false);
  };

  const handleBleConfirm = (measuredCl, item) => {
  if (!item) return;

  const itemName = item.itemName;
  const baseUnit = item.baseUnit || "unit";

  // Mivel BLE esetén a mért érték már "cl" vagy "liter" lehet, nézzük meg
  // a megfelelő konverziót, ha létezik
  const typeKey = "BLE"; // opcionális típusnév, ha később szeretnéd megkülönböztetni
  const toBase = item.measurementType?.cl?.toBase ?? 1;
  const convertedValue = measuredCl * toBase;

  setStockCounts((prev) => {
    const prevItem = prev[itemName] || {};
    const prevCounted = Array.isArray(prevItem.counted)
      ? prevItem.counted
      : [];

    const newTotal = parseFloat(
      ((prevItem.total || 0) + convertedValue).toFixed(6)
    );

    return {
      ...prev,
      [itemName]: {
        baseUnit: prevItem.baseUnit || baseUnit,
        total: newTotal,
        counted: [
          ...prevCounted,
          { type: typeKey, count: measuredCl, convertedValue },
        ],
      },
    };
  });

  console.log(`✅ BLE mérés elmentve: ${itemName} → ${measuredCl} cl`);
  setBlePopupOpen(false);
};


  const handleBleMeasureClick = (item) => {
    console.log("BLE mérés indítása:", item.itemName);
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
              return (
                <div className="row-in-stock" key={subIndex}>
                  <div className="item-name-and-counted">
                    <div className="item-name">{subItem.itemName}</div>

                    <div className="counted-pieces">
                      <div className="title">Számolva:</div>
                      <div className="value">
                        {countedData.length > 0 ? (
                          countedData.map((entry, idx) => {
                            const unit = entry.type;
                            const count = entry.count;
                            const unitInfo = subItem.measurementType[unit];
                            const toBase = unitInfo?.toBase ?? 1;
                            const isLongForm = unitInfo?.["long-form"] === true;

                            let displayValue;

                            if (isLongForm) {
                              displayValue = `${count}*${toBase}`;
                            } else if (
                              ["liter", "cl", "gramm", "kg"].includes(
                                unitInfo?.unit
                              )
                            ) {
                              const value = count * toBase;
                              displayValue =
                                value % 1 === 0 ? value : value.toFixed(2);
                            } else {
                              displayValue = Math.round(count * toBase);
                            }

                            return (
                              <span key={idx}>
                                {idx > 0 && " + "}
                                {displayValue}
                              </span>
                            );
                          })
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </div>
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
                          onClick={() => handleBleMeasureClick(subItem)}
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
          onClose={() => setPopupOpen(false)}
          blePopupOpen={blePopupOpen}
          setBlePopupOpen={setBlePopupOpen}
          bleItem={bleItem}
        />
      )}
      {/* BLE PopUp */}
      {blePopupOpen && bleItem && (
        <BleMeasurePopup
          item={bleItem}
          onClose={() => setBlePopupOpen(false)}
          onConfirm={(measuredCl) => handleBleConfirm(measuredCl, bleItem)}
        />
      )}
    </div>
  );
};

export default DoStock;
