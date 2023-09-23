function questionDifficulty(percent) {
  if (percent >= 80) return 'très facile'
  if (percent >= 70) return 'facile'
  if (percent >= 60) return 'normal'
  if (percent >= 50) return 'assez difficile'
  if (percent >= 30) return 'difficile'
  return 'très difficile'
}

module.exports = { questionDifficulty }
