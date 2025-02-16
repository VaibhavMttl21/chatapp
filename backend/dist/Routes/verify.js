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
exports.verify = void 0;
const prisma_1 = require("../serverconfig/prisma");
const verify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    prisma_1.prisma.user.findUnique({
        where: {
            username: username
        }
    }).then((data) => {
        if (data) {
            res.json({ message: "Success" });
        }
        else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    }).catch((error) => {
        res.status(401).json({ error: "Invalid credentials" });
    });
});
exports.verify = verify;
