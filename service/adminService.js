const adminModel = require("../model/adminModel")
const userModel = require("../model/userModel")
const categoryModel = require("../model/categoryModel.js")
const bcrypt = require("bcrypt")
const cloudinary = require("../helpers/cloudinary.js")
const fs = require("fs");


function generateSlug (name) {
    return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g,"-")
    .replace(/[^\w-]+/g,"")
}



const login = async (req) => {
    try {

        const {email,password} = req.body

        const admin = await adminModel.findOne({email})

        if (!admin) {
            const message = "Invalid Admin"
            return {message}
        }

        const isMatch = await bcrypt.compare(password,admin.password)

        if (!isMatch){
            const message = "Incorrect Password"
            return {message}
        }

        const swalMessage = "You Logged Succesfully"
        req.session.admin = await adminModel.findOne({email})
        return {swalMessage}

    } catch (err) {
        console.log(err)
    }
}


const userStatus = async (req) => {
    try {

        const userId = req.params.id
        const status = req.query.status

        await userModel.updateOne(
            {_id:userId},
            {$set:{status:status}}
        )
        const swalMessage = "Status Updated"
        return {swalMessage}
    } catch (err){
        console.log(err)
    }
}


const addCategory = async (req) => {
    try {

        //let failMessage
        const {offer,name,} = req.body

        const slug = await generateSlug(name)

        const category = await categoryModel.findOne({name})

        if (category) {
            let failMessage = "The Category Is Already There" 
            return {failMessage}
        }

        const image = await cloudinary.uploader.upload(req.file.path,{folder:"category-image"}) 
        console.log(image)
        const newCategory = new categoryModel({
            name,
            slug,
            offer,
            image : image.secure_url,
            imageId : image.public_id
        })
        await newCategory.save()
        let message = "Category Added Succesfully"
        return {message}

        
    } catch (err) {
        console.log(err)
    }
}



const editCategory = async (req) => {
    try {
        const { name, offer } = req.body;
        const id = req.params.id;

        const category = await categoryModel.findById(id);
        if (!category) {
            return { failMessage: "Category not found" };
        }

        let object = {};

        
        if (name && name !== category.name) {
            object.name = name;
            object.slug = generateSlug(name);
        }

        
        if (offer && offer !== category.offer) {
            object.offer = offer;
        }

        
        if (req.file) {
            if (category.imageId) {
                await cloudinary.uploader.destroy(category.imageId);
            }

            const image = await cloudinary.uploader.upload(
                req.file.path,
                { folder: "category-image" }
            );

            object.image = image.secure_url;
            object.imageId = image.public_id;

            
            fs.unlinkSync(req.file.path);
        }


        if (Object.keys(object).length === 0) {
            return { failMessage: "No Changes" };
        }

        await categoryModel.updateOne(
            { _id: id },
            { $set: object }
        );

        return { message: "Updated Successfully" };

    } catch (err) {
        console.log(err);
        return { failMessage: "Something went wrong" };
    }
};





module.exports = {
    login,
    userStatus,
    addCategory,
    editCategory
}