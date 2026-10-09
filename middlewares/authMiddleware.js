const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");


exports.protect = async (req, res, next) => {

    let token;

  if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select("-password");

            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error.message);
            return res.status(401).json({ message: "Not Authorized" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not Authorized, No Token" });
    }

}