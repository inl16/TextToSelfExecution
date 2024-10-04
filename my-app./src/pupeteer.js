const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const puppeteer = require("puppeteer");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true,
  },
});
const port = 6000;

app.use(express.static("."));

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("run-puppeteer", async () => {
    console.log("running puppeteer script");

    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      // Your Puppeteer actions go here
      await page.goto("http://localhost:3000/migration");
      const title = await page.title();
      console.log("Title:", title);

      // Emit the result to the client
      socket.emit("puppeteer-output", `Page title: ${title}`);

      await browser.close();
    } catch (error) {
      console.error("Puppeteer error:", error);
      socket.emit("puppeteer-output", `Error: ${error.message}`);
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
