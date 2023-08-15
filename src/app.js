/* eslint-disable no-undef */
// Import base
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");
const bodyParser = require("body-parser");
const path = require("path");

// Import middleware
const mwError = require("./middlewares/error");

// Import socket handlers
const registerRoomHandlers = require("./handlers/room");

// Import routes
const rteUser = require("./routes/user");
const rteOrder = require("./routes/order");
const rteProduct = require("./routes/product");
const rteSession = require("./routes/session");
const rteRoom = require("./routes/room");
const rteMail = require("./routes/mail");

// Create server
const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: true } });

// IO listen to client connection
io.on("connection", (socket) => {
  registerRoomHandlers(io, socket);
});

// Setup body parser, cors, static folder
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session config
const sessionConfig = {
  resave: true,
  saveUninitialized: true,
  proxy: true,
  name: "njs301-asm3-server",
  secret: "myscret",
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "none",
    secure: true,
    httpOnly: true,
  },
};

// Check if in production environment
if (process.env.NODE_ENV === "production") {
  // Use secure session configuration for production environment
  sessionConfig.cookie.secure = true;
  app.set("trust proxy", 1);
} else {
  // Use non-secure session configuration for development environment
  sessionConfig.cookie.secure = false;
  app.set("trust proxy", 0);
}

// Setup session
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Setup routes
app.use("/api/users", rteUser);
app.use("/api/orders", rteOrder);
app.use("/api/products", rteProduct);
app.use("/api/sessions", rteSession);
app.use("/api/rooms", rteRoom);
app.use("/api/mails", rteMail);

// Handle get image
app.get("/uploads/:imgPath", (req, res) => {
  const imgPath = req.params.imgPath;
  const rootDir = path.resolve(process.cwd());
  res.sendFile(rootDir + "/uploads/" + imgPath);
});

// Use error middleware
app.use(mwError);

// Connect to database and run server
mongoose
  .connect(
    "mongodb+srv://doanduythanh:12345@cluster0.q7hdcal.mongodb.net/Assignment3"
  )
  .then(() => server.listen(5000))
  .catch((err) => console.log(err));

module.exports = app;
