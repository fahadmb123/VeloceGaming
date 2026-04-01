const adminService = require("../../service/adminService.js")
const userModel = require("../../model/userModel.js")
const categoryModel = require("../../model/categoryModel.js")
const {productModel, variantModel} = require ("../../model/productModel.js")




const loadLogin = async (req,res) => {
    try {

        return res.render("admin/login")

    } catch (err){
        console.log(err)
    }
}

const loadUserManagement = async (req,res) => {
    try {
        const swalMessage = req.session.swalMessage
        req.session.swalMessage = null

        let page = parseInt(req.query.page) || 1
        let limit = 10
        let skip = (page - 1) * limit

        let filter = {}

        let search = req.query.search || ""
        let inputSearch = search.trim()
        let statusFilter = req.query.filter || "all"

        if (inputSearch) {
            filter.$or = [
                { name: { $regex: inputSearch, $options: "i" } },
                { email: { $regex: inputSearch, $options: "i" } }
            ]
        }

        if (statusFilter === "active") {
            filter.status = true
        } else if (statusFilter === "block") {
            filter.status = false
        }

        const users = await userModel.find(filter)
            .sort({_id:-1})
            .skip(skip)
            .limit(limit)

        const totalUsers = await userModel.countDocuments(filter)
        const totalPages = Math.ceil(totalUsers / limit)

        return res.render("admin/userManagement", {
            swalMessage,
            users,
            totalPages,
            currentPage: page,
            search:inputSearch,
            filter: statusFilter
        })

    } catch (err) {
        console.log(err)
    }
}


const loadCategoryManagement = async (req,res) => {
    
       try {

        let page = parseInt(req.query.page) || 1
        let limit = 10
        let skip = (page - 1) * limit

        let filter = {}

        let search = req.query.search || ""
        let inputSearch = search.trim()
        let statusFilter = req.query.filter || "all"

        if (inputSearch) {
            filter.name = { $regex: inputSearch, $options: "i" }  
        }

        if (statusFilter === "active") {
            filter.isDeleted = false
        } else if (statusFilter === "inactive") {
            filter.isDeleted = true
        }

        const categories = await categoryModel.find(filter)
            .sort({_id:-1})
            .skip(skip)
            .limit(limit)

        await Promise.all(
            categories.map(async (obj) => {
            const count = await productModel.countDocuments({ categoryId: obj._id })
            obj.productCount = count
            })
        )
        const totalCategory = await categoryModel.countDocuments(filter)
        const totalPages = Math.ceil(totalCategory / limit)

        return res.render("admin/categoryManagement", {
            categories,
            totalPages,
            currentPage: page,
            search:inputSearch,
            filter: statusFilter
        })

    } catch (err) {
        console.log(err)
    }
}


const loadProductManagement = async (req,res) => {
    try {

        let page = parseInt(req.query.page) || 1
        let limit = 10
        let skip = (page - 1) * limit

        let filter = {}

        let search = req.query.search || ""
        let inputSearch = search.trim()
        let statusFilter = req.query.filter || "all"

        if (inputSearch) {
            filter.name = { $regex: inputSearch, $options: "i" }  
        }

        if (statusFilter === "active") {
            filter.isDeleted = false
        } else if (statusFilter === "inactive") {
            filter.isDeleted = true
        }

        const products = await productModel.find(filter)
            .sort({_id:-1})
            .skip(skip)
            .limit(limit).populate("categoryId")

        await Promise.all(
            products.map(async (obj) => {
            const count = await variantModel.countDocuments({ productId: obj._id })
            obj.variantCount = count
            })
        )

        const totalProduct = await productModel.countDocuments(filter)
        const totalPages = Math.ceil(totalProduct / limit)

        const categories = await categoryModel.find()

        return res.render("admin/productManagement", {
            products,
            totalPages,
            currentPage: page,
            search:inputSearch,
            filter: statusFilter,
            categories
        })

    } catch (err) {
        console.log(err)
    }
}


const productManagement = async (req,res) => {
    try {

        const product = await productModel.findOne({_id:req.params.id}).populate("categoryId")
        const variants = await variantModel.find({ productId: product._id });

        const formattedVariants = variants.map(v => {
            const images = v.images.map((url, index) => ({
                url: url,
                public_id: v.imagesId[index]
            }));

            const colorAttr = v.attributes.find(a => a.key === "color");

            let parsedColor = {name : "" , hex: "#000000"}
            if (colorAttr) {
                try {
                    parsedColor = JSON.parse(colorAttr.value)
                } catch {
                    parsedColor = { name: colorAttr.value, hex: "#000000" };
                }
            }
            return {
                _id: v._id,
                productId: v.productId,
                price: v.price,
                stock: v.stock,
                status: v.status,
                colorName:parsedColor.name,
                colorHex : parsedColor.hex,
                ram: v.attributes.find(a => a.key === "ram")?.value || "",
                storage: v.attributes.find(a => a.key === "storage")?.value || "",
                images
            };
        });

    return res.json({
        success: true,
        product,
        variants: formattedVariants
    });
        
    } catch (err) {
        console.log(err)
    }
}








const login = async (req,res) => {
    try {

        const {message,swalMessage} = await adminService.login(req)

        if (message) {
            return res.render("admin/login",{message})
        }
        req.session.swalMessage = swalMessage
        return res.redirect("/admin/userManagement")
        
    } catch (err) {
        console.log(err)
    }
}


const userStatus = async (req,res) => {
    try {
        const {swalMessage} = await adminService.userStatus(req)
        req.session.swalMessage = swalMessage
        res.redirect("/admin/userManagement")
    } catch (err) {
        console.log(err)
    }
}


const logout = async (req,res) => {
    try {
        req.session.admin = null
        return res.redirect("/admin/login")
    } catch (err) {
        console.log(err)
    }
}


const addCategory = async (req,res) => {
    try {
        const {message,failMessage} = await adminService.addCategory(req)

        if (failMessage) {
            return res.json({
                success : false,
                message : failMessage
            })
        }else {
            return res.json({
                success :true,
                message : message
            })
        }
        
    } catch (err) {
        console.log(err)
    }
}


const editCategory = async (req,res) => {
    try {

        const {message,failMessage} = await adminService.editCategory(req)

        if (failMessage) {
            return res.json({
                success : false,
                message : failMessage
            })
        }
        return res.json({
            success : true,
            message : message
        })
    } catch (err) {
        console.log(err)
    }
}


const categoryStatus = async (req,res) => {
    try {
        const id = req.params.id
        const status = req.query.status

        const category = await categoryModel.findOne({_id:id})
        if (!category) {
            return res.status(404).json({
                success : false,
                message : "Category Not Found"
            })
        }
        await categoryModel.updateOne(
            {_id:id},
            {$set : {
                isDeleted : status
            }}
        )
        
        return res.json({
            success : true,
            message : "Updated Successfully"
        }) 
    } catch (err) {
        res.status(500).json({
            success : false,
            message : err.message
        })
    }
}


const addProduct = async (req,res) => {
    try {
        const {failMessage,message} = await adminService.addProduct(req)

        if (failMessage) {
            return res.status(409).json({
                success : false,
                message : failMessage
            })
        }

        return res.json({
            success : true,
            message : message
        })

        return 
    } catch (err) {
        console.log(err)
    }
}


const editProduct = async (req,res) => {
    try {

        const {failMessage,message} = await adminService.editProduct(req)

        if (failMessage) {
            return res.json({
                success : false,
                message : failMessage
            })
        }

        return res.json({
            success : true,
            message : message
        })
    } catch (err) {
        console.log(err)
    }
}


const productStatus = async (req,res) => {
    try {
        const id = req.params.id
        const status = req.query.status

        const product = await productModel.findOne({_id:id})
        if (!product) {
            return res.status(404).json({
                success : false,
                message : "Product Not Found"
            })
        }



        await productModel.updateOne(
            {_id:id},
            {
                $set : {
                    isDeleted : status
                }
            }
        )

        return res.json({
            success : true,
            message : "Updated"
        })
    }  catch (err) {
        console.log(err)
    }
}





const deleteVariant = async (req, res) => {
    try {

        const variantId = req.params.id;

        await variantModel.findByIdAndDelete(variantId);

        res.json({ success: true });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to delete variant" });
    }
}




module.exports = {
    loadLogin,
    login,
    loadUserManagement,
    userStatus,
    logout,
    loadCategoryManagement,
    addCategory,
    editCategory,
    categoryStatus,
    loadProductManagement,
    addProduct,
    productManagement,
    editProduct,
    productStatus,
    deleteVariant
}