const Room = require('../models/Room');
const { client, connectRedis } = require('../redisClient');
const socket = require('../socket');




//Admin kan skapa nytt rum
exports.createRoom = async (req, res) => {
    try {
        await connectRedis(); 

        const { name, capacity, type } = req.body;
        const newRoom = new Room({ name, capacity, type });
        await newRoom.save();

        await client.del('rooms'); 

        const io = socket.getIO();
        io.emit('newRoom', {
            message: 'Nytt rum skapat',
            room: { id: newRoom._id, name: newRoom.name, capacity: newRoom.capacity }
        });

        res.status(201).json({ message: 'Rum skapades', room: newRoom });
    } catch (err) {
        console.error('Fel vid skapande av rum:', err);
        res.status(500).json({ message: 'Fel vid skapande av rum' });
    }
};

// Hämta alla rum (alla användare)
exports.getRooms = async (req, res) => {
  try {
    const cachedRooms = await client.get('rooms');

    if (cachedRooms) {
      console.log('cachade rum')
      return res.status(200).json(JSON.parse(cachedRooms));
    }

    const rooms = await Room.find();

    await client.setEx('rooms', 60, JSON.stringify(rooms));
    console.log('cache-lagrade rum')
    
    res.status(200).json(rooms);

  } catch (err) {
    console.error('Fel vid hämtande av rum:', err);
    res.status(500).json({message: 'kunde inte hämta rum'});
  }
};


// Uppdatera rum (endast Admin)
exports.updateRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const updates = req.body;

    const updatedRoom = await Room.findByIdAndUpdate(roomId, updates, { new: true });

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Rum hittades inte' });
    }

    await client.del('rooms'); //ta bort cache

    res.status(200).json({ message: 'Rum uppdaterat', room: updatedRoom });
  } catch (err) {
    res.status(500).json({ message: 'Kunde inte uppdatera rum' });
  }
};

// Ta bort rum (endast Admin)
exports.deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.id;

    const deletedRoom = await Room.findByIdAndDelete(roomId);

    if (!deletedRoom) {
      return res.status(404).json({ message: 'Rum hittades inte' });
    }

    await client.del('rooms'); //ta bort cache

    res.status(200).json({ message: 'Rum borttaget' });
  } catch (err) {
    res.status(500).json({ message: 'Kunde inte ta bort rum' });
  }
};