const userOrderService = require("../../service/userOrderService")
const orderModel = require("../../model/orderModel")
const cartModel = require("../../model/cartModel")
const {z} = require("zod")
const html_to_pdf = require("html-pdf-node")
const ejs = require("ejs")
const path = require("path")
const razorpay = require("../../helpers/razorpay")
const crypto = require("crypto")
const validate = z.object({
    id : z.string().min(1)
})



const loadOrderSuccessPage = async (req,res) => {
    try {

        const orderObjectId = req.query.id

        if(!orderObjectId){
            return res.redirect("/orderHistory")
        }

        const order = await orderModel.findOne({_id:orderObjectId})
        let cartCount = 0
        if (req.session.user){
            const cart = await cartModel.findOne({userId:req.session.user._id})
            cartCount = cart?.items.length
        }
        return res.render("user/orderSuccessPage",{
            order,
            cartCount
        })
    } catch (err) {
        console.log(err)
    }
}

const loadOrderDetails = async (req,res) => {
    try {

        if (!req.session.user) {
            return res.redirect("/login")
        }
        const validated = validate.safeParse(req.query)

        if (!validated.success) {
            return res.status(400).send("Invalid")
        }
        const {id} = validated.data
        const order = await orderModel.findOne({"items._id":id})


        order?.items.forEach (item => {
            const colorAttr = item.attributes?.find(a => a.key === "color");
            let parsedColor = { name: "", hex: "#000000" };

            if (colorAttr && colorAttr.value) {
                try {
                    parsedColor = JSON.parse(colorAttr.value);
                } catch {
                    parsedColor = { name: colorAttr.value, hex: "#000000" };
                }
            }
            item.colorName = parsedColor.name
            item.colorHex = parsedColor.hex          
        })

        let orderItem = order?.items.find(item => {
            return item._id.toString() === id.toString()
        })
        let cartCount = 0
                if (req.session.user){
                    const cart = await cartModel.findOne({userId:req.session.user._id})
                    cartCount = cart?.items.length
                }
        return res.render("user/orderDetails",{
            order,
            orderItem,
            cartCount
        })
    } catch (err) {
        console.log(err)
    }
}

const loadOrderHistory = async (req,res) => {
    try {

        if (!req.session.user) {
            return res.redirect("/login")
        }

        let page = parseInt(req.query.page) || 1
        let limit = 10
        let skip = (page - 1) * limit

        let filter = {}

        let search = req.query.search || ""
        let inputSearch = search.trim()
        let statusFilter = req.query.filter || "all"

        if (inputSearch) {
            filter.$or = [ 
                {orderId : {
                    $regex: inputSearch, $options: "i"
                }},
                {"items.productName":{
                    $regex: inputSearch, $options: "i"
                }}
            ]  
        }
        
        if (statusFilter !== "all") {
            filter["items.status"] = statusFilter
        }
        filter.userId = req.session.user._id

        const orders = await orderModel.find(filter)
        
        let orderItems = []

        orders?.forEach ((order,index) => {
            order?.items.forEach(item=>{
                if(statusFilter !== "all" && item.status !== statusFilter){
                    return
                }

                const colorAttr = item.attributes?.find(a => a.key === "color")

                let parsedColor = { name: "", hex: "#000000" }

                if (colorAttr && colorAttr.value) {
                    try {
                        parsedColor = JSON.parse(colorAttr.value)
                    } catch {
                        parsedColor = { name: colorAttr.value, hex: "#000000" }
                    }
                }

                item.colorName = parsedColor.name
                item.colorHex = parsedColor.hex
                orderItems.unshift({
                    _id : order._id,
                    paymentMethod : order.paymentMethod ,
                    orderId : order.orderId,
                    showOrderId : order.orderId,
                    item : item,
                    shippingAddress : order.shippingAddress,
                    createdAt : order.createdAt
                })
            })
        })
        

        
        const totalOrder = orderItems.length
        const totalPages = Math.ceil(totalOrder / limit)

        let paginatedItems = orderItems.slice(skip, skip + limit)
        let cartCount = 0
                if (req.session.user){
                    const cart = await cartModel.findOne({userId:req.session.user._id})
                    cartCount = cart?.items.length
                }
        return res.render("user/orderHistory",{
            orders:paginatedItems,
            totalPages,
            currentPage: page,
            search:inputSearch,
            filter: statusFilter,
            cartCount
        })
    } catch (err) {
        console.log(err)
    }
}







const verifyRazorpayPayment = async (req,res)=>{
    try{

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body

        const body = razorpay_order_id + "|" + razorpay_payment_id

        const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex")

        if(expectedSignature === razorpay_signature){

           
           req.session.variantId = req.body.variantId
           req.session.quantity = req.body.quantity
           const {failMessage,message,orderObjectId} = await userOrderService.placeOrder(req)

            if (failMessage) {
                return res.json({
                    success : false,
                    message : failMessage
                })
            }

            if (message) {
                return res.json({
                    success : true,
                    orderObjectId
                })
            }
        }else{
            res.json({
                success:false
            })
        }

    }catch(err){
        console.log(err)
    }
}

const placeOrder = async (req,res) => {
    try {

        if (!req.session.user){
            return res.json ({
                loginRequired : true
            })
        }
        const {paymentMethod} = req.body

        if(paymentMethod === "Razorpay"){

            const {amount} = await userOrderService.calculateAmount(req)

            const options = {
                amount: Math.round(amount * 100),
                currency: "INR",
                receipt: "receipt_" + Date.now()
            }

            const razorpayOrder = await razorpay.orders.create(options)

            return res.json({
                razorpay : true,
                key : process.env.RAZORPAY_KEY_ID,
                order : razorpayOrder
            })
        }

        const {failMessage,message,orderObjectId} = await userOrderService.placeOrder(req)

        if (failMessage) {
            return res.json({
                success : false,
                message : failMessage
            })
        }

        if (message) {
            return res.json({
                success : true,
                orderObjectId
            })
        }
    } catch (err) {
        console.log(err)
    }
}

const cancelOrder = async (req,res) => {
    try {

        if (!req.session.user) {
            return {loginRequired : true}
        }

        const {validateBody,placedRequired,message} = await userOrderService.cancelOrder(req)


        if (validateBody) {
            return res.json({
                success : false,
                message : "Incorrect Validation"
            })
        }
        if (placedRequired) {
            return res.json({
                success : false,
                message : "You Cannot Cancel The Order"
            })
        }
        if (message) {
            return res.json({
                success : true,
                message : message
            })
        }

    } catch (err) {
        console.log(err)
    }

}

const returnOrder = async (req,res) => {
    try {

        if (!req.session.user) {
            return {loginRequired : true}
        }

        const {validateBody,failMessage,message} = await userOrderService.returnOrder(req)

        if (validateBody) {
            return res.json({
                success : false,
                message : "Incorrect Validation"
            })
        }

        if (failMessage) {
            return res.json({
                success : false,
                message : failMessage
            })
        }

        if (message) {
            return res.json({
                success : true,
                message : message
            })
        }

    } catch (err) {
        console.log(err)
    }   
}


const downloadInvoice = async (req,res)=>{
    try{

        const {orderId,itemId} = req.query

        const order = await orderModel.findById(orderId)

        const orderItem = order.items.find(
            item => item._id.toString() === itemId
        )

        const filePath = path.join(__dirname,"../../views/user/invoice.ejs")

        const html = await ejs.renderFile(filePath,{
            order,
            orderItem
        })

        const options = {format:"A4"}

        const file = {content:html}

        const pdfBuffer = await html_to_pdf.generatePdf(file,options)

        res.setHeader("Content-Type","application/pdf")
        res.setHeader("Content-Disposition","attachment; filename=invoice.pdf")

        res.send(pdfBuffer)

    }catch(err){
        console.log(err)
    }
}







module.exports = {
    placeOrder,
    loadOrderSuccessPage,
    loadOrderDetails,
    loadOrderHistory,
    cancelOrder,
    returnOrder,
    downloadInvoice,
    verifyRazorpayPayment
}