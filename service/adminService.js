const adminModel = require("../model/adminModel")
const userModel = require("../model/userModel")
const bcrypt = require("bcrypt")




const login = async (req) => {
    try {

        const {email,password} = req.body

        const admin = await adminModel.findOne({email})

        if (!admin) {
            const message = "Invalid Admin"
            return {message}
        }

        const isMatch = await bcrypt.compare(password,admin.password)

        if (!isMatch){
            const message = "Incorrect Password"
            return {message}
        }

        const swalMessage = "You Logged Succesfully"
        req.session.admin = await adminModel.findOne({email})
        return {swalMessage}

    } catch (err) {
        console.log(err)
    }
}


const userStatus = async (req) => {
    try {

        const userId = req.params.id
        const status = req.query.status

        await userModel.updateOne(
            {_id:userId},
            {$set:{status:status}}
        )
        const swalMessage = "Status Updated"
        return {swalMessage}
    } catch (err){
        console.log(err)
    }
}






module.exports = {
    login,
    userStatus
}