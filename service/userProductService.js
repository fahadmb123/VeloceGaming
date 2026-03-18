const wishlistModel = require("../model/wishlistModel")
const cartModel = require("../model/cartModel")
const mongoose = require("mongoose")
const { variantModel } = require("../model/productModel")





const wishlistToggle = async (req) => {
    try {

        if (!req.session.user) {
            return {loginRequired : true}
        }
        const {variantId} = req.body
        const userId = req.session.user._id

        const existingItem = await wishlistModel.findOne({userId,variantId})

        if (existingItem){
            await wishlistModel.deleteOne({_id:existingItem._id})

            return {added:false}
        } else {
            await wishlistModel.create({
                userId,
                variantId
            })
            return {added:true}
        }
    } catch (err) {
        console.log(err)
    }
}

const addToCart = async (req) => {
    try {

        if (!req.session.user) {
            return { loginRequired: true }
        }

        const userId = req.session.user._id
        const variantId = req.query.variantId

        const variant = await variantModel
            .findById(variantId)
            .populate({
                path: "productId",
                populate: { path: "categoryId" }
            })

        if (!variant || !variant.status || variant.productId.isDeleted || variant.productId.categoryId.isDeleted) {
            return { valid: false }
        }

        if (variant.stock < 1) {
            return { failMessage: "Out Of Stock" }
        }

        let cart = await cartModel.findOne({ userId })

        if (!cart) {
            cart = await cartModel.create({
                userId,
                items: []
            })
        }

        const existingItem = cart.items.find(
            item => item.variantId.toString() === variantId
        )

        if (existingItem) {

            if (existingItem.quantity >= variant.stock) {
                return { failMessage: `only ${variant.stock} Stocks` }
            }
            if (existingItem.quantity >= 10){
                return {failMessage : "The Limit Is 10 Per Product"}
            } 

            existingItem.quantity += 1

        } else {

            cart.items.push({
                variantId,
                quantity: 1
            })
        }

        await cart.save()

        // remove only this user's wishlist item
        await wishlistModel.deleteOne({
            userId,
            variantId
        })

        return { message: "Cart Updated Successfully" }

    } catch (err) {
        console.log(err)
    }
}


const cartInc = async (req) => {
    try {

        if (!req.session.user) {
            return {loginRequired:true}
        }
        const variantId = req.query.variantId

        const variant = await variantModel.findOne({_id:variantId})

        const item = await cartModel.findOne({
            userId : req.session.user._id,
            "items.variantId" : variantId
        })
        
        const existingItem = item.items.find(obj => {
            return obj.variantId == variantId
        })
        if (variant.stock <= existingItem.quantity){
            return {failMessage : `only ${variant.stock} Stocks`}
        }
        if (existingItem.quantity >= 10){
            return {failMessage : "The Limit Is 10 Per Product"}
        }

        

        if (item) {
            await cartModel.updateOne(
                {
                    userId : req.session.user._id,
                "items.variantId" : variantId
                },
                {
                    $inc: { "items.$.quantity": 1 }
                }
            )

            return {message:"Product Updated"}
        } else {
            return {failMessage : "Product Doesn't Found"}
        }
    } catch (err) {
        console.log(err)
    }
}

const cartDec = async (req) => {
    try {

        if (!req.session.user) {
            return {loginRequired:true}
        }
        const variantId = req.query.variantId

        const item = await cartModel.findOne({
            userId : req.session.user._id,
            "items.variantId" : variantId
        })

        if (!item) {
            return { failMessage: "Product Doesn't Found" }
        }

        const cartItem = item.items.find(
            obj => obj.variantId.toString() === variantId
        )

        if (!cartItem) {
            return { failMessage: "Product Doesn't Found" }
        }

        if (cartItem.quantity <= 1) {
            return { failMessage: "Min Count Is One" }
        }

        if (item) {
            await cartModel.updateOne(
                {
                    userId : req.session.user._id,
                "items.variantId" : variantId
                },
                {
                    $inc: { "items.$.quantity": -1 }
                }
            )

            return {message:"Product Updated"}
        } else {
            return {failMessage : "Product Doesn't Found"}
        }
    } catch (err) {
        console.log(err)
    }
}
/*
const allToCart = async (req) => {
    try {

        if (!req.session.user) {
            return {loginRequired : true}
        }
        const userId = req.session.user._id
        const wishlistItems = await wishlistModel.find({userId:req.session.user._id}).populate("variantId")
        
        if (wishlistItems.length === 0){
            return {failMessage : "Products Not Found"}
        }

        let variants = wishlistItems.map(variant => {
            return variant.variantId
        })


        let returnMessage = null
        for (let variant of variants) {
            if (variant.stock < 1) {
                returnMessage = "Some Product Don't Have Much Stock"
                break;
            }
        }
        if (returnMessage) {
            return {failMessage:returnMessage}
        }


        variants.forEach(variant => {
            async function work() {
                let variantId = variant._id
                
                

                const result = await cartModel.updateOne(
                    {
                        userId,
                        "items.variantId": variantId
                    },
                    {
                        $inc: { "items.$.quantity": 1 }
                    }
                )

                if (result.modifiedCount === 0) {
                    await cartModel.updateOne(
                        { userId },
                        {
                            $push: {
                                items: {
                                    variantId:variantId,
                                    quantity: 1
                                }
                            }
                        },
                        { upsert: true }
                    )
                }
                await wishlistModel.deleteOne({userId})   
            }
            work()
        });

        return {message : "All Products In The Cart Updated"}
    } catch (err) {
        console.log(err)
    }
}*/
const allToCart = async (req) => {
    try {

        if (!req.session.user) {
            return { loginRequired: true }
        }

        const userId = req.session.user._id

        const wishlistItems = await wishlistModel
            .find({ userId })
            .populate("variantId")

        if (wishlistItems.length === 0) {
            return { failMessage: "Products Not Found" }
        }

        let cart = await cartModel.findOne({ userId })

        if (!cart) {
            cart = await cartModel.create({
                userId,
                items: []
            })
        }

        for (const item of wishlistItems) {

            const variant = item.variantId
            if (!variant || variant.stock < 1) continue

            const variantId = variant._id

            const existingItem = cart.items.find(
                obj => obj.variantId.toString() === variantId.toString()
            )
            

            if (existingItem) {
                if (existingItem.quantity >= 10){
                    continue
                }
                existingItem.quantity += 1
            } else {
                cart.items.push({
                    variantId,
                    quantity: 1
                })
            }
        }

        await cart.save()

        await wishlistModel.deleteMany({ userId })

        return { message: "All Products In The Cart Updated" }

    } catch (err) {
        console.log(err)
    }
}




module.exports = {
    wishlistToggle,
    addToCart,
    cartInc,
    cartDec,
    allToCart
}