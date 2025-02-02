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
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = void 0;
const prisma_1 = require("../serverconfig/prisma");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: "Enter valid username or password" });
    }
    prisma_1.prisma.user.create({
        data: {
            username: username,
            password: password
        }
    }).then((data) => {
        res.json(data);
    }).catch((error) => {
        var _a;
        if (error.code === 'P2002' && ((_a = error.meta) === null || _a === void 0 ? void 0 : _a.target.includes('username'))) {
            res.status(409).json({ error: "Username already exists" });
        }
        else {
            res.status(502).json({ error: "An error occurred" });
        }
    });
});
exports.signup = signup;
