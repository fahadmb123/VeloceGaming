const couponModel = require("../../model/couponModel")
const {
    couponSchema
} = require("../../helpers/validators")



const addCoupon = async (req) => {
    try {
        const validate = couponSchema.safeParse(req.body)

        if (!validate.success) {
            const message = validate.error.issues[0].message
            return {validateMessage:message}
        }
        
        const {
            couponCode,
            discountType,
            discountValue,
            minPurchase,
            maxDiscount,
            expDate,
            maxUsage
        } = validate.data

        const isExist = await couponModel.findOne({code:couponCode})

        if (isExist) {
            return {failMessage : "Coupon Code Already Exist"}
        }

        const newCoupon = new couponModel({
            code :couponCode,
            type : discountType,
            discountValue,
            minPurchase,
            maxDiscount,
            expiryDate : expDate,
            maxUsage
        })
        await newCoupon.save()

        return {message:"Coupon Added Successfully"}
    } catch (err) {
        console.log(err)
    }
}

const editCoupon = async (req) => {
    try {

        const validate = couponSchema.safeParse(req.body)

        if (!validate.success) {
            const message = validate.error.issues[0].message
            return {validateMessage:message}
        }

        const {
            couponCode,
            discountType,
            discountValue,
            minPurchase,
            maxDiscount,
            expDate,
            maxUsage
        } = validate.data
        const couponId = req.query.id
        
        const expDateFinal = new Date(expDate)

        let isEdited = true
        const oldCoupon = await couponModel.findOne({_id:couponId})
        if (!oldCoupon) {
            return {failMessage: "Coupon Doesn't Exist"}
        }

        const couponCodeExit = await couponModel.findOne({code:couponCode})
        if (couponCodeExit && couponCode !== oldCoupon?.code) {
            return {failMessage: "Coupon Code Already Exist"}
        }
        
        if (oldCoupon?.code == couponCode && oldCoupon?.type == discountType && oldCoupon?.discountValue == discountValue && oldCoupon?.minPurchase == minPurchase && oldCoupon?.maxDiscount == maxDiscount && oldCoupon?.expiryDate.getTime() == expDateFinal.getTime() && oldCoupon?.maxUsage == maxUsage){
            isEdited = false
        }

        await couponModel.updateOne(
            {_id:couponId},
            {
                $set : {
                    code : couponCode,
                    type : discountType,
                    discountValue,
                    minPurchase,
                    maxDiscount : maxDiscount ?? null,
                    expiryDate : expDate,
                    maxUsage
                }
            }
        )
        let message = 'No Changes'
        if (isEdited) {
            message = "Updated"
        }
        return {message}
    } catch (err) {
        console.log(err)
    }
}



module.exports = {
    addCoupon,
    editCoupon
}