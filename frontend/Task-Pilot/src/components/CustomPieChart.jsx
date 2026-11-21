import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CustomPieChart = ({ data, colors = ["#FF6384", "#36A2EB", "#FFCE56"] }) => {
  const totalCount = (data || []).reduce(
    (acc, curr) => acc + (curr.count || 0),
    0
  );

  if (!data || data.length === 0 || totalCount === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No task distribution data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          outerRadius={75}
          innerRadius={45}
          paddingAngle={4}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value} tasks`, "Count"]}
          contentStyle={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomPieChart;
