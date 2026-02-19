const mongoose = require("mongoose")


const addressSchema = mongoose.Schema({
    fullName : {
        type:String,
        require :true
    },
    phone : {
        type : String,
        require : true
    },
    pincode : {
        type : String,
        require : true
    },
    state : {
        type : String,
        require : true
    },
    city : {
        type : String,
        require : true
    },
    address : {
        type : String,
        require : true
    },
    idDefault : {
        type : Boolean,
        default : false
    },
    type : {
        type : String,
        required : true
    }
})


module.exports = addressSchema