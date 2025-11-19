const Booking = require('../models/Booking');
const Room = require('../models/Room');
const socket = require('../socket');

// Skapa bokning
exports.createBooking = async (req, res) => {
  try {
    const { roomId, startTime, endTime } = req.body;

    // Kontrollera om rummet finns
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Rummet finns inte' });

    // Dubbelbokningskontroll
    const overlapping = await Booking.findOne({
      roomId,
      $or: [
        { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
        { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } },
        { startTime: { $lte: new Date(startTime) }, endTime: { $gte: new Date(endTime) } }
      ]
    });

    if (overlapping) return res.status(400).json({ message: 'Rummet är redan bokat under denna tid' });

    const booking = new Booking({
      roomId,
      userId: req.user.id || req.user.userId,
      startTime,
      endTime,
    });

    await booking.save();

    // Notifiering via Socket.io
    const io = socket.getIO();
    io.emit('newBooking', { message: 'Ny bokning skapad', booking });

    res.status(201).json({ message: 'Bokning skapad', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Kunde inte skapa bokning' });
  }
};

// Hämta bokningar
exports.getBookings = async (req, res) => {
  try {
    let bookings;
    if (req.user.role === 'Admin') {
      bookings = await Booking.find().populate('roomId').populate('userId');
    } else {
      bookings = await Booking.find({ userId: req.user.id }).populate('roomId');
    }

    res.status(200).json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Kunde inte hämta bokningar' });
  }
};

// Uppdatera bokning (Admin eller skapare)
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Bokning hittades inte' });

    if (req.user.role !== 'Admin' && booking.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Inte behörig att uppdatera bokningen' });

    Object.assign(booking, req.body);
    await booking.save();

    const io = socket.getIO();
    io.emit('updateBooking', { message: 'Bokning uppdaterad', booking });

    res.status(200).json({ message: 'Bokning uppdaterad', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Kunde inte uppdatera bokning' });
  }
};

// Ta bort bokning (Admin eller skapare)
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Bokning hittades inte' });

    if (req.user.role !== 'Admin' && booking.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Inte behörig att ta bort bokningen' });

    await booking.remove();

    const io = socket.getIO();
    io.emit('deleteBooking', { message: 'Bokning borttagen', bookingId: req.params.id });

    res.status(200).json({ message: 'Bokning borttagen' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Kunde inte ta bort bokning' });
  }
};
