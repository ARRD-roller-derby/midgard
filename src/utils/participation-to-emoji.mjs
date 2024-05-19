export function participationToEmoji(participation) {
  if (participation.match(/patin/i)) return '⛸️'
  if (participation.match(/officiel/i)) return '🎩'
  if (participation.match(/nso/i)) return '🏁'
  //un sifflet pour les coachs
  if (participation.match(/coach/i)) return '👩‍🏫'

  return '🤷‍♂️'
}
