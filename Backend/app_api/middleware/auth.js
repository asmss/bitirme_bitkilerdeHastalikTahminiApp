const jwt = require('jsonwebtoken');
const User = require("../model/user");

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Bu işlem için giriş yapmalısınız' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizlisifre123');

        req.user = await User.findById(decoded.id);

        next(); 
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Geçersiz token' });
    }
};