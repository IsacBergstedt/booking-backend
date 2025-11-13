const Booking = require('../models/Booking');
const Room = require('../models/Room');
const socket = require('../socket');

// Kontroll om rum är ledigt, stoppar överlappande bokningar
async function isRoomAvailable(roomId, startTime, endTime) {
    const overBooked = await Booking.findOne({
        roomId: roomId,
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
    });
    return !overBooked;
}

// Skapar bokning
exports.createBooking = async (req, res) => {
    console.log('auth decoded user:', req.user);
    try {
        const { roomId, startTime, endTime } = req.body;

        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({ message: 'Starttid måste vara före sluttid' });
        }

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Rummet finns inte' });

        const available = await isRoomAvailable(roomId, startTime, endTime);
        if (!available) {
            return res.status(400).json({ message: 'Rummet är redan bokat' });
        }

        const booking = new Booking({
            roomId,
            userId: req.user.userId,
            startTime,
            endTime
        });

        await booking.save();

        
        const io = socket.getIO();
        io.emit('newBooking', { message: 'Bokning skapad', booking });

        res.status(201).json({ message: 'Bokning skapad', booking });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Fel vid bokning' });
    }
};

// Hämta bokningar
exports.getBookings = async (req, res) => {
    try {
        let bookings;

        if (req.user.role === 'Admin') {
            bookings = await Booking.find().populate('roomId').populate('userId');
        } else {
            bookings = await Booking.find({ userId: req.user.userId }).populate('roomId');
        }

        res.status(200).json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Fel vid hämtning av bokningar' });
    }
};

// Uppdatera bokning
exports.updateBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { startTime, endTime } = req.body;

        if (!startTime || !endTime) {
            return res.status(400).json({ message: 'Starttid och sluttid krävs' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Bokning hittades ej' });

        if (req.user.userId !== booking.userId.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Ej behörig att ändra denna bokning' });
        }

        const isAvailable = await isRoomAvailable(booking.roomId, startTime, endTime, booking._id);
        if (!isAvailable) {
            return res.status(400).json({ message: 'Rummet redan bokat under den valda tiden' });
        }

        booking.startTime = startTime;
        booking.endTime = endTime;
        await booking.save();

        const io = socket.getIO();
        io.emit('updateBooking', { message: 'Bokning uppdaterad', booking });

        res.status(200).json({ message: 'Bokning uppdaterad', booking });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Fel vid uppdatering' });
    }
};


// Ta bort bokning
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Bokning hittades inte' });

        if (req.user.userId !== booking.userId.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Ej behörig att ta bort denna bokning' });
        }

        await booking.deleteOne();

        const io = socket.getIO();
        io.emit('deleteBooking', { message: 'Bokning borttagen', booking });

        res.status(200).json({ message: 'Bokning borttagen' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Fel vid borttagning' });
    }
};
