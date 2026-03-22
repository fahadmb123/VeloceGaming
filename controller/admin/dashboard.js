const userModel = require("../../model/userModel")
const orderModel = require("../../model/orderModel")


const loadDashboard = async (req,res) => {
    try {

        let {filter,chartFilter} = req.query
        if (!chartFilter) {
            chartFilter = "today"
        }
        let startDate
        let endDate

        const matchStage = {
            "items.status": "delivered"
        }

        
        if (filter === "today") {
            const now = new Date();

            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0)
            endDate = new Date()
        }
        else if (filter === "week") {
            const now = new Date();

            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);

            endDate = new Date();
        }
        else if (filter === "month") {
            const now = new Date();

            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date();
        }
        else if (filter === "year") {
            const now = new Date();

            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date();
        }

        if (startDate && endDate) {
            
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }

        const list = await orderModel.aggregate([
            { $match : matchStage},
            { $unwind : "$items" },
            { 
                $group : {
                    _id : null,
                    totalOrders : { $sum : 1 },
                    totalRevenue : { $sum : "$items.finalAmount" }
                }
            }
        ])
        
        const totalOrders = list[0]?.totalOrders || 0
        const totalRevenue = list[0]?.totalRevenue || 0

        const activeUsers = await userModel.countDocuments({status : true})
        const top = await orderModel.aggregate([
            { $match: matchStage },
            { $unwind: "$items" },
            {$facet : {
                topSellingProduct : [
                    {
                        $group: {
                            _id: "$items.variantId",
                            totalSold: { $sum: "$items.quantity" },
            
                            productName: { $first: "$items.productName" },
                            productImage: { $first: "$items.productImage" }
                        }
                    },
                    { $sort: { totalSold: -1 } },
                    { $limit: 5 },
        
                    {
                        $lookup: {
                            from: "variants",
                            localField: "_id",
                            foreignField: "_id",
                            as: "variant"
                        }
                    },
                    { $unwind: "$variant" },

                    {
                        $lookup: {
                            from: "products",
                            localField: "variant.productId",
                            foreignField: "_id",
                            as: "product"
                        }
                    },
                    { $unwind: "$product" },

                    {
                        $lookup: {
                            from: "categories",
                            localField: "product.categoryId",
                            foreignField: "_id",
                            as: "category"
                        }
                    },
                    { $unwind: "$category" },

                    {
                        $project: {
                            totalSold: 1,
                            productName: 1,
                            productImage: 1,
                            categoryName: "$category.name"
                        }
                    }
                ],
                topSellingCategory : [
                    {
                        $lookup: {
                            from: "variants",
                            localField: "items.variantId",
                            foreignField: "_id",
                            as: "variant"
                        }
                    },
                    { $unwind: "$variant" },

                    {
                        $lookup: {
                            from: "products",
                            localField: "variant.productId",
                            foreignField: "_id",
                            as: "product"
                        }
                    },
                    { $unwind: "$product" },

                    {
                        $lookup: {
                            from: "categories",
                            localField: "product.categoryId",
                            foreignField: "_id",
                            as: "category"
                        }
                    },
                    { $unwind: "$category" },

                    {
                        $group: {
                            _id: "$category.name",
                            totalSold: { $sum: "$items.quantity" }
                        }
                    },
                    { $sort: { totalSold: -1 } },
                    { $limit: 5 },
                ]
            }}
        ])

        const result = top[0]
        const topSellingProduct = result.topSellingProduct
        const topSellingCategory = result.topSellingCategory

        
        let chartStage = {
                _id : {$hour : "$createdAt"}
            }
        let chartMatchStage
        if (chartFilter === "today") {
            /*chartStage = {
                _id: {
                    $hour: {
                        date: "$createdAt",
                        timezone: "Asia/Kolkata"
                    }
                }
            } */
            const now = new Date();

            const startOfDayIST = new Date(
                now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
            )
            startOfDayIST.setHours(0, 0, 0, 0)

            const endOfDayIST = new Date(
            now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
            )
            endOfDayIST.setHours(23, 59, 59, 999)
            chartMatchStage = {
                "items.status": "delivered"
            }

            chartMatchStage = {
                createdAt: {
                    $gte: startOfDayIST,
                    $lte: endOfDayIST
                }
            }
            chartStage = {
                _id: {
                    $hour: {
                        date: "$createdAt",
                        timezone: "Asia/Kolkata"
                    }
                }
            }
        }
        else if (chartFilter === "week") {
            chartStage = {
                _id : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }}
            }
        }
        else if (chartFilter === "month") {
            chartStage = {
                _id : {$dayOfMonth: "$createdAt"}
            }
        }
        else if (chartFilter === "year") {
            chartStage = {
                _id : { $month: "$createdAt" }
            }
        }

        let revenue

        if (chartFilter === "today") {
            revenue = await orderModel.aggregate([
            { $match : chartMatchStage},
            {$unwind : "$items"},
            {
                $group : {
                    ...chartStage,
                    totalRevenue : { $sum : "$items.finalAmount"}
                }
            },
            { $sort : {_id : 1}}
           ])
        } else {

        revenue = await orderModel.aggregate([
            { $match : { "items.status" : "delivered"}},
            {$unwind : "$items"},
            {
                $group : {
                    ...chartStage,
                    totalRevenue : { $sum : "$items.finalAmount"}
                }
            },
            { $sort : {_id : 1}}
        ])
        }

        console.log(revenue)
        return res.render ("admin/dashboard",{
            topSellingCategory,
            topSellingProduct,
            totalOrders,
            totalRevenue,
            activeUsers,
            filter,
            revenue,
            chartFilter
        })
    } catch (err) {
        console.log(err)
    }
}




module.exports = {
    loadDashboard
}