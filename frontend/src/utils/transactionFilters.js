export function applyTransactionFilters(transactions, filters) {
  const {
    search = "",
    category = "All",
    minAmount,
    maxAmount,
    startDate,
    endDate,
    sortBy = "date",
    sortDirection = "desc",
  } = filters;

  let filtered = [...transactions];

  // 🔍 Keyword Search
  if (search) {
    const normalizedSearch = search.toLowerCase();
    filtered = filtered.filter((t) =>
      t.description.toLowerCase().includes(normalizedSearch),
    );
  }

  // 🏷 Category Filter
  if (category !== "All") {
    filtered = filtered.filter((t) => t.category === category);
  }

  // 💰 Amount Range
  if (minAmount !== undefined && minAmount !== "") {
    const min = parseFloat(minAmount);
    filtered = filtered.filter((t) => t.amount >= min);
  }

  if (maxAmount !== undefined && maxAmount !== "") {
    const max = parseFloat(maxAmount);
    filtered = filtered.filter((t) => t.amount <= max);
  }

  // 📅 Date Range
  if (startDate) {
    const start = new Date(startDate).getTime();
    filtered = filtered.filter((t) => new Date(t.date).getTime() >= start);
  }

  if (endDate) {
    const end = new Date(endDate).getTime();
    filtered = filtered.filter((t) => new Date(t.date).getTime() <= end);
  }

  // 🔄 Sorting
  filtered.sort((a, b) => {
    if (sortBy === "amount") {
      return sortDirection === "asc"
        ? a.amount - b.amount
        : b.amount - a.amount;
    }

    if (sortBy === "date") {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();

      return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
    }

    return 0;
  });

  return filtered;
}
