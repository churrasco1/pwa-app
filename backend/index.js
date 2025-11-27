const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const socketIo = require("socket.io");
const router = require("./router");
const hostname = "127.0.0.1";

const config = require("./config");
const port = process.env.PORT || 3000;
const hostman = ("RENDER" in process.env) ? "0.0.0.0" : "localhost";

mongoose.connect(process.env.MONGO_URI || config.db)
.then(() => console.log('Conection successful'))
.catch((err) => console.log(err));

let router = require("./router");

var app = express();

const customFrontendUrl = process.env.FRONTEND_URL || '';

const allowedOrigins = [
  customFrontendUrl,
  'https://pwa-app.vercel.app',
].filter(Boolean);

const isAllowedOrigin = (origin) =>
!origin || allowedOrigins.indexOf(origin);

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
    return callback(null, true);
  }
  return callback(new Error('Not allowed by CORS'));
},
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
