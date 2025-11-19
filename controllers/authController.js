//logik för att registrera och logga in användare, kryptering, 
// kontroll av lösen och skapande av JWT-token, socket.io


const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const socket = require('../socket');

// Registrera ny användare
exports.register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Kontroll om användare redan finns
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Användarnamnet är upptaget' });
        }

        // Kryptera lösenord
        const hashedPassword = await bcrypt.hash(password, 10);

        // Skapa användare
        const newUser = new User({
            username,
            password: hashedPassword,
            role: role || 'User',
        });

        await newUser.save();


        res.status(201).json({ message: 'Registrering lyckades' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Serverfel vid registrering' });
    }
};

// Logga in användare
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Hitta användaren
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Fel användarnamn eller lösenord' });
        }

        // Verifiera lösenord
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Fel användarnamn eller lösenord' });
        }

        // Skapa JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '6h' }
        );

        // Skicka token och användarinfo som svar
        res.status(200).json({
            message: 'Inloggning lyckades',
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Serverfel vid inloggning' });
    }
};
