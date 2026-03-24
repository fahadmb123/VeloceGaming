const cartModel = require("../../model/cartModel")
const { variantModel } = require("../../model/productModel")
const userModel = require("../../model/userModel")
const couponModel = require("../../model/couponModel")
const orderModel = require("../../model/orderModel")




const loadCheckout = async (req,res) => {
try {

    const variantId = req.query.variantId
    const quantity = parseInt(req.query.quantity)

    
    if (!req.session.user){
        return res.redirect("/login")
    }
    let coupon = null
    if (req.session.coupon) {
        coupon = req.session.coupon
    }
    const usedCouponCode = await orderModel.distinct("couponCode", {
        userId: req.session.user._id,
        couponCode: { $ne: null }
    })


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


        subtotal = quantity * Number(variant.offeredPrice)

        let total = subtotal + shipping
        let discount = 0
        if (coupon) {
            if (coupon.type === "percentage") {
                discount = total * (coupon.discountValue/100)
                if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                    discount = coupon.maxDiscount
                }
            } else {
                discount = coupon.discountValue
            }
        }
        total = total - discount

        
        const coupons = await couponModel.find({
            minPurchase : {$lte : total },
            expiryDate : {$gte : new Date()},
            $expr: {
                $gt: ["$maxUsage", "$usedCount"]
            },
            status : true,
            code : {$nin : usedCouponCode}
        })
        let cartCount = 0
        if (req.session.user){
            const cart = await cartModel.findOne({userId:req.session.user._id})
            cartCount = cart?.items.length
        }
        return res.render ("user/checkout",{
            variant,
            quantity,
            address,
            swalMessage,
            subtotal,
            shipping,
            total,
            coupons,
            discount,
            coupon,
            cartCount
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
        

        for (let item of cart.items) {
            let variant = item.variantId
            let price = variant.offeredPrice
            subtotal += price * item.quantity
        }

        let total = subtotal + shipping

        let discount = 0
        if (coupon) {
            if (coupon.type === "percentage") {
                discount = total * (coupon.discountValue/100)
                if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                    discount = coupon.maxDiscount
                }
            } else {
                discount = coupon.discountValue
            }
        }
        total = total - discount

        const coupons = await couponModel.find({
            minPurchase : {$lte : total },
            expiryDate : {$gte : new Date()},
            $expr: {
                $gt: ["$maxUsage", "$usedCount"]
            },
            status : true,
            code : {$nin : usedCouponCode}
        })

        let cartCount = 0
        if (req.session.user){
            const cart = await cartModel.findOne({userId:req.session.user._id})
            cartCount = cart?.items.length
        }
        return res.render ("user/checkout",{
            cart,
            address,
            swalMessage,
            subtotal,
            shipping,
            total,
            coupons,
            discount,
            coupon,
            cartCount
        })
    }
} catch (err) {
        console.log(err)
}
}

const loadPaymentFailure = async (req,res) => {
    try {

        const variantId = req.query.variantId
        let cartCount = 0
        if (req.session.user){
            const cart = await cartModel.findOne({userId:req.session.user._id})
            cartCount = cart?.items.length
        }
        return res.render("user/paymentFailure",{
            variantId,
            cartCount
    })
    } catch (err) {
        console.log(err)
    }
}

const applyCoupon = async (req,res) => {
    try {
        if (!req.session.user){
            return res.json({
                loginRequired:true
            })
        }
        const {couponCode} = req.body
        
        const coupon = await couponModel.findOne({code:couponCode})
        if (!coupon) {
            return res.json({
                success : false,
                message : "The Coupon Doesn't Exist"
            })
        }

        req.session.coupon = coupon

        return res.json({
            success : true,
            message : "Coupon Applied Successfully"
        })

    } catch (err) {
        console.log(err)
    }
}

const removeCoupon = async (req,res) => {
    try {
        if (!req.session.user){
            return res.json({
                loginRequired:true
            })
        }

        req.session.coupon = null

        return res.json({
            success : true,
            message : "Coupon Removed"
        })
    } catch (err) {
        console.log(err)
    }
}


module.exports = {
    loadCheckout,
    loadPaymentFailure,
    applyCoupon,
    removeCoupon
}