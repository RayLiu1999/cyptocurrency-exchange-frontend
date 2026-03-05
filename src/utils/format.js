/**
 * 前端數字格式化工具 (遵循幣安 Binance 標準)
 */

/**
 * 格式化價格 (報價貨幣，如 USD)
 * 規則：始終保留 2 位小數，每三位加逗號
 */
export const formatPrice = (value) => {
  if (value === undefined || value === null || value === "") return "0.00";

  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00";

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * 格式化數量 (基礎貨幣，如 BTC, ETH)
 * 規則：保留 4-6 位小數，根據數值大小自動調整或固定顯示
 */
export const formatQty = (value, decimals = 4) => {
  if (value === undefined || value === null || value === "") return "0.0000";

  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.0000";

  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * 格式化百分比
 * 規則：保留 2 位小數，並加上 % 符號
 */
export const formatPercent = (value) => {
  if (value === undefined || value === null || value === "") return "0.00%";

  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00%";

  const prefix = num > 0 ? "+" : "";
  return `${prefix}${num.toFixed(2)}%`;
};

/**
 * 格式化總額 (Price * Qty)
 * 規則：通常與價格相同，保留 2 位小數
 */
export const formatTotal = (price, qty) => {
  const p = typeof price === "string" ? parseFloat(price) : price;
  const q = typeof qty === "string" ? parseFloat(qty) : qty;

  if (isNaN(p) || isNaN(q)) return "0.00";
  return formatPrice(p * q);
};
