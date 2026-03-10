import React from "react";

interface TransactionsWidgetProps {
  width: string | number;
}

const TransactionsWidget = ({
  width,
}: TransactionsWidgetProps): React.ReactElement => {
  const transactions = [
    {
      name: "Starbucks",
      date: "2026-02-01",
      amount: -6.75,
    },
    {
      name: "Amazon",
      date: "2026-02-02",
      amount: -48.32,
    },
    {
      name: "Paycheck",
      date: "2026-02-03",
      amount: 1200.0,
    },
    {
      name: "Chipotle",
      date: "2026-02-04",
      amount: -14.85,
    },
    {
      name: "Spotify",
      date: "2026-02-05",
      amount: -10.99,
    },
    {
      name: "Rent",
      date: "2026-02-06",
      amount: -950.0,
    },
    {
      name: "Uber",
      date: "2026-02-07",
      amount: -22.4,
    },
    {
      name: "Target",
      date: "2026-02-08",
      amount: -76.18,
    },
    {
      name: "Freelance Payment",
      date: "2026-02-10",
      amount: 350.0,
    },
    {
      name: "Electric Bill",
      date: "2026-02-12",
      amount: -120.55,
    },
  ];

  return (
    <div
      style={{ width }}
      className="recent-transaction-widget relative flex flex-col shadow-lg p-4 rounded-md bg-white"
    >
      {/* Widget Title */}
      <h2 className="widget-title mt-auto relative text-lg font-serifDisplay mb-3">
        Recent Activity
        <span className="absolute left-0 -bottom-0 w-16 h-[0.15px] bg-black"></span>
      </h2>
      <div className="overflow-y-auto scrollbar-hide flex-1 pr-2">
        <div className="recent-transactions-list flex flex-col space-y-3">
          {transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.name + transaction.date}
              className="transaction-item flex items-center justify-between gap-2"
            >
              <div className="transaction-info flex items-center gap-1">
                <div
                  className={`transaction-icon w-6 h-6 rounded-full flex items-center justify-center ${
                    transaction.amount > 0
                      ? "bg-green-100 text-green-500"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {transaction.amount > 0 ? "+" : "-"}
                </div>
                <div className="transaction-details">
                  <p className="transaction-name text-sm font-normal">
                    {transaction.name}
                  </p>
                  <p className="transaction-date text-xs text-gray-500">
                    {new Date(transaction.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <p
                className={`transaction-amount font-bold text-xs ${
                  transaction.amount > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                ${Math.abs(transaction.amount).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
      <a
        href="/transactions"
        className="text-xs mt-auto pt-4 font-medium text-emerald-600 hover:text-emerald-700 transition"
      >
        View all
      </a>
    </div>
  );
};

export default TransactionsWidget;
