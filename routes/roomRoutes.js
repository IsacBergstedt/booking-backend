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
router.post('/', protect, adminOnly, createRoom); //Skapa nytt rum
router.get('/', protect, getRooms); //Hämta alla rum
router.put('/:id', protect, adminOnly, updateRoom); //Uppdatera rum
router.delete('/:id', protect, adminOnly, deleteRoom); //Ta bort rum

module.exports = router;