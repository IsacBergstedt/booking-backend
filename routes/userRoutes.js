const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

// Hämta alla användare (admin)
router.get('/', protect, getUsers);

// Hämta en specifik användare
router.get('/:id', protect, getUserById);

// Uppdatera användare (admin eller ägaren)
router.put('/:id', protect, updateUser);

// Ta bort användare (endast admin)
router.delete('/:id', protect, deleteUser);

module.exports = router;
