const mongoose = require("mongoose")


const couponSchema = mongoose.Schema({
    code : {
        type : String
    },
    type : {
        type : "percentage" | "flat"
    },
    discountValue : {
        type : Number
    },
    maxDiscount : {
        type : Number
    },
    minimumAmount : {
        type : Number
    },
    expiryDate : {
        type : Date
    },
    maxUsage : {
        type : Number
    },
    usedCount : {
        type : Number
    },
    status : {
        type : Boolean
    }
},{timestamps:true})



module.exports = mongoose.model("coupon",couponSchema)