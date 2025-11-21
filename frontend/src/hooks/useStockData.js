// hooks/useStockData.js
import { useState, useMemo } from "react";
import stockData from "../data/stockListData.json";

export default function useStockData() {
  // 1) stockCounts
  const [stockCounts, setStockCounts] = useState(() => {
    const initial = {};
    stockData.forEach((cat) => {
      cat.items.forEach((item) => {
        initial[item.itemName] = {};
      });
    });
    return initial;
  });

  // 2) Edit context
  const [currentEdit, setCurrentEdit] = useState(null);

  // 3) Italcsoportok
  const allGroups = useMemo(() => {
    return [
      ...new Set(
        stockData.flatMap((cat) => cat.items.map((i) => i.itemGroup))
      ),
    ];
  }, []);

  const [selectedGroups, setSelectedGroups] = useState([]);

  // 4) Szűrt adatok
  const filteredData = useMemo(() => {
    return stockData.map((cat) => ({
      ...cat,
      items:
        selectedGroups.length === 0
          ? cat.items
          : cat.items.filter((i) => selectedGroups.includes(i.itemGroup)),
    }));
  }, [selectedGroups]);

  // 5) Normál popup Confirm logika
  const handleConfirm = (currentItem, currentType, currentEdit, count) => {
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

      // Replace or append
      if (
        currentEdit &&
        currentEdit.itemName === itemName &&
        Number.isFinite(currentEdit.index)
      ) {
        prevCounted[currentEdit.index] = {
          type: currentType,
          count,
          convertedValue,
        };
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
  };

  return {
    stockCounts,
    setStockCounts,

    currentEdit,
    setCurrentEdit,

    allGroups,
    selectedGroups,
    setSelectedGroups,

    filteredData,

    handleConfirm,
  };
}
