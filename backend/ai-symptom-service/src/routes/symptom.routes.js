const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { checkSymptoms } = require('../controllers/symptom.controller');

router.post('/check-symptoms', verifyToken, checkSymptoms);

module.exports = router;
