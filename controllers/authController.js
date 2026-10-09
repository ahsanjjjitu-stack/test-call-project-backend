const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const jwtToken = require("jsonwebtoken");



const generateToken = (userId) => {
    return jwtToken.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
}






exports.signUpUser = async (req, res, next) => {

    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }



        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            bio: ""
        });



        res.status(201).json({
            success: true,
            message: "User registered successfully",
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            bio: newUser.bio,
            token: generateToken(newUser._id),
        });



    }
    catch (error) {
        next(error);
    }


}








exports.loginUser = async (req, res, next) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }


        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }


        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }


        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            _id: user._id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            token: generateToken(user._id),
        });




    }
    catch (error) {
        next(error);
    }


}