const express = require("express")
const router = express.Router()
const adminController = require("../controller/adminController")
const {isLogged,isLoggedOut} = require("../middleware/adminAuth")




router.get("/login",isLoggedOut,adminController.loadLogin)

router.get("/userManagement",isLogged,adminController.loadUserManagement)

router.get("/userManagement/userStatus/:id",isLogged,adminController.userStatus)

router.get("/logout",adminController.logout)







router.post("/login",adminController.login)





module.exports = router