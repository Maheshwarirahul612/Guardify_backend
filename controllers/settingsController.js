const Settings = require('../models/Settings');

// Get user settings
exports.getSettings = async (req, res) => {
  const { userId } = req.params;
  try {
    const settings = await Settings.findOne({ userId });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Save or update settings
exports.saveSettings = async (req, res) => {
  const { userId } = req.params;
  const newSettings = req.body;
  try {
    const updated = await Settings.findOneAndUpdate(
      { userId },
      { $set: newSettings },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reset to default
exports.resetSettings = async (req, res) => {
  const { userId } = req.params;
  try {
    const resetData = {
      isDarkMode: false,
      notificationsEnabled: true,
      language: 'en',
      profilePrivate: false,
      autoUpdate: true,
      securityAlert: 'email',
      accentColor: 'indigo',
      profilePic: '',
    };

    const result = await Settings.findOneAndUpdate(
      { userId },
      { $set: resetData },
      { new: true }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete account settings
exports.deleteSettings = async (req, res) => {
  const { userId } = req.params;
  try {
    await Settings.findOneAndDelete({ userId });
    res.json({ message: 'Account settings deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
