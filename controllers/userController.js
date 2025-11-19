const User = require('../models/User');

// Hämta alla användare (endast Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Kunde inte hämta användare' });
  }
};

// Hämta specifik användare
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: 'Användare hittades inte' });

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Kunde inte hämta användaren' });
  }
};

// Uppdatera användare (Admin kan uppdatera alla, user bara sig själv)
exports.updateUser = async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Inte behörig att uppdatera denna användare' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: 'Användare hittades inte' });

    res.status(200).json({ message: 'Användare uppdaterad', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Kunde inte uppdatera användaren' });
  }
};

// Ta bort användare (endast Admin)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Endast admin kan ta bort användare' });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'Användare hittades inte' });

    res.status(200).json({ message: 'Användare borttagen' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Kunde inte ta bort användaren' });
  }
};
