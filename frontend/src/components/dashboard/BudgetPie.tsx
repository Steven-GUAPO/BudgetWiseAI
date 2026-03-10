import { PieChart, Pie, ResponsiveContainer, Tooltip } from "recharts";

const income = 3000;
const expenses = 2200;
const remaining = income - expenses;

const isOverBudget = remaining < 0;

// Break down income into "spent" and "remaining" portions
const chartData = isOverBudget
  ? [
      { name: "Income", value: income, fill: "#3b82f6" }, // Blue - what you earned
      { name: "Over Budget", value: Math.abs(remaining), fill: "#ef4444" }, // Red - overspent amount
    ]
  : [
      { name: "Expenses", value: expenses, fill: "#f59e0b" }, // Orange - what you spent
      { name: "Remaining", value: remaining, fill: "#10b981" }, // Green - what's left
    ];

export default function BalanceWidget() {
  const isOverBudget = remaining < 0;

  return (
    <div className="flex justify-center">
      {/* Donut Chart */}
      <div className="w-[200px] h-[200px] relative">
        <ResponsiveContainer className={"relative"} width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={1}
              stroke="none"
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs text-gray-500 font-medium">
            {isOverBudget ? "Over Budget" : "Remaining"}
          </div>
          <div
            className={`text-2xl font-bold ${
              isOverBudget ? "text-red-600" : "text-green-600"
            }`}
          >
            ${Math.abs(remaining).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Custom Legend Column */}
      <div className="space-y-1 self-end mb-3">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex justify-start items-center gap-1"
          >
            <div className="flex items-center">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
            </div>

            <span className="text-sm font-semibold text-left text-gray-800">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
