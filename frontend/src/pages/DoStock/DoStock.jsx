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
import useBleMeasure from "../../hooks/useBleMeasure.js";

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

  // prevent scroll when popups are open
  useEffect(() => {
    document.body.style.overflow = popupOpen || blePopupOpen ? "hidden" : "auto";
  }, [popupOpen, blePopupOpen]);

  // BLE hook
  const ble = useBleMeasure();

  // request re-measure for counted entries
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
        <button className="debug-button" onClick={() => setDebugPopupOpen(true)}>
          BLE Debug
        </button>
      </header>

      {/* Group filters */}
      <div className="group-filters">
        {allGroups.map((group) => (
          <button
            key={group}
            className={selectedGroups.includes(group) ? "active" : ""}
            onClick={() =>
              setSelectedGroups((prev) =>
                prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
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

      {/* Stock list */}
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
                      onRequestBleReMeasure={(idx) => requestBleReMeasure(subItem, idx)}
                    />
                  </div>

                  <div className="left-side-group">
                    <div className="total-in-stock">
                      <div className="total-title">Total:</div>
                      <div className="total-value">
                        {(() => {
                          const itemData = stockCounts[subItem.itemName];
                          const total = itemData?.total ?? subItem.itemOnStock ?? 0;
                          const isDecimalNeeded =
                            subItem.itemGroup === "pálinkák" ||
                            subItem.itemGroup === "rövid italok" ||
                            (subItem.baseUnit === "liter" && total % 1 !== 0);
                          return isDecimalNeeded ? total.toFixed(2) : Math.round(total);
                        })()}
                      </div>
                    </div>

                    <div className="add-buttons-group">
                      {subItem.measurementType &&
                        Object.keys(subItem.measurementType).map((type) => (
                          <div key={type}>
                            <button
                              className="add-buttons bottle"
                              onClick={() => handleAddMeasurement(subItem, type)}
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

      {/* CountPopUp */}
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

      {/* BLE Popup */}
      {blePopupOpen && currentItem && ble && (
        <BleMeasurePopup
          item={currentItem}
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
          ble={ble}
        />
      )}

      {/* Debug Popup */}
      {debugPopupOpen && <DebugPopup onClose={() => setDebugPopupOpen(false)} />}
    </div>
  );
};

export default DoStock;
