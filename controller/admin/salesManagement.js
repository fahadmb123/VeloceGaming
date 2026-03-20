const orderModel = require("../../model/orderModel")
const PDFDocument = require("pdfkit")
const ExcelJS = require("exceljs")


function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj)
}
const getOrderList = async (matchStage) => {
    const totalOrdersList = await orderModel.aggregate([
        {$match : matchStage},
        {$unwind : "$items"},
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                finalRevenue: { $sum: "$items.finalAmount" },
                totalDiscount: { $sum: "$items.couponDiscount" } ,
                totalAmount : { $sum : "$items.total"}
            }
        },
    ])
    return {totalOrdersList}
}



const loadSales = async (req,res) => {
    try {

        const { filter , start , end} = req.query
        let search = req.query.search || ""
        const inputSearch = search.toLowerCase().trim()


        let page = parseInt(req.query.page) || 1
        let limit = 10
        let skip = (page - 1) * limit


        const matchStage = {
            "items.status": "delivered"
        }

        let startDate, endDate

        const now = new Date()

        if (filter === "daily") {
            startDate = new Date(now.setHours(0,0,0,0))
            endDate = new Date()
        }
        else if (filter === "weekly") {
            startDate = new Date()
            startDate.setDate(startDate.getDate() - 7)
            endDate = new Date()
        }
        else if (filter === "yearly") {
            startDate = new Date(new Date().getFullYear(), 0, 1)
            endDate = new Date()
        }
        else if (filter === "custom") {
            startDate = new Date(start)
            endDate = new Date(end)
        }

        if (startDate && endDate) {
            
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }

        if (inputSearch) {
            matchStage.$or = [ 
                {orderId : {
                    $regex: inputSearch, $options: "i"
                }},
                {"shippingAddress.fullName":{
                    $regex: inputSearch, $options: "i"
                }}
            ]  
        }

        const orders = await orderModel.aggregate([
            {$match : matchStage},
            {$unwind : "$items"},
            {$sort : {_id:-1}},
            {$skip : skip},
            {$limit : limit}
        ])

        req.session.matchStage = matchStage

        /*const totalOrdersList = await orderModel.aggregate([
            {$match : matchStage},
            {$unwind : "$items"},
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    finalRevenue: { $sum: "$items.finalAmount" },
                    totalDiscount: { $sum: "$items.couponDiscount" } ,
                    totalAmount : { $sum : "$items.total"}
                }
             },
        ])*/
        const {totalOrdersList} = await getOrderList(matchStage)
        
        const totalOrders = totalOrdersList[0]?.totalOrders || 0
        const finalRevenue = totalOrdersList[0]?.finalRevenue || 0
        const totalDiscount = totalOrdersList[0]?.totalDiscount || 0
        const totalAmount = totalOrdersList[0]?.totalAmount || 0

        /*const totalAmount = orders.reduce((acc,curr)=>{
            return acc += curr.items?.total
        },0)

        const totalDiscount = orders.reduce((acc,curr)=>{
            return acc += curr.items?.couponDiscount
        },0)

        const finalRevenue = orders.reduce((acc,curr)=>{
            return acc += curr.items?.finalAmount
        },0)*/

        const totalPages = Math.ceil(totalOrders / limit)
        let startTo = start || 0
        let endTo = end || 0
        return res.render ("admin/sales",{
            orders,
            totalOrders,
            totalAmount,
            totalDiscount,
            finalRevenue,
            filter,
            currentPage: page,
            search:inputSearch,
            totalPages,
            startTo,
            endTo
        })
    } catch (err) {
        console.log(err)
    }
}





const exportPDF = async (req, res) => {
    const matchStage = req.session.matchStage

    const orders = await orderModel.aggregate([
        { $match: matchStage },
        { $unwind: "$items" }
    ])

    const doc = new PDFDocument({
        size: "A3",
        layout: "landscape",
        margin: 20
    })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf")

    doc.pipe(res)
    
    
    doc.fontSize(18).text("Sales Report", { align: "center" })
    doc.moveDown(2)

    
    const startX = 50
    let startY = 100

    const col1 = startX 
    const col2 = startX + 100
    const col3 = startX + 210
    const col4 = startX + 320
    const col5 = startX + 410
    const col6 = startX + 510
    const col7 = startX + 580
    const col8 = startX + 710
    const col9 = startX + 810
    const col10 = startX + 910

    
    doc.fontSize(12).text("Order ID", col1, startY)
    doc.text("Date", col2, startY)
    doc.text("Customer", col3, startY)
    doc.text("Discount", col4, startY)
    doc.text("Coupon Code", col5, startY)
    doc.text("Status", col6, startY)
    doc.text("Payment Method", col7, startY)
    doc.text("Payment Status", col8, startY)
    doc.text("Order Amount", col9, startY)
    doc.text("Final Amount", col10, startY)

    startY += 20

    
    doc.moveTo(startX, startY - 5)
       .lineTo(1030, startY - 5)
       .stroke()

    
    orders.forEach((order, index) => {
        doc.text(order.orderId.toString(), col1, startY)
        doc.text(new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        }), col2, startY)
        doc.text(order.shippingAddress.fullName.toUpperCase() || "No Name", col3, startY)
        doc.text(order.items?.couponDiscount === 0 ? "Not Applied" : order.items?.couponDiscount || 0, col4, startY)
        doc.text(order.couponCode || "Not Applied", col5, startY)
        doc.text(order.items.status.toString() || "Not Available", col6, startY)
        doc.text(order.paymentMethod === "cod" ? "Cash On Delivery" : order.paymentMethod.toString(), col7, startY)
        doc.text(order.items.paymentStatus.toString(), col8, startY)
        doc.text(order.items.total.toString() || 0, col9, startY)
        doc.text(order.items.finalAmount.toString() || 0, col10, startY)

        startY += 20

        
        if (startY > 1000) {
            doc.addPage()
            startY = 50
        }
    })

    doc.end()
}



const exportExcel = async (req, res) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Sales Report")

    worksheet.columns = [
        { header: "Order ID", key: "orderId", width: 25 },
        { header: "Date", key: "date", width: 20 },
        { header: "Customer", key: "customer", width: 20 },
        { header: "Discount", key: "discount", width: 15 },
        { header: "Coupon Code", key: "couponCode", width: 20 },
        { header: "Status", key: "status", width: 15 },
        { header: "Payment Method", key: "paymentMethod", width: 20 },
        { header: "Payment Status", key: "paymentStatus", width: 20 },
        { header: "Order Amount", key: "orderAmount", width: 15 },
        { header: "Final Amount", key: "finalAmount", width: 15 }
    ]

    const matchStage = req.session.matchStage

    const orders = await orderModel.aggregate([
        { $match: matchStage },
        { $unwind: "$items" },
        { $sort: { _id: -1 } }
    ])

    
    const formattedData = orders.map(order => ({
        orderId: order.orderId.toString(),
        date: new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        }),
        customer: order.shippingAddress?.fullName || "-",
        orderAmount: `₹ ${order.items?.total}` || 0,
        discount: order.items?.couponDiscount === 0 ? "Not Applied" : `-₹ ${order.items?.couponDiscount}` || 0,
        couponCode: order.couponCode || "No Coupon Code",
        status: order.items?.status || "No Status",
        finalAmount: `₹ ${order.items?.finalAmount}` || 0,
        paymentMethod : order.paymentMethod === "cod" ? "Cash On Delivery" : order.paymentMethod || "Nothing",
        paymentStatus : order.items?.paymentStatus || "No Status"
    }))

    
    formattedData.forEach(row => {
        worksheet.addRow(row)
    })

    
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=report.xlsx"
    )

    await workbook.xlsx.write(res)
    res.end()
}



module.exports = {
    loadSales,
    exportPDF,
    exportExcel
}