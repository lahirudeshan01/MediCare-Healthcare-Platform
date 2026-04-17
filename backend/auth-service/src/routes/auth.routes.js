const express = require('express');
const router = express.Router();
const { register, login, validate, getUsers, updateUser, deleteUser, getStats, getPendingDoctors, verifyDoctorAccount, getDoctors } = require('../controllers/auth.controller');
const requireAdmin = require('../middleware/requireAdmin');

router.post('/register', register);
router.post('/login', login);
router.get('/validate', validate);

// Public: browse verified doctors
router.get('/doctors', getDoctors);
router.get('/admin/stats', requireAdmin, getStats);
router.get('/admin/users', requireAdmin, getUsers);
router.patch('/admin/users/:id', requireAdmin, updateUser);
router.delete('/admin/users/:id', requireAdmin, deleteUser);
router.get('/admin/pending-doctors', requireAdmin, getPendingDoctors);
router.patch('/admin/doctors/:id/verify', requireAdmin, verifyDoctorAccount);

module.exports = router;
