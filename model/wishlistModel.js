const mongoose = require("mongoose")


const wishlistSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    variantId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "variant",
        required : true
    }
},{timestamps : true})



module.exports = mongoose.model("wishlist",wishlistSchema)