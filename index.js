require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const serviceAccount = require("./serviceAccountKey.json");
const { initializeApp, cert } = require("firebase-admin/app");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));



// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("Error connecting to MongoDB:", error));




initializeApp({
    credential: cert(serviceAccount)
});

console.log("Firebase Admin Initialized Successfully!");


// rest api 
app.use("/api/auth", require("./routers/authRoutes"));
app.use("/api/users/", require("./routers/userRoutes"));
app.use("/api/chat", require("./routers/chatRoutes"));






app.use((err, req, res, next) => {
    if (err) {
        console.error(err.stack);
        res.status(500).json({ message: "Internal server error" });
    }
});








// socket connection

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});



require("./sockets/chatSocket")(io);




// Start the server
server.listen(process.env.PORT || 5000, () => {
    console.log(`Server started on port at http://localhost:${process.env.PORT || 5000}`);
});
