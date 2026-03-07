const userModel = require("../model/userModel")
const {variantModel} = require("../model/productModel")
const orderModel = require("../model/orderModel")
const cartModel = require("../model/cartModel")


const placeOrder = async (req) => {
    try {

        
        const variantId = req.query.variantId
        const quantity = parseInt(req.query.quantity)
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
                        total : total
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





module.exports = {
    placeOrder
}