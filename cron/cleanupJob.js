const cron = require ("node-cron")
const wishlistModel = require("../model/wishlistModel")
const cartModel = require("../model/cartModel")
const {variantModel} = require("../model/productModel")


cron.schedule("*/5 * * * *",async () => {
    try {
        console.log("🧹🧹🧹 Running Cleaning Job At : ",new Date())
        console.log("🧹🧹🧹 We Will Clean In Every 5 Minutes 🧹🧹🧹")

        const wishlists = await wishlistModel.find()
        if (wishlists) {
                for (let item of wishlists){
                    const variant = await variantModel.findById(item.variantId)
                    .populate({
                        path : "productId",
                        populate : {
                            path : "categoryId"
                        }
                    })
                    if (variant.stock === 0 || !variant || !variant.status || variant.productId.isDeleted || variant.productId.categoryId.isDeleted){
                        await wishlistModel.deleteOne({_id:item._id}) 
                    }
                }
        }


        const carts = await cartModel.find()
        if (carts) {
            for (let cart of carts){
                let validItems= []
                for (let item of cart.items){
                    const variant = await variantModel.findById(item.variantId)
                    .populate({
                        path:"productId",
                        populate:{
                            path : "categoryId"
                        }
                    })

                    if (variant && variant.status && !variant.productId.isDeleted && !variant.productId.categoryId.isDeleted){
                        validItems.push(item)
                    }
                }
                cart.items = validItems
                await cart.save()
            }
        }
    } catch (err) {
        console.log(err)
    }
})