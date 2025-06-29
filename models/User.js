//Användarens databasstruktur, user model som sparar och hämtyar användare
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,

    },
    password: {
        type: String, 
        required: true,
    },

    role: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User',
    },

});
module.exports = mongoose.model('User', userSchema);