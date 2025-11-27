const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const config = require("./config");
const socketIo = require("socket.io");
const router = require("./router");
const hostname = "127.0.0.1";
const port = 3000;
const app = express();

app.use(cors());

mongoose
  .connect(config.db)
  .then(() => console.log("Conection successful!"))
  .catch((err) => console.error(err));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://*:*", //allow all IPs and All ports
  },
});

io.on("connection", (socket) => {
  console.log("socket, new connection", socket.id);

  socket.on("disconnect", () => {
    console.log("🔥 : A user disconnected");
    socket.disconnect();
  });
});

app.use(router.init(io));
app.use("/images", express.static(path.join(__dirname, "images")));

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
})
