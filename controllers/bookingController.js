const Booking = require('../models/Booking');
const Room = require('../models/Room');
const socket = require('../socket')

// Kontroll om rum är ledigt, stoppar överlappande bokningar
async function isRoomAvailable(roomId, startTime, endTime){
    const overBooked = await Booking.findOne({
        roomId: roomId,
        $or: [ 
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
    });

    return !overBooked
}

//Skapar bokning
exports.createBooking = async (req, res) => {
    console.log('auth decoded user:', req.user);
    try {
        const { roomId, startTime, endTime } = req.body;

        // kontroll om bokning är logisk

        if (new Date(startTime) >= new Date (endTime)) {
            return res.status(400).json({ message: 'Starttid måste vara före sluttid '});
        }

        //Kontroll om rum finns
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({message: 'rummet finns inte'})


        //Kontroll om rummet är ledigt
        const available = await isRoomAvailable(roomId, startTime, endTime);
        if(!available) {
            return res.status(400).json({ message: 'rummet är redan bokat'})
        }

        //skapa bokning
        const booking = new Booking({
            roomId,
            userId: req.user.userId,
            startTime,
            endTime
        });

        await booking.save();

        res.status(201).json({message: 'Bookning skapad', booking});

    } catch(err) {
        console.error(err);
        res.status(500).json({message: ' Fel vid bokning'})
    }

};

//Hämta bokningar
exports.getBookings = async (req, res) => {
    try {
        let bookings;

        if (req.user.role === 'Admin') {
            bookings = await Booking.find().populate('roomId').populate('userId');
        } else {
            bookings = await Booking.find({ userId: req.user.userId }).populate('roomId')
        }

        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({message: ' Fel vid hämtning av bokningar'})
    }
};


//Uppdatera bokning, admin och ägare
exports.updateBooking = async (req, res) => {
    try{
        const bookingId = req.params.id;
        const { startTime, endTime } = req.body;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({message: 'Bokning hittades ej'});

        //Kontroll om användare är ägare eller admin
        if (req.user.userId !==booking.userId.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({message: 'Användare ej behörig att ändra denna bokning'});
        }


        //Kontroll om rum är tillängligt för ny tid
        const isAvailable = await isRoomAvailable(booking.roomId, startTime, endTime);
        if (!isAvailable) {
            res.status(400).json({message: 'Rummet redan bokat under den valda tiden'});
        }

        booking.startTime = startTime;
        booking.endTime = endTime; 
        await booking.save();


        res.status(200).json({message: 'bokning uppdaterad', booking });
        } catch (err) {
            res.status(500).json({message: 'fel vid uppdatering'})
    }
};


//Behörig kan ta bort bokning
exports.deleteBooking = async(req, res) =>{
    try{
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({message: 'Bokninghittades inte'});

        if (req.user.userId !== booking.userId.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({message: 'Ej behörig att ta bort denna bokning'});
        }

        await booking.deleteOne();
        res.status(200).json({message: 'Bokning borttagen'});
    } catch (err) {
        res.status(500).json({message: 'fel vid borttagning'});
    }
    
};