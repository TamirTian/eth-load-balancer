// getting-started.js
const mongoose = require('mongoose');
const config = require('./config')
mongoose.connect(config.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = new mongoose.Schema({
  number: Number
});

const Model = mongoose.model('current-highest', Schema, 'current-highest');

let number = -1
let savedNumber = -1

function get () {
  return number
}

function set (num) {
  if (num > number) number = num
}

function isOK () {
  return number - savedNumber < 7
}

async function load () {
  const data = await Model.findOne({})
  if (!data) return
  if (data.number > number) {
    savedNumber = number = data.number
  }
}

async function save () {
  if (number === savedNumber) return

  const res = await Model.updateOne({}, { $set: { number } }, { upsert: true })
  savedNumber = number
}

setInterval(save, 3000)
load()

module.exports = {
  get,
  set,
  isOK
}
