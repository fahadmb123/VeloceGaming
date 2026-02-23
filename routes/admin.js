const express = require("express")
const router = express.Router()
const adminController = require("../controller/adminController")
const {isLogged,isLoggedOut} = require("../middleware/adminAuth")
const upload = require("../middleware/multer")



router.get("/login",isLoggedOut,adminController.loadLogin)

router.get("/userManagement",isLogged,adminController.loadUserManagement)

router.get("/userManagement/userStatus/:id",isLogged,adminController.userStatus)

router.get("/logout",adminController.logout)

router.get("/categoryManagement",isLogged,adminController.loadCategoryManagement)




router.patch("/categoryManagement/categoryStatus/:id",isLogged,adminController.categoryStatus)



router.post("/login",adminController.login)

router.post("/addCategory",upload.single("categoryImage"),adminController.addCategory)

router.post("/editCategory/:id",upload.single("categoryImage"),adminController.editCategory)


module.exports = router