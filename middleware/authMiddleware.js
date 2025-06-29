// kollar jwt token

const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({message: 'Ingen token'})
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (err) {
        return res.status(401).json({message: 'ogiltig token'})
    }

};

//Admin access
exports.adminOnly = (req, res, next) => {
    if (req.user.role !=='Admin') {
        return res.status(403).json({message: 'Endast admin har åtkomst'});
    }
    next();
};