const mongoose = require("mongoose")



const productSchema = mongoose.Schema({
    categoryId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "category",
        required : true
    },
    slug : {
        type : String,
        required : true,
        lowercase : true
    },
    name : {
        type : String,
        required : true,
        trim : true,
        unique : true
    },
    details : [
        {
            type : String
        }
    ],
    offer : {
        type : Number,
        default : 0
    },
    highlights : [
        {
            type : String
        }
    ],
    services : [
        {
            type : String
        }
    ],
    isDeleted : {
        type : Boolean,
        default : false
    },
    homepage : {
        type : Boolean,
        default : false
    },
    rating : {
        type : Number,
        default : 0
    },
    numReviews : {
        type : Number,
        default : 0
    },
    /*variantCount : {
        type : Number
    }*/

},{timestamps:true})



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
    images : [
        {
            type : String
        }
    ],
    imagesId : [
        {
            type : String
        }
    ],
    attributes : [
        {
            key : {
                type : String
            },
            value : {
                type : String
            }
        }
    ],
    status : {
        type : Boolean,
        default : true
    },
    offeredPrice : {
        type : String
    }
},{timestamps : true})


const reviewSchema = mongoose.Schema ({
    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "product",
        required : true
    },
    name: {
            type: String,
            required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    description: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


const productModel = mongoose.model("product",productSchema)
const variantModel = mongoose.model("variant",variantSchema)
const reviewModel = mongoose.model("review",reviewSchema)

module.exports = {productModel,variantModel,reviewModel}