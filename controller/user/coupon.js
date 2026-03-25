const orderModel = require("../../model/orderModel")
const couponModel = require("../../model/couponModel")
const cartModel = require("../../model/cartModel")



const loadCoupon = async (req,res) => {
    try {

        

        const usedCouponCode = await orderModel.distinct("couponCode", {
            userId: req.session.user._id,
            couponCode: { $ne: null }
        })
        

        const coupons = await couponModel.find({
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
        return res.render("user/coupon",{
            coupons,
            cartCount
        })
    } catch (err) {
        console.log(err)
    }
}




module.exports = {
    loadCoupon
}