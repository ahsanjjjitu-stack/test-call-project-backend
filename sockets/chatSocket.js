const Message = require("../models/message");
const User = require("../models/userSchema");
const { getMessaging } = require("firebase-admin/messaging");
const admin = require("firebase-admin");


module.exports = (io) => {

    io.on("connection", (socket) => {



        // fcm token save to database 

        socket.on("update_fcm_token", async (data) => {
            try {
                const user = await User.findByIdAndUpdate(data.userId, { fcmToken: data.fcmToken });
                console.log("FCM token saved for user:", user.name);
                console.log("FCM Token updated for user: " + data.userId);
            } catch (error) {
                console.error("Error saving FCM token:", error.message);
            }
        });










        // user join and connect 



        console.log("User connected: " + socket.id);

        socket.on("join_room", (data) => {
            socket.join(data.roomId);
            console.log("User joined room: " + data.roomId);
        });




        socket.on("register_user", (userId) => {
            socket.join(userId);
            console.log(`User registered with ID: ${userId} and socket ID: ${socket.id}`);
        });




        socket.on("send_message", async (data) => {
            console.log("Message received: " + data.message);

            try {
                const newMessage = new Message({
                    roomId: data.roomId,
                    sender: data.senderId,
                    message: data.message
                });


                await newMessage.save();

                const savedMessage = await Message.findById(newMessage._id).populate("sender", "name email");


                io.to(data.roomId).emit("receive_message", {
                    _id: savedMessage._id,
                    roomId: savedMessage.roomId,
                    senderId: savedMessage.sender._id,
                    sender: savedMessage.sender,
                    message: savedMessage.message,
                    createdAt: savedMessage.createdAt
                });



            } catch (error) {
                console.error("Error saving message to DB:", error.message);
            }
        });














        // Handle message seen event

        socket.on("mark_as_seen", async (data) => {

            try {
                const { roomId, userId } = data;

                await Message.updateMany(
                    {
                        roomId: roomId,
                        sender: { $ne: userId },
                        isSeen: false
                    },
                    { $set: { isSeen: true } }
                );


                io.to(roomId).emit("messages_seen", { roomId: roomId, seenBy: userId });

                console.log(`Messages marked as seen in room: ${roomId} by user: ${userId}`);

            }
            catch (error) {
                console.error("Error marking messages as seen:", error.message);
            }

        });










        // Handle typing event

        socket.on("typing", (data) => {
            socket.to(data.roomId).emit("user_typing", {
                userId: data.userId,
                userName: data.userName
            })
        });





        // Handle stop typing event

        socket.on("stop_typing", (data) => {
            socket.to(data.roomId).emit("user_stop_typing", {
                userId: data.userId
            })
        });










        // WebRTC Audio/Video Calling Signaling


        socket.on("call_user", async (data) => {



            try {


                io.to(data.userToCall).emit("incoming_call", {
                    signal: data.signalData,
                    from: data.from,
                    name: data.name
                });



                console.log("Socket incoming_call emitted to: " + data.userToCall);



                const receiverUser = await User.findById(data.userToCall);




                if (receiverUser && receiverUser.fcmToken) {
                    const payload = {
                        token: receiverUser.fcmToken,
                        data: {
                            type: "AUDIO_CALL",
                            callerId: String(data.from || ""),
                            callerName: String(data.name || "Unknown"),
                            signal: JSON.stringify(data.signalData || {})
                        },
                        android: {
                            priority: "high"
                        }

                    }

                    await getMessaging().send(payload);
                    console.log("FCM Audio Call Push sent successfully to: " + receiverUser.name);

                }
                else {
                    console.log("Receiver FCM Token not found!");
                }


            }
            catch (err) {
                console.error("Error in call_user event:", err.message);
                console.error("=== call_user FCM ERROR ===");
                console.error("code:", err.code);
                console.error("message:", err.message);
                console.error("errorInfo:", JSON.stringify(err.errorInfo));
                console.error("userToCall:", data.userToCall);
                console.error("from:", data.from);
            }

        });








        socket.on("answer_call", (data) => {
            io.to(data.to).emit("call_accepted", data.signal);
        });






        socket.on("send_ice_candidate", (data) => {
            io.to(data.to).emit("ice_candidate_received", data.candidate);
        });





        socket.on("end_call", (data) => {
            io.to(data.to).emit("call_ended");
        });





        socket.on("disconnect", () => {
            console.log("User disconnected: " + socket.id);
        });


    });


}