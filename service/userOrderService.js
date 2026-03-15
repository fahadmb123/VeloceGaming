const userModel = require("../model/userModel")
const {variantModel} = require("../model/productModel")
const orderModel = require("../model/orderModel")
const cartModel = require("../model/cartModel")
const {z} = require("zod")
const { walletModel, walletTransactionModel } = require("../model/walletModel")



const validateBody = z.object({
    orderId : z.string().min(1),
    orderItemId : z.string().min(1),
    reason : z.string().min(1),
    description : z.string().min(10)
})



const calculateAmount = async (req) => {

    const variantId = req.query.variantId
    const quantity = parseInt(req.query.quantity)
    
    if (variantId){

        const variant = await variantModel.findById(variantId)

        const total = quantity * variant.offeredPrice

        return {amount:total}
    }

    const cart = await cartModel.findOne({userId:req.session.user._id})
        .populate("items.variantId")

    let subtotal = 0

    cart.items.forEach(item=>{
        subtotal += item.quantity * item.variantId.offeredPrice
    })

    return {amount: subtotal}
}






const placeOrder = async (req) => {
    try {

        
        const variantId = req.query.variantId ? req.query.variantId : req.session.variantId
        const quantity =  parseInt(req.query.quantity ? req.query.quantity : req.session.quantity)
        req.session.quantity = null
        req.session.variantId = null
        const {paymentMethod,addressId} = req.body
        

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

            let finalAmount = totalAmount - discount

            let paymentStatus = "pending"
            if (paymentMethod != "cod") {
                paymentStatus = "paid"
            }
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
                        paymentStatus : paymentStatus
                    }
                ],
                subtotal : subtotal,
                shippingCharge : shipping,
                totalAmount : totalAmount,
                discountAmount : discount,
                finalAmount : finalAmount,
                shippingAddress : currentAddress,
                paymentMethod : paymentMethod
            })
            await order.save()
            await variantModel.updateOne(
                {_id:variantId},
                {
                    $inc : {"stock":-1}
                }
            )
            

            
            return {message : true,orderObjectId : order._id}

        } else {

            // Cart Full Here

            const cart = await cartModel.findOne({userId:req.session.user._id}).populate({path:"items.variantId",populate:{path:"productId",populate:{path:"categoryId"}}})
            const items = cart.items
            let products = []
            let subtotal = 0
            let shipping = 0
            let discount = 0

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

                subtotal += total
                
                let product = {
                    variantId : variant._id,
                    productName : variant.productId.name,
                    productImage : variant.images[0],
                    attributes : variant.attributes,
                    quantity : quantity,
                    price : variant.offeredPrice,
                    total : total
                }
                if (paymentMethod != "cod") {
                    product.paymentStatus = "paid"
                }

                products.push(product)
            }

            let totalAmount = subtotal + shipping

            let finalAmount = totalAmount - discount
            const order = new orderModel ({
                userId : req.session.user._id,
                items : products,
                subtotal : subtotal,
                shippingCharge : shipping,
                totalAmount : totalAmount,
                discountAmount : discount,
                finalAmount : finalAmount,
                shippingAddress : currentAddress,
                paymentMethod : paymentMethod
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
            
            await cartModel.deleteOne({userId:req.session.user._id})
            await order.save()
            console.log("ordered Successfully")
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
    
        if (orderItem.status !== 'placed') {
            return {placedRequired : true}
        }
        let paymentStatus = "closed"
        if (order.paymentMethod != "cod") {
            paymentStatus = "refunded"
            await walletModel.updateOne(
                {userId : req.session.user._id},
                {
                    $inc : {"balance" : orderItem?.total}
                }
            )
            const transaction = new walletTransactionModel({
                type : "credit",
                userId : req.session.user._id,
                amount : orderItem?.total,
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