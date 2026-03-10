import React from "react";
import BudgetPie from "./BudgetPie";

interface BalanceWidgetProps {
  width: string | number;
}

const BalanceWidget = ({ width }: BalanceWidgetProps): React.ReactElement => {
  return (
    <div
      style={{ width }}
      className="balance-budget-snapshot flex flex-col shadow-lg p-4 rounded-md bg-white"
    >
      {/* Widget Title */}
      <h2 className="widget-title relative text-lg font-serifDisplay mb-3">
        Balances
        <span className="absolute left-0 -bottom-0 w-16 h-[0.15px] bg-black"></span>
      </h2>

      <div className="balance-snapshot flex items-center flex-1">
        {/* Left Side */}
        <div className="left-side-balance-snapshot flex-1 space-y-4 gap-2 flex flex-col">
          <div className="remaining-balance bg-gray-50 border border-gray-100 rounded-md flex items-center justify-between gap-2 p-2">
            <h3>Remaining: </h3>
            <p className="text-blue-500 font-bold text-lg">$800</p>
          </div>
          <div className="income-balance bg-gray-50 border border-gray-100 rounded-md flex items-center justify-between gap-2 p-2">
            <h3>Income: </h3>
            <p className="text-green-500 font-bold text-lg">$3,000</p>
          </div>
          <div className="expenses bg-gray-50 border border-gray-100 rounded-md flex items-center justify-between gap-2 p-2">
            <h3>Expenses:</h3>
            <p className="text-amber-500 font-bold text-lg">$2,200</p>
          </div>
        </div>

        {/* Right Side - Pie Chart */}
        <div className="right-side-pie-chart flex-1 items-center justify-center flex">
          <BudgetPie />
        </div>
      </div>

      {/* View Budget Link */}
      <a
        href="/budget"
        className="text-xs mt-auto pt-4 font-medium text-emerald-600 hover:text-emerald-700 transition"
      >
        View Budget
      </a>
    </div>
  );
};

export default BalanceWidget;
