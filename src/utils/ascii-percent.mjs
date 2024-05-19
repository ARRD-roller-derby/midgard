export function asciiPercent(percentage) {
  const filledLength = Math.round(percentage / 10) // chaque 10% est un caractère rempli
  const emptyLength = 10 - filledLength
  const filledBar = '█'.repeat(filledLength)
  const emptyBar = '░'.repeat(emptyLength)
  return `${filledBar}${emptyBar} ${percentage.toFixed(0)}%`
}
