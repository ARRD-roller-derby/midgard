export function percent(partial = 0, total = 0) {
  const result = (100 * partial) / total
  return isNaN(result) ? 100 : parseFloat(result.toFixed(2))
}
