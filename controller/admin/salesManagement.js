const orderModel = require("../../model/orderModel")
const PDFDocument = require("pdfkit")
const ExcelJS = require("exceljs")




const buildMatchStage = (query) => {

    let { filter, start, end, search } = query;

    
    const getISTDate = (date = new Date()) => {
        return new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    };

    const now = getISTDate();

    const matchStage = {
        "items.status": "delivered"
    };

    
    if (!filter) {
        filter = "daily";
    }

    let startDate, endDate;

    
    if (filter === "daily") {
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
    }

    else if (filter === "weekly") {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
    }

    else if (filter === "yearly") {
        startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
    }

    else if (filter === "custom") {
        if (start && end) {
            startDate = new Date(start);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(end);
            endDate.setHours(23, 59, 59, 999); // ✅ VERY IMPORTANT
        }
    }

    
    if (startDate && endDate) {
        matchStage.createdAt = {
            $gte: startDate,
            $lte: endDate
        };
    }

    
    if (search) {
        const inputSearch = search.trim();

        matchStage.$or = [
            {
                orderId: {
                    $regex: inputSearch,
                    $options: "i"
                }
            },
            {
                "shippingAddress.fullName": {
                    $regex: inputSearch,
                    $options: "i"
                }
            }
        ];
    }

    return matchStage;
};

const getOrderList = async (matchStage) => {
    const totalOrdersList = await orderModel.aggregate([
        { $unwind: "$items" },
        { $match: {
            ...matchStage
        }},
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                finalRevenue: { $sum: "$items.finalAmount" },
                totalDiscount: { $sum: "$items.couponDiscount" },
                totalAmount: { $sum: "$items.total" }
            }
        }
    ])

    return { totalOrdersList }
}

const loadSales = async (req, res, next) => {
    try {
        let page = parseInt(req.query.page) || 1
        let limit = 10
        let skip = (page - 1) * limit

        const matchStage = buildMatchStage(req.query)

        const orders = await orderModel.aggregate([
            { $unwind: "$items" },
            { $match: {
                ...matchStage
            }},
            { $sort: { _id: -1 } },
            { $skip: skip },
            { $limit: limit }
        ])

        const { totalOrdersList } = await getOrderList(matchStage)

        const totalOrders = totalOrdersList[0]?.totalOrders || 0
        const finalRevenue = totalOrdersList[0]?.finalRevenue || 0
        const totalDiscount = totalOrdersList[0]?.totalDiscount || 0
        const totalAmount = totalOrdersList[0]?.totalAmount || 0

        const totalPages = Math.ceil(totalOrders / limit)

        return res.render("admin/sales", {
            orders,
            totalOrders,
            totalAmount,
            totalDiscount,
            finalRevenue,
            filter: req.query.filter || "",
            currentPage: page,
            search: req.query.search || "",
            totalPages,
            startTo: req.query.start || "",
            endTo: req.query.end || ""
        })

    } catch (err) {
        next(err)
    }
}



const exportPDF = async (req, res) => {

    const matchStage = buildMatchStage(req.query) // ✅ FIXED

    const orders = await orderModel.aggregate([
        { $unwind: "$items" },
        { $match: {
            ...matchStage
        }},
        {$sort : {_id : -1}}
    ])

    const { totalOrdersList } = await getOrderList(matchStage)

    const totalOrders = totalOrdersList[0]?.totalOrders || 0
    const finalRevenue = totalOrdersList[0]?.finalRevenue || 0
    const totalDiscount = totalOrdersList[0]?.totalDiscount || 0
    const totalAmount = totalOrdersList[0]?.totalAmount || 0

    const doc = new PDFDocument({
        size: "A3",
        layout: "landscape",
        margin: 20
    })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf")

    doc.pipe(res)

    
    doc.fontSize(18).text("Sales Report", { align: "center" })
    doc.moveDown(1.5)

    
    doc.fontSize(12)

    doc.text(
        `Total Orders: ${totalOrders}   |   Final Revenue: ${finalRevenue.toLocaleString("en-IN")}`,
        { align: "center" }
    )

    doc.moveDown(0.5)

    doc.text(
        `Total Discount: ${totalDiscount.toLocaleString("en-IN")}   |   Total Amount: ${totalAmount.toLocaleString("en-IN")}`,
        { align: "center" }
    )

    doc.moveDown(1)

    
    doc.moveTo(50, doc.y)
        .lineTo(1030, doc.y)
        .stroke()

    doc.moveDown(1)

    
    const startX = 50
    let startY = doc.y

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

    
    orders.forEach((order) => {

        doc.text(order.orderId.toString(), col1, startY)

        doc.text(
            new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            }),
            col2,
            startY
        )

        doc.text(
            order.shippingAddress?.fullName?.toUpperCase() || "No Name",
            col3,
            startY
        )

        doc.text(
            order.items?.couponDiscount === 0
                ? "Not Applied"
                : order.items?.couponDiscount.toLocaleString("en-IN") || 0,
            col4,
            startY
        )

        doc.text(order.couponCode || "Not Applied", col5, startY)

        doc.text(order.items?.status || "N/A", col6, startY)

        doc.text(
            order.paymentMethod === "cod"
                ? "Cash On Delivery"
                : order.paymentMethod || "N/A",
            col7,
            startY
        )

        doc.text(order.items?.paymentStatus || "N/A", col8, startY)

        doc.text((order.items?.total.toLocaleString("en-IN") || 0).toString(), col9, startY)

        doc.text((order.items?.finalAmount.toLocaleString("en-IN") || 0).toString(), col10, startY)

        startY += 20

        if (startY > 1100) {
            doc.addPage()
            startY = 50
        }
    })

    doc.end()
}


const exportExcel = async (req, res) => {

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Sales Report")

    const matchStage = buildMatchStage(req.query)

    const orders = await orderModel.aggregate([
        { $unwind: "$items" },
        { $match: matchStage },
        { $sort: { _id: -1 } }
    ])

    const { totalOrdersList } = await getOrderList(matchStage)

    const totalOrders = totalOrdersList[0]?.totalOrders || 0
    const finalRevenue = totalOrdersList[0]?.finalRevenue || 0
    const totalDiscount = totalOrdersList[0]?.totalDiscount || 0
    const totalAmount = totalOrdersList[0]?.totalAmount || 0

    
    worksheet.mergeCells('A1:J1')
    worksheet.getCell('A1').value = "Sales Report"
    worksheet.getCell('A1').alignment = { horizontal: 'center' }
    worksheet.getCell('A1').font = { size: 16, bold: true }

    
    worksheet.mergeCells('A2:J2')
    worksheet.getCell('A2').value =
        `Total Orders: ${totalOrders} | Final Revenue: ₹ ${finalRevenue.toLocaleString("en-IN")}`
    worksheet.getCell('A2').alignment = { horizontal: 'center' }

    worksheet.mergeCells('A3:J3')
    worksheet.getCell('A3').value =
        `Total Discount: ₹ ${totalDiscount.toLocaleString("en-IN")} | Total Amount: ₹ ${totalAmount.toLocaleString("en-IN")}`
    worksheet.getCell('A3').alignment = { horizontal: 'center' }

    
    worksheet.addRow([])
    worksheet.addRow([])

    
    const headerRow = worksheet.addRow([
        "Order ID",
        "Date",
        "Customer",
        "Discount",
        "Coupon Code",
        "Status",
        "Payment Method",
        "Payment Status",
        "Order Amount",
        "Final Amount"
    ])

    headerRow.font = { bold: true }

    
    worksheet.columns = [
        { key: "orderId", width: 25 },
        { key: "date", width: 20 },
        { key: "customer", width: 20 },
        { key: "discount", width: 15 },
        { key: "couponCode", width: 20 },
        { key: "status", width: 15 },
        { key: "paymentMethod", width: 20 },
        { key: "paymentStatus", width: 20 },
        { key: "orderAmount", width: 15 },
        { key: "finalAmount", width: 15 }
    ]

    
    const formattedData = orders.map(order => ({
        orderId: order.orderId.toString(),
        date: new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        }),
        customer: order.shippingAddress?.fullName || "-",
        orderAmount: `₹ ${order.items?.total?.toLocaleString("en-IN") || 0}`,
        discount:
            order.items?.couponDiscount === 0
                ? "Not Applied"
                : `-₹ ${order.items?.couponDiscount?.toLocaleString("en-IN") || 0}`,
        couponCode: order.couponCode || "No Coupon Code",
        status: order.items?.status || "No Status",
        finalAmount: `₹ ${order.items?.finalAmount?.toLocaleString("en-IN") || 0}`,
        paymentMethod:
            order.paymentMethod === "cod"
                ? "Cash On Delivery"
                : order.paymentMethod || "Nothing",
        paymentStatus: order.items?.paymentStatus || "No Status"
    }))

    formattedData.forEach(row => {
        worksheet.addRow(row)
    })

    
    headerRow.eachCell(cell => {
        cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
        }
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