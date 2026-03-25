const mongoose = require("mongoose")
const addressSchema = require("./addressModel")

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const userSchema = mongoose.Schema({
    refferedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    name : {
        type : String,
        required : true
    },
    email : {
        required : true,
        type : String,
        unique : true,
        index : true
    },
    password : {
        type : String,
        required:function (){
            return !this.googleId
        }
    },
    googleId : {
        type:String
    },
    refferalCode : {
        type : String,
        unique : true
    },
    address : [addressSchema],
    status: {
        type: Boolean,
        default: true
    },
    profileImage : {
        type : String
    },
    profileImageId : {
        type : String
    }

},{ timestamps: true })



userSchema.pre("save", async function () {
  if (!this.refferalCode) {
    this.refferalCode = generateReferralCode();
    }
});


module.exports = mongoose.model("user",userSchema)