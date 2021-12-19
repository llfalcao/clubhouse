require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const users = require('./users.json');
const messages = require('./messages.json');

const User = require('../models/User');
const Message = require('../models/Message');
const { create } = require('../models/User');

const mongodb = process.env.MONGODB_URL;
mongoose.connect(mongodb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

async function hashPassword(password) {
  const hash = await new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });

  return hash;
}

(async () => {
  const savedUsers = [];

  for await (let user of users) {
    user.password = await hashPassword(user.password);
    user = new User(user);
    await user.save();
    savedUsers.push(user);
    console.log('New user: ', user);
  }

  for await (let msg of messages) {
    msg = new Message({
      ...msg,
      timestamp: new Date(),
      author: savedUsers[messages.indexOf(msg) % 5]._id,
    });
    await msg.save();
    console.log('New message: ', msg);
  }

  mongoose.connection.close();
})();
