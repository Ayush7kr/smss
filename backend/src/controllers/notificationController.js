const NotificationSchema = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const Notification = req.tenantDb.model('Notification', NotificationSchema);
    const notifications = await Notification.find({ recipient: req.user.userId })
        .sort({ createdAt: -1 })
        .limit(50);
        
    res.json(notifications);
  } catch (error) {
    console.error('getNotifications Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const Notification = req.tenantDb.model('Notification', NotificationSchema);
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user.userId },
        { read: true },
        { new: true }
    );
    
    if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('markAsRead Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const Notification = req.tenantDb.model('Notification', NotificationSchema);
    await Notification.updateMany(
        { recipient: req.user.userId, read: false },
        { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('markAllAsRead Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
