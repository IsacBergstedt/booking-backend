const Room = require('../models/Room');
const redis = require('../redisClient');
const socket = require('../socket');

// Middleware ska kolla att req.user.role === 'Admin'

exports.createRoom = async (req, res) => {
  try {
    const { name, capacity, type } = req.body;

    const newRoom = new Room({ name, capacity, type });
    await newRoom.save();

    await redis.del('rooms'); // ta bort cache

    const io = socket.getIO();
    io.emit('newRoom', { message: 'Nytt rum skapat', room: newRoom });

    res.status(201).json({ message: 'Rum skapades', room: newRoom });
  } catch (err) {
    console.error('Fel vid skapande av rum:', err);
    res.status(500).json({ message: 'Fel vid skapande av rum' });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const cached = await redis.get('rooms');

    if (cached) {
      console.log('Cachade rum');
      return res.status(200).json(JSON.parse(cached));
    }

    const rooms = await Room.find();
    await redis.set('rooms', JSON.stringify(rooms), { ex: 60 }); // 60 sek cache

    console.log('Cache-lagrade rum');
    res.status(200).json(rooms);
  } catch (err) {
    console.error('Fel vid hämtande av rum:', err);
    res.status(500).json({ message: 'Kunde inte hämta rum' });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedRoom) return res.status(404).json({ message: 'Rum hittades inte' });

    await redis.del('rooms');

    const io = socket.getIO();
    io.emit('updateRoom', { message: 'Rum uppdaterat', room: updatedRoom });

    res.status(200).json({ message: 'Rum uppdaterat', room: updatedRoom });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Kunde inte uppdatera rum' });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) return res.status(404).json({ message: 'Rum hittades inte' });

    await redis.del('rooms');

    const io = socket.getIO();
    io.emit('deleteRoom', { message: 'Rum borttaget', roomId: req.params.id });

    res.status(200).json({ message: 'Rum borttaget' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Kunde inte ta bort rum' });
  }
};
