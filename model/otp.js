const mongoose = require("mongoose")


const otpSchema = mongoose.Schema({
  email: {
    type:String,
    required: true,
    unique:true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 80
  }
})

module.exports = mongoose.model("otp",otpSchema)