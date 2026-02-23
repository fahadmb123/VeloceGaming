const mongoose = require("mongoose")

const categorySchema = mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
        unique : true
    },
    slug : {
        type : String,
        required : true,
        unique : true,
        lowercase : true
    },
    /*status : {
        type : Boolean,
        default : true
    },*/
    offer : {
        type : String
    },
    image : {
        type : String,
        required : true
    },
    imageId : {
        type : String,
        required : true
    },
    isDeleted : {
        type : Boolean,
        default : false
    }
},{timesstamps:true})

module.exports = mongoose.model("category",categorySchema)