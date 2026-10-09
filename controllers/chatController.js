const Message = require("../models/message");

exports.getChatHistory = async (req, res, next) => {
    try {
        const { roomId } = req.params;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;


        const messages = await Message.find({ roomId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("sender", "name email");

        res.status(200).json({
            success: true,
            page,
            messages: messages.reverse()
        });
    }
    catch (error) {
        next(error);
    }
};