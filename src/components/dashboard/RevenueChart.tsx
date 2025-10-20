import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

interface RevenueChartProps {
  data: { month: string; revenue: number }[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">
        Revenus mensuels
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#3b82f6" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
