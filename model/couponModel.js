const mongoose = require("mongoose")


const couponSchema = mongoose.Schema({
    code : {
        type : String,
        required : true
    },
    type : {
        type : String,
        enum : ["percentage" , "flat"],
        required : true
    },
    discountValue : {
        type : Number,
        required : true
    },
    maxDiscount : {
        type : Number
    },
    minPurchase : {
        type : Number,
        required : true
    },
    expiryDate : {
        type : Date,
        required : true
    },
    maxUsage : {
        type : Number,
        required : true
    },
    usedCount : {
        type : Number,
        default : 0,
    },
    status : {
        type : Boolean,
        default : true
    }
},{timestamps:true})



module.exports = mongoose.model("coupon",couponSchema)