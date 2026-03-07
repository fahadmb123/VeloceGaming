const cartModel = require("../model/cartModel")
const { variantModel } = require("../model/productModel")
const userModel = require("../model/userModel")






const loadCheckout = async (req,res) => {
try {

    const variantId = req.query.variantId
    const quantity = parseInt(req.query.quantity)

    
    if (!req.session.user){
        return res.redirect("/login")
    }

    if (variantId && quantity) {

        const variant = await variantModel.findOne({_id:variantId})
        .populate({
            path:"productId",
            populate : {
                path:"categoryId"
            }
        })

        if (!variant || !variant.status || variant.productId.isDeleted || variant.productId.categoryId.isDeleted){
            req.flash("error" , "Product Not Available")
            return res.redirect(`/product/${variantId}`)
        }

        if (variant.stock < quantity){
            req.flash("error","Stock Not Available For This Product")
            return res.redirect(`/product/${variantId}`)
        }

        const user = await userModel.findOne({_id:req.session.user._id})
        const address = user.address.slice().reverse()
        const swalMessage = req.session.swalMessage
        req.session.swalMessage = null

        let subtotal = 0
        let shipping = 0
        let tax = 0

        subtotal = quantity * Number(variant.offeredPrice)

        const total = subtotal + shipping + tax

        return res.render ("user/checkout",{
            variant,
            quantity,
            address,
            swalMessage,
            subtotal,
            shipping,
            tax,
            total
        })

    } else {

        const cart = await cartModel
        .findOne({userId:req.session.user._id})
        .populate({
            path:"items.variantId",
            populate : {
                path:"productId",
                populate : {
                    path : "categoryId"
                }
            }
        })

        if (!cart || cart.items.length === 0){
            req.flash("error","Cart Is Empty")
            return res.redirect("/cart")
        }


        for (let item of cart.items){
            let variant = item.variantId

            if (!variant || !variant.status || variant.productId.isDeleted || variant.productId.categoryId.isDeleted){
                req.flash("error","Some Product Are No Longer Available")
                return res.redirect("/cart")
            }
            if (variant.stock < item.quantity){
                req.flash("error","Stock Not Available For Some Products")
                return res.redirect("/cart")
            }
        }
        const user = await userModel.findOne({_id:req.session.user._id})
        const address = user.address.slice().reverse()
        const swalMessage = req.session.swalMessage
        req.session.swalMessage = null

        let subtotal = 0
        let shipping = 0
        let tax = 0

        for (let item of cart.items) {
            let variant = item.variantId
            let price = variant.offeredPrice
            subtotal += price * item.quantity
        }

        const total = subtotal + shipping + tax



        return res.render ("user/checkout",{
            cart,
            address,
            swalMessage,
            subtotal,
            shipping,
            tax,
            total
        })
    }
} catch (err) {
        console.log(err)
}
}




module.exports = {
    loadCheckout
}