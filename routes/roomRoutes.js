const express = require('express');
const router = express.Router();
const {
    createRoom,
    getRooms,
    updateRoom,
    deleteRoom
} = require('../controllers/roomController');

const { protect, adminOnly } = require('../middleware/authMiddleware');


// Routs
router.post('/', protect, adminOnly, createRoom); 
router.get('/', protect, getRooms); 
router.put('/:id', protect, adminOnly, updateRoom); 
router.delete('/:id', protect, adminOnly, deleteRoom); 

module.exports = router;