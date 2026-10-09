const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
            index: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        message: {
            type: String,
            required: true
        },
        isSeen: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

MessageSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema);