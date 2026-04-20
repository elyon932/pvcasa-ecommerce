export function getMaxSelectableQuantity(stock: number) {
  if (!Number.isFinite(stock)) {
    return 1;
  }

  return Math.max(1, Math.floor(stock));
}

export function clampQuantityToStock(quantity: number, stock: number) {
  const maxQuantity = getMaxSelectableQuantity(stock);
  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.min(maxQuantity, Math.max(1, Math.floor(quantity)));
}
