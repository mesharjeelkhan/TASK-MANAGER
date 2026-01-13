import React from "react";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white border border-gray-300 shadow-md rounded-lg p-2">
      <p className="text-xs font-semibold text-purple-800">
        {payload[0].name}   {/* ← status */}
      </p>
      <p className="text-sm text-gray-600">
        Count:{" "}
        <span className="font-medium text-gray-900">
          {payload[0].value} {/* ← count */}
        </span>
      </p>
    </div>
  );
};

export default CustomTooltip;
