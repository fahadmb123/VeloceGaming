const userOrderService = require("../../service/userOrderService")
const orderModel = require("../../model/orderModel")
const {z} = require("zod")
const html_to_pdf = require("html-pdf-node")
const ejs = require("ejs")
const path = require("path")

const validate = z.object({
    id : z.string().min(1)
})



const loadOrderSuccessPage = async (req,res) => {
    try {

        const orderObjectId = req.query.id
 
        const order = await orderModel.findOne({_id:orderObjectId})
        
        return res.render("user/orderSuccessPage",{
            order
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

        return res.render("user/orderDetails",{
            order,
            orderItem
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
        .sort({_id:-1})
        .skip(skip)
        .limit(limit)

        const totalOrder = await orderModel.countDocuments(filter)
        const totalPages = Math.ceil(totalOrder / limit)

        orders.forEach(order => {
            order?.items.forEach(item => {
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
        })
        return res.render("user/orderHistory",{
            orders,
            totalPages,
            currentPage: page,
            search:inputSearch,
            filter: statusFilter
        })
    } catch (err) {
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
    downloadInvoice
}