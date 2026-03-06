export const formatCurrency = (
  amount: number,
  locale: string = "en-US",
  currency: string = "USD",
  maximumFractionDigits: number = 0,
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(amount);
};
