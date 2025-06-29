const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },

    type: {
        type: String,
        enum: ['workspace', 'conference'],
        required: true
    }

});


module.exports = mongoose.model('Room', roomSchema);