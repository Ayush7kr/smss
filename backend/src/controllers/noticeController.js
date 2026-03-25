const mongoose = require('mongoose');
const NoticeSchema = require('../models/Notice');

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private (All Roles in Tenant)
const getNotices = async (req, res) => {
  try {
    const Notice = req.tenantDb.model('Notice', NoticeSchema);
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    console.error('Fetch Notices Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Private (Society Admin only)
const createNotice = async (req, res) => {
  try {
    if (req.user.role !== 'Society_Admin') {
       return res.status(403).json({ message: 'Only Society Admins can post notices.' });
    }

    const Notice = req.tenantDb.model('Notice', NoticeSchema);
    const newNotice = await Notice.create({
      title: req.body.title,
      content: req.body.content,
      author: req.user.userId,
      authorName: req.body.authorName || 'Society Admin'
    });

    res.status(201).json(newNotice);
  } catch (error) {
    console.error('Create Notice Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Society Admin only)
const deleteNotice = async (req, res) => {
  try {
    if (req.user.role !== 'Society_Admin') {
       return res.status(403).json({ message: 'Only Society Admins can delete notices.' });
    }

    const Notice = req.tenantDb.model('Notice', NoticeSchema);
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    await notice.deleteOne();
    res.json({ message: 'Notice removed' });
  } catch (error) {
    console.error('Delete Notice Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getNotices,
  createNotice,
  deleteNotice
};
