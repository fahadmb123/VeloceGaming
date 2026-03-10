const orderModel = require("../../model/orderModel")
const {z, success} = require("zod")
const orderManagementService = require("../../service/admin/orderManagementService")

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)

    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return `${seconds} sec ago`
    if (minutes < 60) return `${minutes} min ago`
    if (hours < 24) return `${hours} hr ago`
    return `${days} day ago`
}

const validateQuery = z.object({
    orderItemId : z.string().min(1),
    orderId : z.string().min(1)
})



const loadOrderManagement = async (req,res) => {
    try {

        if (!req.session.admin) {
            return res.redirect ("/admin/login")
        }

        const orders = await orderModel.find()

        let notifications = []
        let notificationsCount = 0
        
        orders.forEach((order,index)=>{
            order.items.forEach((item,index)=>{
                if (item?.returnRequest?.status !== "pending") {
                    return
                }
                const time = timeAgo(item?.returnRequest?.requestedAt)
                const notification = {
                    itemId : item._id,
                    orderId : order._id,
                    showOrderId : order.orderId,
                    reason : item?.returnRequest?.reason,
                    description : item?.returnRequest?.description,
                    time : time,
                    status : item?.returnRequest?.status,
                    name : order?.shippingAddress?.fullName
                }
                notificationsCount++
                notifications.unshift(notification)
            })
        })




        return res.render("admin/orderManagement",{
            orders,
            notifications,
            notificationsCount
        })

    } catch (err) {
        console.log(err)
    }
}

const loadOrderDetails = async (req,res) => {
    try {

        if (!req.session.admin) {
            return res.redirect("/admin/login")
        }

        const queryValidated = validateQuery.safeParse(req.query)

        if (!queryValidated.success){
            return res.status(400).send("Can't Validate")
        }
        const {orderItemId,orderId} = queryValidated.data

        const order = await orderModel.findOne({_id:orderId})

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


        const orderItem = order?.items.find(item => {
            return item._id.toString() === orderItemId.toString()
        })

        return res.render("admin/orderDetails",{
            orderItem,
            order
        })

    } catch (err) {
        console.log(err)
    }
}




const updateOrderStatus = async (req,res) => {
    try {
        if (!req.session.admin){
            return {loginRequuired : true}
        }


        const {message,validated} = await orderManagementService.updateOrderStatus(req)

        if (validated) {
            return res.json({
                success : false,
                message : "Can't Validate"
            })
        }

        if (message) {
            return res.json({
                success : true,
                message 
            })
        }
    } catch (err) {
        console.log(err)
    }
}

const returnRequestAccept = async (req,res) => {
    try {

        if (!req.session.admin) {
            return {loginRequuired : true}
        } 

        const {validate,message} = await orderManagementService.returnRequestAccept(req)

        if (validate) {
            return res.json({
                success : false,
                message : "Can't Validate"
            })
        }

        if (message) {
            return res.json({
                success : true,
                message 
            })
        }

    } catch (err) {
        console.log(err)
    }    
}

const rejectReturnRequest = async (req,res) => {
    try {
        if (!req.session.admin) {
            return {loginRequuired : true}
        }

        const {validate,message} = await orderManagementService.rejectReturnRequest(req)

        if (validate) {
            return res.json({
                success : false,
                message : "Can't Validate"
            })
        }

        if (message) {
            return res.json({
                success : true,
                message 
            })
        }

    } catch (err) {
        console.log(err)
    }
}
module.exports = {
    loadOrderManagement,
    loadOrderDetails,
    updateOrderStatus,
    returnRequestAccept,
    rejectReturnRequest
}