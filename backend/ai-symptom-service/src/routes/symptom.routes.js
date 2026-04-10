const express = require('express');
const router = express.Router();
const { checkSymptoms } = require('../controllers/symptom.controller');

router.post('/check-symptoms', checkSymptoms);

module.exports = router;
