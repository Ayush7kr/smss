const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { getFeed, createPost, toggleLikePost, addComment, createPoll, votePoll } = require('../controllers/feedController');

router.use(protect, tenantMiddleware);

router.route('/')
  .get(getFeed)
  .post(createPost);

router.post('/:id/like', toggleLikePost);
router.post('/:id/comments', addComment);

router.post('/polls', createPoll);
router.post('/polls/:id/vote/:optionId', votePoll);

module.exports = router;
