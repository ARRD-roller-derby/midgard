function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

function shuffle(array, number, duplicate) {
  const newArray = []
  do {
    const randomIndex = getRandomInt(0, array.length),
      newItem = newArray.find((el) => el === array[randomIndex])

    if (!newItem || (newItem && duplicate)) {
      newArray.push(array[randomIndex])
    }
  } while (array.length !== newArray.length)

  if (number <= array.length || duplicate) {
    return newArray.slice(0, number)
  } else {
    return newArray
  }
}

module.exports = { shuffle, getRandomInt }
