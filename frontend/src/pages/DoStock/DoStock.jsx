// src/pages/DoStock/DoStock.jsx
import "../../App.css";
import { Fragment, useEffect } from "react";
import { Link } from "react-router-dom";

import CountPopUp from "../../components/modals/CountPopUp/CountPopUp.jsx";
import BleMeasurePopup from "../../components/modals/BleMeasurePopUp/BleMeasurePopUp.jsx";
import DebugPopup from "../../components/modals/DebugPopUp/DebugPopUp.jsx";
import StockRowEditor from "../../components/StockRowEditor/StockRowEditor.jsx";

import useStockData from "../../hooks/useStockData.js";
import useModals from "../../hooks/useModals.js";
import { useBle } from "../../context/BleContext";
import BottomNavBar from "../../components/BottomNavBar/BottomNavBar.jsx";

const DoStock = () => {
  // data & edit context
  const {
    stockCounts,
    setStockCounts,
    allGroups,
    selectedGroups,
    setSelectedGroups,
    filteredData,
    currentEdit,
    setCurrentEdit,
    currentItem,
    setCurrentItem,
    currentType,
    setCurrentType,
    handleConfirm,
    handleBleConfirm,
  } = useStockData();

  // modal open/close
  const {
    popupOpen,
    openPopup,
    closePopup,
    blePopupOpen,
    openBlePopup,
    closeBlePopup,
    debugPopupOpen,
    setDebugPopupOpen,
  } = useModals();

  // BLE context (csak a popupokhoz)
  const ble = useBle();

  useEffect(() => {
    document.body.style.overflow =
      popupOpen || blePopupOpen ? "hidden" : "auto";
  }, [popupOpen, blePopupOpen]);

  // request re-measure
  const requestReMeasure = (subItem, idx, entry) => {
    setCurrentEdit({ itemName: subItem.itemName, index: idx });
    if (entry?.type?.startsWith("BLE")) {
      setCurrentItem(subItem);
      setCurrentType(null);
      openBlePopup();
    } else {
      setCurrentItem(subItem);
      setCurrentType(entry?.type ?? null);
      openPopup();
    }
  };

  const requestBleReMeasure = (subItem, idx) => {
    setCurrentEdit({ itemName: subItem.itemName, index: idx });
    setCurrentItem(subItem);
    setCurrentType(null);
    openBlePopup();
  };

  const handleAddMeasurement = (subItem, type) => {
    setCurrentEdit(null);
    setCurrentItem(subItem);
    setCurrentType(type);
    openPopup();
  };

  const handleBleMeasureClick = (subItem) => {
    setCurrentEdit(null);
    setCurrentItem(subItem);
    setCurrentType(null);
    openBlePopup();
  };

  return (
    <div className="App do-stock">
      <header className="add-buttons-group do-stock-header">
        <p>New stock</p>
        <Link to="/">
          <button className="add-buttons case">Go Back</button>
        </Link>
        {/* A BLE Connect/Disconnect és Debug gombok most a BLE oldalon vannak */}
      </header>

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

      {filteredData.map((cat, catIndex) => {
        const visibleItems = cat.items;
        if (!visibleItems || visibleItems.length === 0) return null;

        return (
          <Fragment key={catIndex}>
            <h3>Category: {cat.category}</h3>
            {visibleItems.map((subItem, subIndex) => {
              const countedData = stockCounts[subItem.itemName]?.counted || [];
              const enrichedData = countedData.map((entry) => {
                const unitInfo = subItem.measurementType?.[entry.type] || {};
                return {
                  ...entry,
                  toBase: unitInfo.toBase ?? 1,
                  longForm: unitInfo["long-form"] || false,
                };
              });

              return (
                <div className="row-in-stock" key={subIndex}>
                  <div className="item-name-and-counted">
                    <div className="item-name">{subItem.itemName}</div>
                    <StockRowEditor
                      countedData={enrichedData}
                      subItem={subItem}
                      setStockCounts={setStockCounts}
                      onRequestReMeasure={(idx) =>
                        requestReMeasure(subItem, idx, enrichedData[idx])
                      }
                      onRequestBleReMeasure={(idx) =>
                        requestBleReMeasure(subItem, idx)
                      }
                    />
                  </div>

                  <div className="left-side-group">
                    <div className="total-in-stock">
                      <div className="total-title">Total:</div>
                      <div className="total-value">
                        {(() => {
                          const itemData = stockCounts[subItem.itemName];
                          const total =
                            itemData?.total ?? subItem.itemOnStock ?? 0;
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
                        Object.keys(subItem.measurementType).map((type) => (
                          <div key={type}>
                            <button
                              className="add-buttons bottle"
                              onClick={() =>
                                handleAddMeasurement(subItem, type)
                              }
                            >
                              {type}
                            </button>
                          </div>
                        ))}

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

      {popupOpen && currentItem && (
        <CountPopUp
          itemName={currentItem.itemName}
          maxCount={currentItem.measurementType?.[currentType]?.maxCount ?? 10}
          step={currentItem.measurementType?.[currentType]?.step ?? 1}
          onConfirm={(count) => {
            handleConfirm(count);
            closePopup();
            setCurrentEdit(null);
          }}
          onClose={() => {
            closePopup();
            setCurrentEdit(null);
            setCurrentItem(null);
            setCurrentType(null);
          }}
        />
      )}

      {blePopupOpen && currentItem && (
        <BleMeasurePopup
          item={currentItem}
          ble={ble} // a contextből jön
          onClose={() => {
            closeBlePopup();
            setCurrentEdit(null);
            setCurrentItem(null);
            setCurrentType(null);
          }}
          onConfirm={(measuredCl) => {
            handleBleConfirm(measuredCl);
            closeBlePopup();
            setCurrentEdit(null);
            setCurrentItem(null);
            setCurrentType(null);
          }}
        />
      )}

      {debugPopupOpen && (
        <DebugPopup onClose={() => setDebugPopupOpen(false)} />
      )}

      <BottomNavBar />
    </div>
  );
};

export default DoStock;
