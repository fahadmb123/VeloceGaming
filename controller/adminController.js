const adminService = require("../service/adminService")
const userModel = require("../model/userModel")






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








module.exports = {
    loadLogin,
    login,
    loadUserManagement,
    userStatus,
    logout
}