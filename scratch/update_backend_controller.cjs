const fs = require('fs');
const path = require('path');

const targetPath = 'C:\\Users\\aksin\\OneDrive\\Desktop\\football_backend\\src\\controllers\\registrationController.js';

const content = `import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Registration } from "../models/Registration.js";
import { Stats } from "../models/Stats.js";
import { registrationSchema } from "../utils/validators.js";
import { updateInMemoryStats } from "./statsController.js";

export const createRegistration = async (req, res, next) => {
    try {
        // Validate input with Zod
        const validatedData = registrationSchema.parse(req.body);

        // Check for existing registration with duplicate email
        if (validatedData.email && validatedData.email.trim()) {
            const existingUser = await Registration.findOne({
                where: { email: validatedData.email.trim() },
            });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Email is already registered. Please log in or use a different email.",
                });
            }
        }

        // Hash password if provided
        if (validatedData.password && validatedData.password.trim()) {
            validatedData.password = await bcrypt.hash(
                validatedData.password.trim(),
                10,
            );
        }

        let newRecord = null;
        try {
            newRecord = await Registration.create(validatedData);

            // Update DB stats
            const [statsRecord] = await Stats.findOrCreate({
                where: { id: 1 },
                defaults: {
                    total: 342891,
                    leftCount: 131670,
                    rightCount: 211221,
                    downloads: 312000,
                    countries: 142,
                },
            });

            statsRecord.total += 1;
            statsRecord.downloads += 1;
            if (validatedData.footPreference === "left") {
                statsRecord.leftCount += 1;
            } else {
                statsRecord.rightCount += 1;
            }
            await statsRecord.save();
        } catch (dbErr) {
            console.error("DB registration error:", dbErr.message);
            return res.status(500).json({
                success: false,
                message: "Database error registering player: " + dbErr.message,
            });
        }

        // Always update in-memory stats fallback so stats remain accurate across memory/DB state
        updateInMemoryStats(validatedData.footPreference);

        const fullName = [newRecord.firstName, newRecord.lastName].filter(Boolean).join(" ") ||
            newRecord.name ||
            "Player";

        const tokenPayload = {
            id: newRecord.id,
            email: newRecord.email,
            firstName: newRecord.firstName,
            lastName: newRecord.lastName,
            footPreference: newRecord.footPreference,
            paymentStatus: newRecord.paymentStatus || "unpaid",
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET || "touches_secret_key_jwt_2026_secure",
            { expiresIn: "7d" }
        );

        return res.status(201).json({
            success: true,
            message: "Player registered successfully!",
            token,
            data: {
                id: newRecord.id,
                name: fullName,
                firstName: newRecord.firstName,
                lastName: newRecord.lastName,
                email: newRecord.email,
                footPreference: newRecord.footPreference,
                country: newRecord.country,
                paymentStatus: newRecord.paymentStatus || "unpaid",
            },
        });
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.errors,
            });
        }
        next(error);
    }
};

export const getRegistrations = async (req, res, next) => {
    try {
        let list = [];
        try {
            list = await Registration.findAll({
                limit: 50,
                order: [
                    ["createdAt", "DESC"]
                ],
            });
        } catch (e) {
            list = [];
        }

        return res.json({
            success: true,
            data: list,
        });
    } catch (error) {
        next(error);
    }
};
`;

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully written to', targetPath);
