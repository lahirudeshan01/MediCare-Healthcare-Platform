const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Prevent self-registration as admin
    const allowedRoles = ['patient', 'doctor'];
    const assignedRole = allowedRoles.includes(role) ? role : 'patient';

    // Doctors start unverified — admin must approve before they can log in
    const isVerified = assignedRole !== 'doctor';

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
      isVerified,
    });

    // Doctors cannot get a token until admin verifies them
    if (assignedRole === 'doctor') {
      return res.status(201).json({
        pendingVerification: true,
        message: 'Registration submitted. Your account is pending admin approval. You will be able to log in once verified.',
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
    }

    if (user.role === 'doctor' && user.isVerified === false) {
      return res.status(403).json({ message: 'Your account is pending admin verification. Please wait for approval.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const validate = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      id: decoded.id,
      role: decoded.role,
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Admin: list all users
const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Admin: update user (activate/deactivate)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (req.user.id === id) {
      return res.status(400).json({ message: 'Cannot modify your own account.' });
    }
    const updates = {};
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Admin: delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id === id) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Admin: platform stats
const getStats = async (req, res) => {
  try {
    const [total, patients, doctors, admins, active] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isActive: true }),
    ]);
    res.json({ total, patients, doctors, admins, active, inactive: total - active });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Admin: list unverified (pending) doctors
const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isVerified: false })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Admin: approve or reject a pending doctor
const verifyDoctorAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: "action must be 'approve' or 'reject'" });
    }
    if (action === 'reject') {
      await User.findByIdAndDelete(id);
      return res.json({ message: 'Doctor registration rejected and removed.' });
    }
    const user = await User.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'Doctor approved.', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Public: list verified doctors for patient browse
const getDoctors = async (req, res) => {
  try {
    const filter = { role: 'doctor', isVerified: true, isActive: true };
    if (req.query.specialization) {
      filter.specialization = { $regex: req.query.specialization, $options: 'i' };
    }
    const doctors = await User.find(filter)
      .select('name email specialization consultationFee')
      .sort({ name: 1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

module.exports = { register, login, validate, getUsers, updateUser, deleteUser, getStats, getPendingDoctors, verifyDoctorAccount, getDoctors };
