const mongoose = require("mongoose")



const cartSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    items : [
        {
            variantId : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "variant",
                required : true
            },
            quantity : {
                type : Number,
                required : true,
                min : 1
            }
        }
    ]
},{timestamps : true})




module.exports = mongoose.model("cart",cartSchema)