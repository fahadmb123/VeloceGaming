


const multer = require("multer")

const storage = multer.diskStorage({})

const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg"
]

const fileFilter = (req, file, cb) => {

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed"), false)
    }

}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
})


const uploadSingle = (field) => (req, res, next) => {

    upload.single(field)(req, res, function (err) {

        if (err) {

            if (err.code === "LIMIT_FILE_SIZE") {
                return res.json({
                    success: false,
                    message: "Image must be less than 2MB"
                })
            }

            return res.json({
                success: false,
                message: err.message
            })
        }

        next()
    })
}

const uploadMultiple = (field, count) => (req, res, next) => {

    upload.array(field, count)(req, res, function (err) {

        if (err) {

            if (err.code === "LIMIT_FILE_SIZE") {
                return res.json({
                    success:false,
                    message:"Image must be less than 2MB"
                })
            }

            return res.json({
                success:false,
                message:err.message
            })
        }

        next()

    })

}

const uploadAny = () => (req, res, next) => {

    upload.any()(req, res, function (err) {

        if (err) {

            if (err.code === "LIMIT_FILE_SIZE") {
                return res.json({
                    success:false,
                    message:"Image must be less than 2MB"
                })
            }

            return res.json({
                success:false,
                message:err.message
            })
        }

        next()
    })

}

module.exports = { uploadSingle ,uploadMultiple,uploadAny}