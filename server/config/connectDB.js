const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((success) => {
      console.log(`MongoDB connected: ${success.connection.host}`);
    })
    .catch((err) => {
      console.log("Failed to connect MongoDB");
      console.error(err);
    });
};

module.exports = connectDB;
