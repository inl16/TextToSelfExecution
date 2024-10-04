const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { exec } = require("child_process");

const app = express();
const httpServer = createServer(app);
// Add CORS options directly to the Socket.IO server configuration
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow only your React app to connect
    methods: ["GET", "POST"], // Allowed HTTP request methods
    allowedHeaders: ["*"],
    credentials: true,
  },
});
const port = 4000;

app.use(express.static(".")); // Assuming you're serving files from 'public' again

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("run-script", () => {
    console.log("running script");
    const process = exec("node request.js");

    process.stdout.on("data", (data) => {
      console.log(data);
      socket.emit("script-output", data);
    });

    process.stderr.on("data", (data) => {
      console.error(data);
      socket.emit("script-output", data);
    });
  });
});

httpServer.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
