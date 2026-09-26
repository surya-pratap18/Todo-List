import Users from "../schema/users.schema.js";
import tokenUtils from "../utils/token.utils.js";

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token is required" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = tokenUtils.verifyToken(token);
        const user = await Users.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Invalid authorization token" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid authorization token" });
    }
};

export default authMiddleware;
