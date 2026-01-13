import React from "react";

const InfoCard = ({ Icon, label, value, color }) => {
  return (
    <div className="flex items-center gap-3 bg-white p-4 rounded-lg">
      {/* COLOR DOT */}
      <div className={`w-2 h-5 ${color} rounded-full`} />

      {/* ICON */}
      {Icon && (
        <Icon className="text-xl text-gray-600" />
      )}

      {/* TEXT */}
      <div>
        <p className="text-sm font-semibold text-gray-900">
          {value}
        </p>
        <p className="text-xs text-gray-500">
          {label}
        </p>
      </div>
    </div>
  );
};

export default InfoCard;
