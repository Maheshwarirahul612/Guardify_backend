const express = require('express');
const router = express.Router();
const {
  getSettings,
  saveSettings,
  resetSettings,
  deleteSettings
} = require('../controllers/settingsController');

router.get('/:userId', getSettings);
router.post('/:userId', saveSettings);
router.put('/:userId/reset', resetSettings);
router.delete('/:userId', deleteSettings);

module.exports = router;
