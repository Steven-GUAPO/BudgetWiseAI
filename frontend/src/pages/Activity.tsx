import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import transactionService, { Transaction } from '../services/transaction.service';
import { useNotifications } from '../context/NotificationContext';

const CATEGORIES = ['All', 'Shopping', 'Food', 'Utilities', 'Entertainment', 'Transportation', 'Healthcare', 'Education', 'Income', 'Other'];
import React, { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import transactionService, {
  Transaction,
} from "../services/transaction.service";
import DateInput from "components/transactions/DateInput";
import { applyTransactionFilters } from "utils/transactionFilters";

const CATEGORIES = [
  "All",
  "Shopping",
  "Food",
  "Utilities",
  "Entertainment",
  "Transportation",
  "Healthcare",
  "Education",
  "Income",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Shopping: "#6366f1",
  Food: "#f59e0b",
  Utilities: "#3b82f6",
  Entertainment: "#8b5cf6",
  Transportation: "#10b981",
  Healthcare: "#ef4444",
  Education: "#06b6d4",
  Income: "#22c55e",
  Other: "#6b7280",
};

const Activity: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
    // Auto Sync in background
    api.post("/bank/sync").catch(() => {});
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getTransactions();
      setTransactions(data);
    } catch {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return applyTransactionFilters(transactions, {
      search,
      category,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      sortBy,
      sortDirection,
    });
  }, [
    transactions,
    search,
    category,
    minAmount,
    maxAmount,
    startDate,
    endDate,
    sortBy,
    sortDirection,
  ]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post("/bank/sync");
      await fetchTransactions();
    } catch (e: any) {
      setError(
        e.response?.data?.detail ||
          "Sync failed — make sure your bank is connected",
      );
    } finally {
      setSyncing(false);
    }
  };

  const totalIncome = filteredTransactions
    .filter((t) => t.transaction_type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions
    .filter((t) => t.transaction_type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const onMinAmountChange = (value: string) => {
    if (value === "" || Number(value) >= 0) {
      if (maxAmount !== "" && Number(value) > Number(maxAmount)) {
        let newValue = Number(maxAmount) - 1;
        setMinAmount(newValue.toString());
      } else {
        setMinAmount(value);
      }
    }
  };

  const onMaxAmountChange = (value: string) => {
    if (value === "" || Number(value) >= 0) {
      if (minAmount !== "" && Number(value) < Number(minAmount)) {
        let newValue = Number(minAmount) + 1;
        setMaxAmount(newValue.toString());
      } else {
        setMaxAmount(value);
      }
    }
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "50vh",
        }}
      >
        <div style={{ color: "#666", fontSize: "16px" }}>
          Loading transactions...
        </div>
      </div>
    );

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1
            style={{
              color: "#fff",
              fontSize: "28px",
              fontWeight: "700",
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            Activity
          </h1>
          <p style={{ color: "#666", margin: "4px 0 0 0", fontSize: "14px" }}>
            {filteredTransactions.length}{" "}
            {filteredTransactions.length === 1 ? "transaction" : "transactions"}
          </p>
        </div>
      </div>
      {error && (
        <div
          style={{
            backgroundColor: "rgba(239,68,68,0.1)",
            color: "#ef4444",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            label: "Total Income",
            value: `+$${totalIncome.toFixed(2)}`,
            color: "#22c55e",
          },
          {
            label: "Total Expenses",
            value: `-$${totalExpenses.toFixed(2)}`,
            color: "#ef4444",
          },
          {
            label: "Net",
            value: `$${(totalIncome - totalExpenses).toFixed(2)}`,
            color: totalIncome - totalExpenses >= 0 ? "#22c55e" : "#ef4444",
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              backgroundColor: "#0a110e",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p style={{ color: "#666", fontSize: "13px", margin: "0 0 8px 0" }}>
              {card.label}
            </p>
            <p
              style={{
                color: card.color,
                fontSize: "22px",
                fontWeight: "700",
                margin: 0,
              }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="text-white bg-transparent shadow-sm rounded-lg p-3 mb-3">
        <h3 className="font-serifBody font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Search..."
            className="border px-2 py-1 rounded-md text-sm bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border px-2 py-1 rounded-md text-sm bg-transparent text-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option className="bg-black text-white" key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex items-center border rounded-md px-2 py-1 text-sm bg-transparent">
            <span className="text-white mr-1">$</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              className="bg-transparent outline-none w-full"
              value={minAmount}
              onChange={(e) => onMinAmountChange(e.target.value)}
            />
          </div>

          <div className="flex items-center border rounded-md px-2 py-1 text-sm bg-transparent">
            <span className="text-white mr-1">$</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              className="bg-transparent outline-none w-full"
              value={maxAmount}
              onChange={(e) => onMaxAmountChange(e.target.value)}
            />
          </div>

          <DateInput
            onRangeChange={(range) => {
              setStartDate(
                range[0] ? range[0].toISOString().split("T")[0] : "",
              );
              setEndDate(range[1] ? range[1].toISOString().split("T")[0] : "");
            }}
          />
        </div>
      </div>

      {/* Transaction list */}
      <div className="bg-[#0a110e] rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="w-full text-left">
          <thead className="text-xs uppercase tracking-wide border-b border-white/[0.06]">
            <tr>
              <th
                className="px-4 py-3 text-gray-500 cursor-pointer hover:text-gray-300 transition"
                onClick={() => {
                  setSortBy("date");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-1">
                  Date
                  <span className="text-xs">
                    {sortBy === "date" ? (
                      sortDirection === "asc" ? (
                        "↑"
                      ) : (
                        "↓"
                      )
                    ) : (
                      <span className="text-gray-700">↕</span>
                    )}
                  </span>
                </div>
              </th>
              <th className="px-4 py-3 text-gray-500">Merchant</th>
              <th className="px-4 py-3 text-gray-500">Category</th>
              <th
                className="px-4 py-3 text-gray-500 cursor-pointer hover:text-gray-300 transition"
                onClick={() => {
                  setSortBy("amount");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-1">
                  Amount
                  <span className="text-xs">
                    {sortBy === "amount" ? (
                      sortDirection === "asc" ? (
                        "↑"
                      ) : (
                        "↓"
                      )
                    ) : (
                      <span className="text-gray-700">↕</span>
                    )}
                  </span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-16 text-gray-600">
                  <p className="text-base mb-1">No transactions found</p>
                </td>
              </tr>
            ) : (
              filteredTransactions
                .slice(
                  (currentPage - 1) * transactionsPerPage,
                  currentPage * transactionsPerPage,
                )
                .map((txn) => (
                  <tr
                    key={txn.id}
                    className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(txn.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        style={{
                          color: CATEGORY_COLORS[txn.category] || "#6b7280",
                        }}
                        className="text-sm font-medium"
                      >
                        {txn.merchant}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {txn.category}
                    </td>

                    <td
                      className={`px-4 py-3 text-sm font-semibold ${txn.transaction_type === "income" ? "text-green-500" : "text-red-500"}`}
                    >
                      {txn.transaction_type === "income" ? "+" : "-"}$
                      {Math.abs(txn.amount).toFixed(2)}
                    </td>
                  </tr>
                ))
            )}
          </tbody>

          <tfoot>
            <tr>
              <td
                colSpan={4}
                className="text-center py-2 text-xs text-gray-600 border-t border-white/[0.04]"
              >
                {filteredTransactions.length === 0
                  ? "No Results"
                  : `Showing ${(currentPage - 1) * transactionsPerPage + 1} - ${Math.min(currentPage * transactionsPerPage, filteredTransactions.length)} of ${filteredTransactions.length}`}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Pagination */}
        <div className="mb-5">
          {Math.ceil(filteredTransactions.length / transactionsPerPage) > 1 && (
            <div className="flex justify-center items-center gap-1 mt-4">
              <button
                className="px-3 py-1 rounded-md bg-white/[0.06] text-gray-400 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              {(() => {
                const totalPages = Math.ceil(
                  filteredTransactions.length / transactionsPerPage,
                );
                const pages: (number | "...")[] = [];

                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (currentPage > 3) pages.push("...");
                  for (
                    let i = Math.max(2, currentPage - 1);
                    i <= Math.min(totalPages - 1, currentPage + 1);
                    i++
                  ) {
                    pages.push(i);
                  }
                  if (currentPage < totalPages - 2) pages.push("...");
                  pages.push(totalPages);
                }

                return pages.map((page, i) =>
                  page === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-600">
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      className={`px-3 py-1 rounded-md transition ${
                        currentPage === page
                          ? "bg-emerald-500 text-white"
                          : "bg-white/[0.06] text-gray-400 hover:bg-white/10"
                      }`}
                      onClick={() => setCurrentPage(page as number)}
                    >
                      {page}
                    </button>
                  ),
                );
              })()}
              <button
                className="px-3 py-1 rounded-md bg-white/[0.06] text-gray-400 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={
                  currentPage ===
                  Math.ceil(filteredTransactions.length / transactionsPerPage)
                }
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;
