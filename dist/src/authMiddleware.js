"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jwt = require('jsonwebtoken');
const authenticateToken = (req, res, next) => {
    // Still have to improve this middleware to better handle errors in case there is no auth headers.
    const authHeader = req.headers['authorization'];
    const token = authHeader;
    if (token == null) {
        return res.sendStatus(401);
    }
    jwt.verify(token, 'secretPass', (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        console.log('User on auth middleware: ', user);
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
