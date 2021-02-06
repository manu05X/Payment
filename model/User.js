const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: String,
  paysafeId: String
});

module.exports = mongoose.model("User", userSchema);