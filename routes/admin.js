const express = require("express")
const router = express.Router()
const adminController = require("../controller/admin/adminController")
const {isLogged,isLoggedOut} = require("../middleware/adminAuth")
const upload = require("../middleware/multer")
const orderManagement = require("../controller/admin/orderManagement")



router.get("/login",isLoggedOut,adminController.loadLogin)

router.get("/userManagement",isLogged,adminController.loadUserManagement)

router.get("/userManagement/userStatus/:id",isLogged,adminController.userStatus)

router.get("/logout",adminController.logout)

router.get("/categoryManagement",isLogged,adminController.loadCategoryManagement)

router.get("/productmanagement",isLogged,adminController.loadProductManagement)

router.get("/productManagement/:id",isLogged,adminController.productManagement)



router.get("/orderManagement",isLogged,orderManagement.loadOrderManagement)

router.get("/orderDetails",isLogged,orderManagement.loadOrderDetails)



router.patch("/categoryManagement/categoryStatus/:id",isLogged,adminController.categoryStatus)

router.patch("/productManagement/productStatus/:id",isLogged,adminController.productStatus)




router.delete("/productManagement/deleteVariant/:id", adminController.deleteVariant);



router.post("/login",adminController.login)

router.post("/addCategory",upload.single("categoryImage"),adminController.addCategory)

router.post("/editCategory/:id",upload.single("categoryImage"),adminController.editCategory)

router.post("/productManagement/add",upload.any(),adminController.addProduct)

router.post("/productManagement/edit/:id",upload.any(),adminController.editProduct)

router.post("/orderManagement/updateOrderStatus",orderManagement.updateOrderStatus)


router.post("/orderManagement/returnRequestAccept",orderManagement.returnRequestAccept)

router.post('/orderManagement/rejectReturnRequest',orderManagement.rejectReturnRequest)


module.exports = router