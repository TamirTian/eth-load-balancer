// getting-started.js
const mongoose = require('mongoose');
const config = require('./config')
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = new mongoose.Schema({
  number: Number
});

const Model = mongoose.model('current-highest', Schema, 'current-highest');

let number = -1
let savedNumber = -1

Model.updateOne({}, { $setOnInsert: { number } }, { upsert: true })

function get () {
  return number
}

function set (num) {
  if (num > number) number = num
}

function isOK () {
  return number - savedNumber < 7
}

async function sync () {
  const model = await Model.findOne({})
  if (!model) return

  savedNumber = model.number

  if (savedNumber > number) {
    number = savedNumber
    return
  }
  if (savedNumber === number) return

  await Model.updateOne({ number: { $lt: number } }, { $set: { number } })
  savedNumber = number
}

setInterval(sync, 3000)

module.exports = {
  get,
  set,
  isOK
}
