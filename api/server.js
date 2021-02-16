const express = require("express");
const cors = require("cors");
const server = express();

//routers

server.use(express.json());
server.use(cors());

server.get("/", (req, res) => {
  res.status(200).json({ server: "working!" });
});

module.exports = server;
