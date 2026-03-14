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


const walletTransactions = mongoose.Schema({
    
})



module.exports = mongoose.model("wallet",walletSchema)