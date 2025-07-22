"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPesewasToCedis = exports.convertCedisToPesewas = exports.formatPriceFromPesewas = exports.generateBookingReference = exports.comparePassword = exports.hashPassword = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken = (payload) => {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const options = {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'travel-addict-api'
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret', { issuer: 'travel-addict-api' });
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    return await bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const generateBookingReference = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TA-${year}-${randomNum}`;
};
exports.generateBookingReference = generateBookingReference;
const formatPriceFromPesewas = (pesewas) => {
    const cedis = pesewas / 100;
    return `GH₵ ${cedis.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
exports.formatPriceFromPesewas = formatPriceFromPesewas;
const convertCedisToPesewas = (cedis) => {
    return Math.round(cedis * 100);
};
exports.convertCedisToPesewas = convertCedisToPesewas;
const convertPesewasToCedis = (pesewas) => {
    return pesewas / 100;
};
exports.convertPesewasToCedis = convertPesewasToCedis;
