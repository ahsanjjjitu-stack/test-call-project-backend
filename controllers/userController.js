const User = require("../models/userSchema");



exports.getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;


        const currentUserId = req.user.id;

        const query = currentUserId ? { _id: { $ne: currentUserId } } : {};

        const users = await User.find(query)
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });



        const totalUsers = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers: totalUsers,
            users: users
        });

    }
    catch (error) {
        next(error);
    }
}