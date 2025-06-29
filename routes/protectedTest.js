const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware')

//Skyddad rutt för inloggade användare
router.get('/user-data', protect, (req, res) => {
    res.json({ message: `Välkommen användare: ${req.user.userId}` });
});

//Admin only rutt
router.get('/admin-data', protect, adminOnly, (req, res) => {
    res.json({message: 'Endast admin access'});
});

module.exports = router;