const mongoose = require("mongoose")


const walletSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    balance : {
        type : Number,
        default : 0
    },
},{timestamps : true})


const walletTransactionSchema = mongoose.Schema({
    type : {
        type : String,
        enum : ["debit","credit"]
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    amount : {
        type : Number
    },
    reason : {
        type : String,
        enum : ["refunded","cashback","orderpayment"]
    }
},{timestamps : true})


const walletModel = mongoose.model("wallet",walletSchema)
const walletTransactionModel = mongoose.model("walletTransaction",walletTransactionSchema)



module.exports = {walletModel,walletTransactionModel}