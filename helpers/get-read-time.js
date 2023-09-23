function getReadTime(text) {
  const wordsPerMinute = 4
  const numberOfWords = text.split(/\s/g).length
  return Math.ceil(numberOfWords / wordsPerMinute)
}

module.exports = { getReadTime }
