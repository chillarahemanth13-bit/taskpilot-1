import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

const PRIORITY_COLORS = {
  Low: "#10B981",
  Medium: "#F59E0B",
  High: "#EF4444",
};

const CustomBarChart = ({ data }) => {
  const totalCount = (data || []).reduce(
    (acc, curr) => acc + (curr.count || 0),
    0
  );

  if (!data || data.length === 0 || totalCount === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No task priority data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 15, right: 20, left: -20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis
          dataKey="priority"
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <Tooltip
          formatter={(value) => [`${value} tasks`, "Count"]}
          contentStyle={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={45}>
          {data.map((entry, index) => (
            <Cell
              key={`bar-${index}`}
              fill={PRIORITY_COLORS[entry.priority] || "#3B82F6"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CustomBarChart;
