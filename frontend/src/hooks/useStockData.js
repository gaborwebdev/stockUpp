// src/hooks/useStockData.js
import { useState, useMemo } from "react";
import stockData from "../data/stockListData.json";

export default function useStockData() {
  // stockCounts: { [itemName]: { baseUnit, total, counted: [{type,count,convertedValue}] } }
  const [stockCounts, setStockCounts] = useState(() => {
    const initial = {};
    stockData.forEach((cat) => {
      cat.items.forEach((item) => {
        initial[item.itemName] = {};
      });
    });
    return initial;
  });

  // groups filter
  const allGroups = useMemo(
    () => [...new Set(stockData.flatMap((cat) => cat.items.map((i) => i.itemGroup)))],
    []
  );
  const [selectedGroups, setSelectedGroups] = useState([]);

  // current edit / context
  const [currentEdit, setCurrentEdit] = useState(null); // { itemName, index } or null
  const [currentItem, setCurrentItem] = useState(null); // full item object or null
  const [currentType, setCurrentType] = useState(null); // string or null

  // filteredData (categories with filtered items)
  const filteredData = useMemo(() => {
    return stockData.map((cat) => ({
      ...cat,
      items:
        selectedGroups.length === 0
          ? cat.items
          : cat.items.filter((i) => selectedGroups.includes(i.itemGroup)),
    }));
  }, [selectedGroups]);

  // handleConfirm from CountPopUp (uses currentItem & currentType from this hook)
  const handleConfirm = (count) => {
    if (!currentItem || !currentType) return;

    const itemName = currentItem.itemName;
    const baseUnit = currentItem.baseUnit || "unit";
    const typeConfig = currentItem.measurementType?.[currentType] || {};
    const convertedValue = count * (typeConfig.toBase ?? 1);

    setStockCounts((prev) => {
      const prevItem = prev[itemName] || {};
      const prevCounted = Array.isArray(prevItem.counted) ? [...prevItem.counted] : [];

      if (currentEdit?.itemName === itemName && Number.isFinite(currentEdit.index)) {
        prevCounted[currentEdit.index] = { type: currentType, count, convertedValue };
      } else {
        prevCounted.push({ type: currentType, count, convertedValue });
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

    // reset edit context
    setCurrentEdit(null);
    setCurrentItem(null);
    setCurrentType(null);
  };

  // BLE confirm: accept measuredCl, use currentItem (or provided item)
  const handleBleConfirm = (measuredCl, itemArg = null) => {
    const item = itemArg ?? currentItem;
    if (!item) return;

    const itemName = item.itemName;
    const shouldSaveInLiter =
      item.itemGroup === "rövid_italok" || item.itemGroup === "pálinkák";
    const baseUnit = shouldSaveInLiter ? "liter" : "cl";
    const convertedValue = shouldSaveInLiter ? measuredCl * 0.01 : measuredCl;

    setStockCounts((prev) => {
      const prevItem = prev[itemName] || {};
      const prevCounted = Array.isArray(prevItem.counted) ? [...prevItem.counted] : [];

      if (currentEdit?.itemName === itemName && Number.isFinite(currentEdit.index)) {
        prevCounted[currentEdit.index] = {
          type: shouldSaveInLiter ? "BLE_liter" : "BLE_cl",
          count: measuredCl,
          convertedValue,
        };
      } else {
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

    // reset edit context
    setCurrentEdit(null);
    setCurrentItem(null);
    setCurrentType(null);
  };

  return {
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
  };
}
