import "../../App.css";
import CountPopUp from "../../components/CountPopUp/CountPopUp";
import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import stockData from "../../stockListData.json";

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

  // 🔧 "Számolva" rész formázó függvény
  const renderCountedDisplay = (item, counted) => {
    return counted
      .map((entry) => {
        const { type, count } = entry;
        const config = item.measurementType[type];
        const toBase = config?.toBase ?? 1;
        const showMultiplier = config?.["showMultiplier"] ?? false;

        // 1️⃣ Rekeszes / csomagos megjelenítés (pl. 2*24)
        if (showMultiplier) {
          return `${count}*${toBase}`;
        }

        // 2️⃣ cl → liter átváltás (0.01)
        if (toBase < 1) {
          const converted = (count * toBase).toFixed(2);
          return converted;
        }

        // 3️⃣ pl. 0.5L üveg (liter-alapú kijelzés)
        const converted = (count * toBase).toFixed(2);
        return converted;
      })
      .join(" + ");
  };

  return (
    <div className="App do-stock">
      <div>
        <header className="add-buttons-group do-stock-header">
          <p>New stock</p>
          <Link to="/">
            <button className="add-buttons case">Go Back</button>
          </Link>
        </header>

        {stockData.map((item, index) => (
          <Fragment key={index}>
            <h3>Category: {item.category}</h3>

            {item.items.map((subItem, subIndex) => {
              const countedData = stockCounts[subItem.itemName]?.counted || [];

              return (
                <div className="row-in-stock" key={subIndex}>
                  <div className="item-name-and-counted">
                    <div className="item-name">{subItem.itemName}</div>

                    <div className="counted-pieces">
                      <div className="title">Számolva:</div>
                      <div className="value">
                        {stockCounts[subItem.itemName]?.counted ? (
                          stockCounts[subItem.itemName].counted.map(
                            (entry, idx) => {
                              const unit = entry.type;
                              const count = entry.count;
                              const unitInfo = subItem.measurementType[unit];
                              const toBase = unitInfo?.toBase ?? 1;
                              const isLongForm =
                                unitInfo?.["long-form"] === true;

                              let displayValue;

                              if (isLongForm) {
                                displayValue = `${count}*${toBase}`;
                              } else if (
                                ["liter", "cl", "gramm", "kg"].includes(
                                  unitInfo?.unit
                                )
                              ) {
                                const value = count * toBase;
                                // csak akkor írjuk ki 2 tizedessel, ha nem egész szám
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
                            }
                          )
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

                          // Ellenőrizzük, hogy kell-e tizedes formátum
                          const isDecimalNeeded =
                            subItem.itemGroup === "pálinkák" ||
                            subItem.itemGroup === "rövid italok" ||
                            (subItem.baseUnit === "liter" && total % 1 !== 0);

                          // Ha kell tizedes, toFixed(2), ha nem, akkor egész
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
                    </div>
                  </div>
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>

      {popupOpen && currentItem && (
        <CountPopUp
          itemName={currentItem.itemName}
          maxCount={currentItem.measurementType[currentType].maxCount}
          step={currentItem.measurementType[currentType].step}
          onConfirm={handleConfirm}
          onClose={() => setPopupOpen(false)}
        />
      )}
    </div>
  );
};

export default DoStock;
