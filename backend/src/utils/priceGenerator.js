export const nextPrice = (price) => {
  if (!Number.isFinite(price) || price <= 0) return 0.01;
  const movement = (Math.random() - 0.5) * 0.004;
  return Number(Math.max(0.01, price * (1 + movement)).toFixed(2));
};