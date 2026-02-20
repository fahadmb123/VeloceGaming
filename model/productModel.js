const mongoose = require("mongoose")



const productSchema = mongoose.Schema({
    categoryId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "category",
        required : true
    },
    name : {
        type : String,
        required : true,
        trim : true
    },
    details : {
        type : String,
        required : true
    },
    offer : {
        type : Number,
        default : 0
    },
    highlights : [
        {
            type : String
        }
    ],
    service : [
        {
            type : String
        }
    ],
    isActive : {
        type : Boolean,
        default : true
    }

},{timestamps})



const variantSchema = mongoose.Schema({
    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "product",
        required : true
    },
    price : {
        type : String,
        required : true
    },
    stock : {
        type : Number,
        required : true,
        default : 0
    },
    image : [
        {
            type : String
        }
    ],
    attributes : [
        {
            key : {
                type : String,
                required : true
            },
            value : {
                type : String,
                required : true
            }
        }
    ],
    isActive : {
        type : Boolean,
        default : true
    }
},{timestamps : true})



const productModel = mongoose.model("product",productSchema)
const variantModel = mongoose.model("variant",variantSchema)


module.exports = {productModel,variantModel}