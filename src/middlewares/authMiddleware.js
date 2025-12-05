import { verifyToken } from "../utils/jwt.utils.js";


const extractToken = (authorizationHeader = "") => {
    const header = authorizationHeader.trim();
    if (!header) {
        return "";
    }

    const parts = header.split(" ").filter(Boolean);
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
        return parts[1].trim();
    }

    return header;
};

export const verifyAdminUser = (req, res, next) => {
    try {
        const token = extractToken(req.headers["authorization"]);
        if (!token) {
            return res.status(401).json({
                message: "Authorization token missing",
            });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                message: "Invalid token",
            });
        }
        console.log(decoded);
        if (decoded.role !== "admin") {
            return res.status(403).json({
                message: "Not an admin user",
            });
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({
            message: "Invalid token",
            error: err.message,
        });
    }
};

const verifyTokenUser = (req, res, next) => {
    try {
        const token = extractToken(req.headers["authorization"]);
        if (!token) {
            return res.status(401).json({ message: "Authorization token missing" });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }


        console.log(decoded);
        req.user = decoded;
        return next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token", error: err.message });
    }
};

export default verifyTokenUser;
