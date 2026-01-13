import React from "react";

const CustomLegend = ({ payload = [] }) => {
  if (!payload.length) return null;

  return (
    <div className="flex justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div
          key={`legend-${index}`}
          className="flex items-center gap-2"
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-medium text-gray-700">
            {entry.value} {/* ← status */}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CustomLegend;
