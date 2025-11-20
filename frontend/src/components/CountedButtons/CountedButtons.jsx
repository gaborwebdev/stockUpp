// CountedButtons.jsx
import { useState, useRef } from "react";

export default function CountedButtons({ countedData, onDelete, onReMeasure }) {
  const pressTimerRef = useRef(null);

  const handlePressStart = (idx) => {
    // indítunk egy timeoutot a hosszú lenyomásra
    pressTimerRef.current = setTimeout(() => {
      pressTimerRef.current = null;
      if (typeof onDelete === "function") onDelete(idx); // hosszú lenyomás → törlés
    }, 800); // 800ms threshold
  };

  const handlePressEnd = (idx) => {
    // ha a timer még aktív, akkor rövid kattintás volt: töröljük a timer-t és call re-measure
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
      if (typeof onReMeasure === "function") onReMeasure(idx); // rövid kattintás → újramesélés
    }
  };

  const handlePressCancel = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
      {countedData.map((entry, idx) => {
        const { type, count, convertedValue, toBase, longForm } = entry;

        const displayValue = longForm
          ? `${count}*${toBase}`
          : convertedValue % 1 === 0
          ? convertedValue
          : convertedValue.toFixed(2);

        return (
          <button
            key={idx}
            style={{ padding: "0.2rem 0.4rem", borderRadius: 4 }}
            title="Tap: re-measure / Hold: delete"
            onMouseDown={() => handlePressStart(idx)}
            onMouseUp={() => handlePressEnd(idx)}
            onMouseLeave={handlePressCancel}
            onTouchStart={() => handlePressStart(idx)}
            onTouchEnd={() => handlePressEnd(idx)}
            onTouchCancel={handlePressCancel}
          >
            {displayValue}
          </button>
        );
      })}
    </div>
  );
}
