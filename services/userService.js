const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET Not set');
const JWT_EXPIRES_IN = '1h';

async function createUser({ name, email, password }) {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, password: hashed });
  return user;
}

async function findByEmail(email) {
  return User.findOne({ email }).select('+password');
}

async function findById(id) {
  return User.findById(id);
}

async function findByIdWithPassword(id) {
  return User.findById(id).select('+password');
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

async function setPassword(id, plain) {
  const hashed = await bcrypt.hash(plain, SALT_ROUNDS);
  return User.findByIdAndUpdate(id, { password: hashed }, { new: true });
}

async function updateUser(id, data) {
  const update = {};
  if (typeof data.name === 'string' && data.name.trim() !== '') update.name = data.name;
  if (typeof data.email === 'string' && data.email.trim() !== '') update.email = data.email;
  return User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
}

function generateToken(user) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  findByIdWithPassword,
  comparePassword,
  setPassword,
  updateUser,
  generateToken,
};