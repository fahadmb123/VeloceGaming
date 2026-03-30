const userModel = require("../model/userModel")
const {variantModel} = require("../model/productModel")
const orderModel = require("../model/orderModel")
const cartModel = require("../model/cartModel")
const {z} = require("zod")
const { walletModel, walletTransactionModel } = require("../model/walletModel")
const couponModel = require("../model/couponModel")



const validateBody = z.object({
    orderId : z.string().min(1),
    orderItemId : z.string().min(1),
    reason : z.string().min(1),
    description : z.string().min(10)
})



const calculateAmount = async (req) => {

    const variantId = req.query.variantId
    const quantity = parseInt(req.query.quantity)
    let coupon = null
    let discount = 0
    if (req.session.coupon) {
        coupon = req.session.coupon
    }


    if (variantId){

        const variant = await variantModel.findById(variantId)

        let total = quantity * variant.offeredPrice

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


        return {amount:total}
    }

    const cart = await cartModel.findOne({userId:req.session.user._id})
        .populate("items.variantId")

    let subtotal = 0

    cart.items.forEach(item=>{
        subtotal += item.quantity * item.variantId.offeredPrice
    })
    
    if (coupon) {
        if (coupon.type === "percentage") {
            discount = subtotal * (coupon.discountValue/100)
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount
            }
        } else {
            discount = coupon.discountValue
        }
    }
    subtotal = subtotal - discount

    
    return {amount: subtotal}
}

const  walletPayment = async (amount,req) => {
    const  wallet = await walletModel.findOne({userId:req.session.user._id})
    if (amount > wallet.balance){
        return {failMessage:"Inefficient Balance"}
    }

    await walletModel.updateOne(
        {userId:req.session.user._id},
        {
            $inc : {"balance" : -amount}
        }
    )
    const transaction = new walletTransactionModel({
        type : "debit",
        userId : req.session.user._id,
        amount : amount,
        reason : "orderpayment"
    })
    await transaction.save()

    return {success : true}
}





const placeOrder = async (req) => {
    try {

        
        const variantId = req.query.variantId ? req.query.variantId : req.session.variantId
        const quantity =  parseInt(req.query.quantity ? req.query.quantity : req.session.quantity)
        req.session.quantity = null
        req.session.variantId = null
        const {paymentMethod,addressId} = req.body
        let coupon = null
        if (req.session.coupon) {
            coupon = req.session.coupon
        }
        

        const user = await userModel.findOne({_id:req.session.user._id})
        let address = user.address
        
        const currentAddress = address.find(obj => {
            return obj._id == addressId
        })

        
        if (!currentAddress){
            return {failMessage : "Please Add Address"}
        }

        if (!paymentMethod) {
            return {failMessage : "Please Choose A Payment Method"}
        }
        

        if (variantId) {

            // BuyNow Ivide Nadakkum
            const variant = await variantModel.findOne({_id:variantId})
            .populate({
                path: "productId",
                populate : {
                    path : "categoryId"
                }
            })
            if (!quantity || !variant || !variant.status || variant.productId.isDeleted || variant.productId.categoryId.isDeleted) {
                return {failMessage : "Product Not Available"}
            }

            if (variant.stock < quantity) {
                return {failMessage : "Stock Not Available For This Product"}
            }

            // Calculation nadakkunnu

            let subtotal = 0
            let shipping = 0
            

            //subtotal = quantity * Number(variant.offeredPrice)
            const total = quantity * Number(variant.offeredPrice)
            subtotal = total
            const totalAmount = subtotal + shipping

            let discount = 0

            if (coupon) {
                const originalCoupon = await couponModel.findOne({
                    minPurchase : {$lte : totalAmount },
                    expiryDate : {$gte : new Date()},
                    $expr: {
                        $gt: ["$maxUsage", "$usedCount"]
                    },
                    status : true,
                    code : coupon.code
                })

                if (!originalCoupon) {
                    return {failMessage : "Coupon Not Availbale"}
                }
                const isUsed = await orderModel.findOne({userId : req.session.user._id,couponCode : coupon.code})

                if (isUsed) {
                    return {failMessage : "Coupon is Already Used"}
                }

                if (coupon.type === "percentage") {
                    discount = totalAmount * (coupon.discountValue/100)
                    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                        discount = coupon.maxDiscount
                    }
                } else {
                    discount = coupon.discountValue
                }
            }
            
            
            let finalAmount = totalAmount - discount


            let paymentStatus = "pending"
            if (paymentMethod != "cod") {
                paymentStatus = "paid"
            }
            if (paymentMethod === "Wallet") {
                const {failMessage , success} = await walletPayment(finalAmount,req)
                if (failMessage) {
                    return {failMessage}
                }
            }
            itemCouponShare = (totalAmount / totalAmount) * discount
            const order = new orderModel ({
                userId : req.session.user._id,
                items : [
                    {
                        variantId : variant._id,
                        productName : variant.productId.name,
                        productImage : variant.images[0],
                        attributes : variant.attributes,
                        quantity : quantity,
                        price : variant.offeredPrice,
                        total : total,
                        paymentStatus : paymentStatus,
                        couponDiscount : itemCouponShare,
                        finalAmount : finalAmount
                    }
                ],
                subtotal : subtotal,
                shippingCharge : shipping,
                totalAmount : totalAmount,
                discountAmount : discount,
                finalAmount : finalAmount,
                shippingAddress : currentAddress,
                paymentMethod : paymentMethod,
                couponCode : coupon?.code || null
            })
            await order.save()
            await variantModel.updateOne(
                {_id:variantId},
                {
                    $inc : {"stock":-1}
                }
            )

            if (coupon) {
                await couponModel.updateOne(
                    {code:coupon.code},
                    {
                        $inc : {"usedCount" : 1}
                    }
                )
            }
            req.session.coupon = null
            return {message : true,orderObjectId : order._id}

        } else {

            // Cart Full Here

            const cart = await cartModel.findOne({userId:req.session.user._id}).populate({path:"items.variantId",populate:{path:"productId",populate:{path:"categoryId"}}})
            const items = cart.items
            let products = []
            let subtotal = 0
            let shipping = 0
            let discount = 0

            
            subtotal = items.reduce((acc,item) => {
                let total = item.quantity * item.variantId.offeredPrice
                acc = acc + total
                return acc
            },0)

            let totalAmount = subtotal + shipping

            if (coupon) {
                const originalCoupon = await couponModel.findOne({
                    minPurchase : {$lte : totalAmount },
                    expiryDate : {$gte : new Date()},
                    $expr: {
                        $gt: ["$maxUsage", "$usedCount"]
                    },
                    status : true,
                    code : coupon.code
                })

                if (!originalCoupon) {
                    return {failMessage : "Coupon Not Availbale"}
                }
                const isUsed = await orderModel.findOne({userId : req.session.user._id,couponCode : coupon.code})

                if (isUsed) {
                    return {failMessage : "Coupon is Already Used"}
                }

                if (coupon.type === "percentage") {
                    discount = totalAmount * (coupon.discountValue/100)
                    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                        discount = coupon.maxDiscount
                    }
                } else {
                    discount = coupon.discountValue
                }
            }

            for (let item of items) {

                const variant = item.variantId
                const quantity = item.quantity

                if (!quantity || !variant || !variant.status || variant.productId.isDeleted || variant.productId.categoryId.isDeleted) {
                    return {failMessage : "Some Products Are Not Available"}
                }

                if (variant.stock < quantity) {
                    return {failMessage : "Stock Not Available For Some Products"}
                }

                let total = quantity * variant.offeredPrice

                //subtotal += total
                itemCouponShare = (total / totalAmount) * discount
                let itemFinalPrice = total - itemCouponShare
                let product = {
                    variantId : variant._id,
                    productName : variant.productId.name,
                    productImage : variant.images[0],
                    attributes : variant.attributes,
                    quantity : quantity,
                    price : variant.offeredPrice,
                    total : total,
                    couponDiscount : itemCouponShare,
                    finalAmount : itemFinalPrice
                }
                if (paymentMethod != "cod") {
                    product.paymentStatus = "paid"
                }

                products.push(product)
            }

            let finalAmount = totalAmount - discount

            if (paymentMethod === "Wallet") {
                const {failMessage , success} = await walletPayment(finalAmount,req)
                if (failMessage) {
                    return {failMessage}
                }
            }

            const order = new orderModel ({
                userId : req.session.user._id,
                items : products,
                subtotal : subtotal,
                shippingCharge : shipping,
                totalAmount : totalAmount,
                discountAmount : discount,
                finalAmount : finalAmount,
                shippingAddress : currentAddress,
                paymentMethod : paymentMethod,
                couponCode : coupon?.code || null
            })
            
            for (let item of items) {
                let variantId = item.variantId
                let quantity = item.quantity
                await variantModel.updateOne(
                    {_id:variantId},
                    {
                        $inc : {"stock":-quantity}
                    }
                )
            }
            if (coupon) {
                await couponModel.updateOne(
                    {code:coupon.code},
                    {
                        $inc : {"usedCount" : 1}
                    }
                )
            }
            req.session.coupon = null
            await cartModel.deleteOne({userId:req.session.user._id})
            await order.save()
            
            return {message : true,orderObjectId : order._id}
        }

    } catch (err) {
        console.log(err)
    }
}

const cancelOrder = async (req) => {
    try {
        
        const validatedBody = validateBody.safeParse(req.body)
        if (!validatedBody.success) {
            return {validateBody : true}
        }

        const {orderId,orderItemId,reason,description} = validatedBody.data

        const order = await orderModel.findOne({_id:orderId})
        const items = order.items

        const orderItem = items.find( item => {
            return item._id.toString() === orderItemId.toString()
        })

        const coupon = await couponModel.findOne({code:order.couponCode})
        
        let cancelCondition = order.subtotal - orderItem.price
        let cancellable = cancelCondition >= coupon.minPurchase
        if (!cancellable){
            return {failMessage : `You Can't Cancel Becouse Of Coupon Min Is ${coupon.minPurchase}`}
        }
    
        if (orderItem.status !== 'placed') {
            return {placedRequired : true}
        }
        let paymentStatus = "closed"
        if (order.paymentMethod != "cod") {
            paymentStatus = "refunded"
            let refund = orderItem?.total - orderItem?.couponDiscount
            await walletModel.updateOne(
                {userId : req.session.user._id},
                {
                    $inc : {"balance" : refund}
                }
            )
            const transaction = new walletTransactionModel({
                type : "credit",
                userId : req.session.user._id,
                amount : refund,
                reason : "refunded"
            })
            await transaction.save()
        }

        await orderModel.updateOne(
            {_id:orderId,"items._id":orderItemId},
            {
                $set : {
                    "items.$.cancelReason" : reason,
                    "items.$.cancelDescription" : description,
                    "items.$.status" : "cancelled",
                    "items.$.paymentStatus" : paymentStatus
                }
            }
        )
        await variantModel.updateOne(
            {_id:orderItem.variantId},
            {
                $inc : {"stock":1}
            }
        )

        return {message : "Product Cancelled"}

    } catch (err) {
        console.log(err)
    }
}

const returnOrder = async (req) => {
    try {

        const validatedBody = validateBody.safeParse(req.body)
        if (!validatedBody.success) {
            return {validateBody : true}
        }

        const {orderId,orderItemId,reason,description} = validatedBody.data

        const order = await orderModel.findOne({_id:orderId})
        const items = order.items

        const orderItem = items.find( item => {
            return item._id.toString() === orderItemId.toString()
        })
        const coupon = await couponModel.findOne({code:order.couponCode})
        
        let returnCondition = order.subtotal - orderItem.price
        let returnable = returnCondition >= coupon.minPurchase
        if (!returnable){
            return {failMessage : `You Can't Return Becouse Of Coupon Min Is ${coupon.minPurchase}`}
        }

        if (!orderItem.status === 'delivered') {
            return {failMessage : "Request Is Not Available For This Status"}
        }

        await orderModel.updateOne(
            {_id:orderId,"items._id":orderItemId},
            {
                $set : {
                    "items.$.returnRequest.reason" : reason,
                    "items.$.returnRequest.description" : description,
                    "items.$.returnRequest.status" : "pending",
                    "items.$.returnRequest.requestedAt" : new Date()
                }
            }
        )

        return {message : "Rquested For Return"}

    } catch (err) {
        console.log(err)
    }
}




module.exports = {
    placeOrder,
    cancelOrder,
    returnOrder,
    calculateAmount
}