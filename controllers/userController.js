const userService = require('../services/userService');

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    const existing = await userService.findByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const user = await userService.createUser({ name, email, password });
    const token = userService.generateToken(user);
    return res.status(201).json({ user: user.toJSON(), token });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await userService.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await userService.comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const fullUser = await userService.findById(user._id);
    const token = userService.generateToken(user);
    return res.json({ user: fullUser.toJSON(), token });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, email } = req.body;
    if (email) {
      const existing = await userService.findByEmail(email);
      if (existing && existing._id.toString() !== req.user._id.toString()) {
        return res.status(409).json({ message: 'Email already in use' });
      }
    }
    const updated = await userService.updateUser(req.user._id, { name, email });
    return res.json({ user: updated.toJSON() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await userService.findByIdWithPassword(req.user._id);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const ok = await userService.comparePassword(oldPassword, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid old password' });

    await userService.setPassword(req.user._id, newPassword);
    return res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { signup, login, updateProfile, changePassword };