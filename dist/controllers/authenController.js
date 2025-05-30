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
exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    try {
        const existing = yield User_1.default.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            res.status(400).json({ msg: 'User already exists' });
            return;
        }
        const hashed = yield bcryptjs_1.default.hash(password, 10);
        const user = new User_1.default({ username, email, password: hashed });
        yield user.save();
        res.status(201).json({ msg: 'User registered' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ msg: 'Invalid credentials' });
            return;
        }
        const match = yield bcryptjs_1.default.compare(password, user.password);
        if (!match) {
            res.status(400).json({ msg: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.login = login;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.user.id).select('-password');
        if (!user) {
            res.status(404).json({ msg: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield User_1.default.findByIdAndUpdate(req.user.id, { $set: req.body }, { new: true }).select('-password');
        if (!updated) {
            res.status(404).json({ msg: 'User not found' });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.updateProfile = updateProfile;
