const userModel = require("../../model/userModel")
const orderModel = require("../../model/orderModel")


const loadDashboard = async (req, res, next) => {
    try {

        let { filter, chartFilter } = req.query;

        if (!filter) filter = "today";
        if (!chartFilter) chartFilter = "today";

        
        const getISTDate = (date = new Date()) => {
            return new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        };

        const now = getISTDate();

        let startDate, endDate;

        
        if (filter === "today") {
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
        }

        else if (filter === "week") {
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
        }

        else if (filter === "month") {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
        }

        else if (filter === "year") {
            startDate = new Date(now.getFullYear(), 0, 1);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
        }

        
        const matchStage = {
            "items.status": "delivered"
        };

        if (startDate && endDate) {
            matchStage.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }

        
        const list = await orderModel.aggregate([
            { $unwind: "$items" },
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$items.finalAmount" }
                }
            }
        ]);

        const totalOrders = list[0]?.totalOrders || 0;
        const totalRevenue = list[0]?.totalRevenue || 0;

        
        const activeUsers = await userModel.countDocuments({ status: true });

        
        const top = await orderModel.aggregate([
            { $unwind: "$items" },
            { $match: matchStage },
            {
                $facet: {

                    
                    topSellingProduct: [
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

                    
                    topSellingCategory: [
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
                        { $limit: 5 }
                    ]
                }
            }
        ]);

        const result = top[0] || {};
        const topSellingProduct = result.topSellingProduct || [];
        const topSellingCategory = result.topSellingCategory || [];

        
        const chartMatch = {
            "items.status": "delivered"
        };

        if (startDate && endDate) {
            chartMatch.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }

        
        let chartStage;

        if (chartFilter === "today") {
            chartStage = {
                _id: {
                    $hour: {
                        date: "$createdAt",
                        timezone: "Asia/Kolkata"
                    }
                }
            };
        }
        else if (chartFilter === "week") {
            chartStage = {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt",
                        timezone: "Asia/Kolkata"
                    }
                }
            };
        }
        else if (chartFilter === "month") {
            chartStage = {
                _id: {
                    $dayOfMonth: {
                        date: "$createdAt",
                        timezone: "Asia/Kolkata"
                    }
                }
            };
        }
        else if (chartFilter === "year") {
            chartStage = {
                _id: {
                    $month: {
                        date: "$createdAt",
                        timezone: "Asia/Kolkata"
                    }
                }
            };
        }

        
        const revenue = await orderModel.aggregate([
            { $unwind: "$items" },
            { $match: chartMatch },
            {
                $group: {
                    ...chartStage,
                    totalRevenue: { $sum: "$items.finalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        
        return res.render("admin/dashboard", {
            topSellingCategory,
            topSellingProduct,
            totalOrders,
            totalRevenue,
            activeUsers,
            filter,
            revenue,
            chartFilter
        });

    } catch (err) {
        next(err);
    }
}



module.exports = {
    loadDashboard
}