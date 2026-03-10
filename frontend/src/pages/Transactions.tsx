import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import { mockTransactions } from "data/mockTransactions";
import { applyTransactionFilters } from "../utils/transactionFilters";
import DateInput from "components/transactions/DateInput";

export default function TransactionsPage() {
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

  const filteredTransactions = useMemo(() => {
    return applyTransactionFilters(mockTransactions, {
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
    mockTransactions,
    search,
    category,
    minAmount,
    maxAmount,
    startDate,
    endDate,
    sortBy,
    sortDirection,
  ]);

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

  const categories = [
    "All",
    ...new Set(mockTransactions.map((t) => t.category)),
  ];

  return (
    <div className="py-8 px-4 gap-6 flex flex-col">
      {/* Page Header */}
      <div>
        <h1 className="page-title font-serifDisplay text-3xl">Transactions</h1>
      </div>

      {/* Month + Download */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-lg font-serifBody text-gray-500">November</h2>

        <div className="flex gap-3 items-center">
          <button className="font-serifBody bg-white shadow-sm cursor-pointer rounded-lg px-4 py-1 flex gap-1 items-center">
            Download
            <Download className="h-4 w-4" />
          </button>

          <select className="font-serifBody bg-white shadow-sm cursor-pointer rounded-sm p-1">
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="excel">EXCEL</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-4">
        <h3 className="font-serifBody font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Search..."
            className="border px-2 py-1 rounded-md text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border px-2 py-1 rounded-md text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={0}
            placeholder="$ Min"
            className="border px-2 py-1 rounded-md text-sm"
            value={minAmount}
            onChange={(e) => onMinAmountChange(e.target.value)}
          />

          <input
            type="number"
            min={0}
            placeholder="$ Max"
            className="border px-2 py-1 rounded-md text-sm"
            value={maxAmount}
            onChange={(e) => onMaxAmountChange(e.target.value)}
          />

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

      {/* Transactions Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-sm uppercase tracking-wide">
            <tr>
              <th
                className="px-4 py-3 cursor-pointer"
                onClick={() => {
                  setSortBy("date");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                Date
              </th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Category</th>
              <th
                className="px-4 py-3 cursor-pointer"
                onClick={() => {
                  setSortBy("amount");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filteredTransactions
                .slice(
                  (currentPage - 1) * transactionsPerPage,
                  currentPage * transactionsPerPage,
                )
                .map((t) => (
                  <tr
                    key={t.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">{t.date}</td>
                    <td className="px-4 py-3">{t.description}</td>
                    <td className="px-4 py-3">{t.category}</td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        t.type === "expense" ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      ${t.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={4}
                className="text-center py-1 text-sm text-gray-500"
              >
                {filteredTransactions.length === 0
                  ? "No Results"
                  : `Showing ${(currentPage - 1) * transactionsPerPage + 1} - 
                  ${Math.min(currentPage * transactionsPerPage, filteredTransactions.length)} of 
                  ${filteredTransactions.length}`}
              </td>
            </tr>
          </tfoot>
        </table>
        <div className="pagination-buttons mb-5">
          {Math.ceil(filteredTransactions.length / transactionsPerPage) > 1 && (
            <div className="flex justify-center items-center gap-1 mt-4">
              <button
                className="px-3 py-1 rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
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
                  // If there are 7 or fewer pages, show them all
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  // Else if there are more than 7 pages, show first, last, and 3 around current
                  pages.push(1);
                  if (currentPage > 3) pages.push("...");
                  // For loop to add current, one before and one after (if they exist)
                  for (
                    let i = Math.max(2, currentPage - 1);
                    i <= Math.min(totalPages - 1, currentPage + 1);
                    i++
                  ) {
                    pages.push(i);
                  }
                  // Add ellipsis until last page if current page is not within last 3 pages
                  if (currentPage < totalPages - 2) pages.push("...");
                  pages.push(totalPages);
                }

                return pages.map((page, i) =>
                  page === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === page
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                      onClick={() => setCurrentPage(page as number)}
                    >
                      {page}
                    </button>
                  ),
                );
              })()}

              <button
                className="px-3 py-1 rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
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
}
