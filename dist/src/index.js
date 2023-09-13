"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const authMiddleware_1 = require("./authMiddleware");
const jwt = require('jsonwebtoken');
const prisma = new client_1.PrismaClient();
//For env File 
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.SERVER_PORT || 8000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post('/api/user/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('REQUEST BODY ON API/REGISTER: ', req.body);
    try {
        const existingUser = yield prisma.users.findUnique({
            where: {
                email: req.body.email,
            },
        });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use." });
        }
        else {
            const user = yield prisma.users.create({
                data: {
                    email: req.body.email,
                    firstname: req.body.firstName,
                    lastname: req.body.lastName,
                    password: req.body.password
                }
            });
            res.status(200).json({ message: "user created successfully." });
        }
    }
    catch (error) {
        console.error('Error creating user: ', error);
        res.status(500).json({ message: "could not create the user." });
    }
}));
app.post('/api/user/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('REQUEST BODY ON API/LOGIN: ', req.body);
    try {
        const user = yield prisma.users.findUnique({
            where: { email: req.body.email, password: req.body.password },
        });
        if (user) {
            const token = jwt.sign({
                name: user.firstname,
                email: user.email
            }, 'secretPass');
            res.json({ status: 'ok', token: token });
        }
        else {
            throw new Error;
        }
    }
    catch (Error) {
        res.json({ status: 'error', message: 'Could not login.' });
    }
}));
app.post('/api/todos/create', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        console.log('REQ.BODY.DESCRIPTION: ', req.body.description);
        const todo = yield prisma.tasks.create({
            data: {
                description: req.body.description,
                done: req.body.done,
                priority: req.body.priority,
                user_email: user.email
            }
        });
        res.json({ status: 'ok', message: 'Todo created.', todo: todo });
    }
    catch (Error) {
        console.error("Error while creating a todo: ", Error);
        res.json({ status: 'error', message: 'Could not create the todo.' });
    }
}));
app.get('/api/todos/getTodos', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const todos = yield prisma.tasks.findMany({
            where: { user_email: user.email }
        });
        res.json({ status: 'ok', todos: todos });
    }
    catch (Error) {
        console.error(Error);
        res.json({ status: 'error', message: 'Could not get the todos.' });
    }
}));
app.put('/api/todos/editTodo', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('REQ.BODY ON EDIT TODO: ', req.body);
    try {
        const user = req.user;
        const editedTodoId = req.query.id;
        console.log('EDITEDTODOID: ', editedTodoId);
        const editedTodo = yield prisma.tasks.update({
            where: { task_id: Number(editedTodoId), user_email: user.email },
            data: { description: req.body.description, done: req.body.done, priority: req.body.priority }
        });
        res.json({ status: 'ok', message: 'Edit done successfully.', todo: editedTodo });
    }
    catch (Error) {
        console.error(Error);
        res.json({ status: 'error', message: "Could not edit the todo." });
    }
}));
app.delete('/api/todos/delete', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const deletedTaskId = req.query.id;
        const deletedTodo = yield prisma.tasks.delete({
            where: { task_id: Number(deletedTaskId), user_email: user.email }
        });
        res.json({ status: 'ok', message: 'Todo deleted successfully.' });
    }
    catch (Error) {
        res.json({ status: 'error', message: "Could not delete the todo." });
    }
}));
app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});
// https://dev.to/cristain/how-to-set-up-typescript-with-nodejs-and-express-2023-gf
