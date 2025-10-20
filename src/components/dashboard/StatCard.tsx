import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color = "blue" }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-5 flex flex-col items-center justify-center">
      <p className="text-gray-500">{title}</p>
      <h2 className={`text-3xl font-semibold text-${color}-600`}>{value}</h2>
    </div>
  );
};

export default StatCard;
