import pkg from 'mongoose'
const { Schema, model, models } = pkg

const Answer = new Schema({
  type: String,
  answer: String,
})

export const Questions =
  models.questions ||
  model(
    'questions',
    new Schema({
      question: String,
      status: String,
      answers: [Answer],
      img: String,
    })
  )
