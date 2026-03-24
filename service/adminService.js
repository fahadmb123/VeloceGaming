const adminModel = require("../model/adminModel")
const userModel = require("../model/userModel")
const categoryModel = require("../model/categoryModel.js")
const {productModel,variantModel} = require("../model/productModel.js")
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

        
        const {offer,name,} = req.body

        const slug = await generateSlug(name)

        const category = await categoryModel.findOne({name})

        if (category) {
            let failMessage = "The Category Is Already There" 
            return {failMessage}
        }

        const image = await cloudinary.uploader.upload(req.file.path,{folder:"category-image"}) 
        
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


const addProduct = async (req) => {
    try {

        const {
            name,
            category,
            offer,
            homepage,
            //details
        } = req.body
        const variants = JSON.parse(req.body.variants)
        const highlights = JSON.parse(req.body.highlights)
        const services = JSON.parse(req.body.services)
        const details = JSON.parse(req.body.details)


        let isExist = await productModel.findOne({name})

        if (isExist) {
            return {failMessage : "The Same Name Product Already Exist"}
        }

        

        let productCategory = await categoryModel.findOne({_id:category})

        if (!productCategory){
            return {failMessage:"Selected Category Is Not Found"}
        }

        let slug = await generateSlug(name)

        const newProduct = new productModel ({
            name,
            slug,
            details,
            offer,
            highlights,
            services,
            homepage,
            categoryId : productCategory._id
        })
        await newProduct.save()


        let product = await productModel.findOne({name})


        variants.forEach ((obj) => {
            obj.images = []
            obj.imagesId = []
            obj.productId = product._id
        })


        for (let file of req.files) {

            const field = file.fieldname

            let index = field.split("_")[1]

            const result = await cloudinary.uploader.upload(file.path,{folder:"product-variant-images"})

            variants[index].images.push(result.secure_url)
            variants[index].imagesId.push(result.public_id)

        }


        let mainOffer = Math.max(productCategory.offer || 0 , offer || 0)
        for (let  i=0 ; i<variants.length ; i++){
            let obj = variants[i]
            //let offeredPrice = obj.price * (1 - offer / 100)
            let offeredPrice
            
            if (!mainOffer) {
                offeredPrice = obj.price
            } else {
                offeredPrice = obj.price * (1 - mainOffer / 100)
            }
            let toAddVariant = {
                productId : obj.productId,
                price : obj.price,
                stock : obj.stock,
                images : obj.images,
                imagesId : obj.imagesId,
                status : obj.status,
                offeredPrice : offeredPrice,
                attributes : [
                    {key : "ram" , value : obj.ram},
                    {key : "rom" , value : obj.rom},
                    {key : "color" , value : obj.color}
                ]
            }
            const newVariant = new variantModel(toAddVariant)

            await newVariant.save()
        }

        

        return {message:"Product Added Successfully"}
    } catch (err) {
        console.log(err)
    }
}


const editProduct = async (req) => {
    try {

        const productId = req.params.id

        const {
            name,
            category,
            offer,
            homepage,
        } = req.body

        const variants = JSON.parse(req.body.variants)
        const highlights = JSON.parse(req.body.highlights)
        const services = JSON.parse(req.body.services)
        const details = JSON.parse(req.body.details)

        let isExist = await productModel.findOne({ _id: productId })

        if (!isExist) {
            return { failMessage: "The Product Doesn't Exist" }
        }

        let nameExist = await productModel.findOne({ name })

        if (nameExist && nameExist.name != isExist.name) {
            return { failMessage: "The Name With The Product Already Exist" }
        }

        let productCategory = await categoryModel.findOne({ _id: category })

        if (!productCategory) {
            return { failMessage: "Selected Category Is Not Found" }
        }

        let slug = await generateSlug(name)

        await productModel.updateOne(
            { _id: productId },
            {
                $set: {
                    name,
                    slug,
                    details,
                    offer,
                    highlights,
                    services,
                    homepage,
                    categoryId: productCategory._id
                }
            }
        )


        for (let i = 0; i < variants.length; i++) {

            let variant = variants[i]

            let finalImages = []
            let finalImagesId = []

            if (variant.existingImages && variant.existingImages.length > 0) {
                for (let img of variant.existingImages) {
                    finalImages.push(img.url)
                    finalImagesId.push(img.public_id)
                }
            }

            if (req.files && req.files.length > 0) {

                for (let file of req.files) {

                    const field = file.fieldname
                    let index = field.split("_")[1]

                    if (parseInt(index) === i) {

                        const result = await cloudinary.uploader.upload(file.path, {
                            folder: "product-variant-images",
                        })

                        finalImages.push(result.secure_url)
                        finalImagesId.push(result.public_id)

                        fs.unlinkSync(file.path)
                    }
                }
            }

            let offeredPrice
            let mainOffer = Math.max(productCategory.offer || 0 , offer || 0)
            
            if (!mainOffer) {
                offeredPrice = variant.price
            } else {
                offeredPrice = variant.price * (1 - mainOffer / 100)
            }

            // UPDATE EXISTING VARIANT
            if (variant._id) {

                await variantModel.updateOne(
                    { _id: variant._id },
                    {
                        $set: {
                            price: variant.price,
                            stock: variant.stock,
                            images: finalImages,
                            imagesId: finalImagesId,
                            status: variant.status,
                            offeredPrice: offeredPrice,
                            attributes: [
                                { key: "ram", value: variant.ram },
                                { key: "rom", value: variant.rom },
                                { key: "color", value: variant.color },
                            ],
                        }
                    }
                )

            }

            // CREATE NEW VARIANT
            else {

                await variantModel.create({
                    productId,
                    price: variant.price,
                    stock: variant.stock,
                    images: finalImages,
                    imagesId: finalImagesId,
                    status: variant.status,
                    offeredPrice: offeredPrice,
                    attributes: [
                        { key: "ram", value: variant.ram },
                        { key: "rom", value: variant.rom },
                        { key: "color", value: variant.color },
                    ],
                })

            }

        }

        return { success: true, message: "Updated" }

    } catch (err) {
        console.log(err)
    }
}



module.exports = {
    login,
    userStatus,
    addCategory,
    editCategory,
    addProduct,
    editProduct
}