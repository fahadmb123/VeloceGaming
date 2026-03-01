const {productModel, variantModel} = require ("../model/productModel.js")
const categoryModel = require("../model/categoryModel")
const userProductService = require("../service/userProductService")
const wishlistModel = require ("../model/wishlistModel.js")
const { populate } = require("dotenv")
const cartModel = require("../model/cartModel.js")



/*const loadShop = async (req,res) => {
    try {

        const categories = await categoryModel.find()
        const variants = await variantModel.find().populate({
                                                        path: "productId",
                                                        populate: {
                                                             path: "categoryId"
                                                        }
                                                    });
        
        variants.forEach ((variant,index)=>{

            const colorAttr = variant.attributes.find(a => a.key === "color");

            let parsedColor = {name : "" , hex: "#000000"}

            if (colorAttr) {
                try {
                    parsedColor = JSON.parse(colorAttr.value)
                } catch {
                    parsedColor = { name: colorAttr.value, hex: "#000000" };
                }
            }

            variant.colorName = parsedColor.name
            variant.colorHex = parsedColor.hex
        })

        return res.render("user/shop",{
            categories,
            variants
        })
    } catch (err) {
        console.log(err)
    }
}*/



const loadShop = async (req, res) => {
    try {


        let wishlistVariantIds = [];

        if (req.session.user) {
            const wishlistItems = await wishlistModel.find({
                userId: req.session.user._id
            });
            wishlistVariantIds = wishlistItems.map(item =>
                item.variantId.toString()
            );
        }

        const categories = await categoryModel.find();

        const searchQuery = req.query.search || "";
        const queryCategories = req.query.categories
            ? req.query.categories.split(",")
            : [];
        const sort = req.query.sort || "";
        const page = parseInt(req.query.page) || 1;

        const limit = 10 
        const skip = (page - 1) * limit;

        
        let priceMatch = searchQuery.match(/under\s+(\d+)/i);
        let maxPrice = priceMatch ? parseInt(priceMatch[1]) : null;

        let cleanedSearch = searchQuery
            .replace(/under\s+\d+/i, "")
            .trim();

        let productFilter = { isDeleted: false };

        if (cleanedSearch) {
            productFilter.name = {
                $regex: cleanedSearch,
                $options: "i"
            };
        }

        if (queryCategories.length > 0) {
            productFilter.categoryId = { $in: queryCategories };
        }

        const matchedProducts = await productModel
            .find(productFilter)
            .select("_id");

        const productIds = matchedProducts.map(p => p._id);

        if (productIds.length === 0) {

            if (req.headers.accept.includes("application/json")) {
                return res.json({
                    variants: [],
                    totalPages: 0,
                    currentPage: page
                });
            }

            return res.render("user/shop", {
                categories,
                variants: [],
                wishlistVariantIds: [],
                currentPage: 1,
                totalPages: 0
            });
        }

        let variantFilter = {
            productId: { $in: productIds },
            status: true
        };

        if (maxPrice) {
            variantFilter.$expr = {
                $lte: [
                    { $toInt: "$offeredPrice" },
                    maxPrice
                ]
            };
        }

        let sortOption = {};
        if (sort === "priceLow") sortOption.offeredPrice = 1;
        if (sort === "priceHigh") sortOption.offeredPrice = -1;
        if (sort === "nameAZ") sortOption["productId.name"] = 1;
        if (sort === "nameZA") sortOption["productId.name"] = -1;

        const total = await variantModel.countDocuments(variantFilter);

        let variants = await variantModel
        .find(variantFilter)
        .populate({
            path: "productId",
            populate: { path: "categoryId" }
        })
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

        variants = variants.map(v => v.toObject());

        /*let wishlistVariantIds = [];

        if (req.session.user) {
            const wishlistItems = await wishlistModel.find({
                userId: req.session.user._id
            });
            wishlistVariantIds = wishlistItems.map(item =>
                item.variantId.toString()
            );
        }*/

        const totalPages = Math.ceil(total / limit);

        variants.forEach(variant => {
            const colorAttr = variant.attributes?.find(a => a.key === "color");

            let parsedColor = { name: "", hex: "#000000" };

            if (colorAttr && colorAttr.value) {
                try {
                    parsedColor = JSON.parse(colorAttr.value);
                } catch {
                    parsedColor = { name: colorAttr.value, hex: "#000000" };
                }
            }

            variant.colorName = parsedColor.name;
            variant.colorHex = parsedColor.hex;
        });         


        
        if (req.headers.accept.includes("application/json")) {
            return res.json({
                variants,
                totalPages,
                currentPage: page,
                wishlistVariantIds
            });
        }

        return res.render("user/shop", {
            categories,
            variants,
            wishlistVariantIds,
            currentPage: page,
            totalPages
        });

    } catch (err) {
        console.log(err);
    }
};

const loadProduct = async (req,res) => {
    try {

        const variantId = req.params.id.trim()

        const variant = await variantModel.findOne ({_id:variantId}).populate("productId")

        if (!variant) {
            return res.redirect("/shop")
        }


        if (variant.productId.isDeleted || !variant.status) {
            return res.redirect("/shop")
        }

        const category = await categoryModel.findOne({_id:variant.productId.categoryId})

        if (category.isDeleted) {
            return res.redirect("/shop")
        }


        const productVariants = await variantModel.find({productId:variant.productId._id})

        let colorVariants = []

        productVariants.forEach( (obj,index) => {
            const colorAttr = obj.attributes.find(a => a.key === "color");

            let parsedColor = {name : "" , hex: "#000000"}
            if (colorAttr) {
                try {
                    parsedColor = JSON.parse(colorAttr.value)
                } catch {
                    parsedColor = { name: colorAttr.value, hex: "#000000" };
                }
            }

            colorVariants.push({
                colorName : parsedColor.name,
                colorHex : parsedColor.hex,
                variantId : obj._id
            })

        })

        const colorAttr = variant.attributes.find(a => a.key === "color");

            let parsedColor = {name : "" , hex: "#000000"}
            if (colorAttr) {
                try {
                    parsedColor = JSON.parse(colorAttr.value)
                } catch {
                    parsedColor = { name: colorAttr.value, hex: "#000000" };
                }
            }

        variant.colorName = parsedColor.name
        variant.colorHex = parsedColor.hex

        let wishlistVariant;

        if (req.session.user) {
            wishlistVariant = await wishlistModel.findOne({userId:req.session.user._id,variantId:variant._id})
        }

        return res.render("user/productDetails",{
            variant,
            colorVariants,
            wishlistVariant
        })
    } catch (err) {
        console.log(err)
    }
}


const loadWishlist = async (req,res) => {
    try {

        
        const wishlistItems = await wishlistModel.find({userId:req.session.user._id}).populate({
            path : "variantId",
            populate : {
                path : "productId",
                populate : {
                    path : "categoryId"
                }
            }
        })

        
        
        wishlistItems.forEach ((item,index)=>{

            const colorAttr = item.variantId?.attributes?.find(a => a.key === "color");
            

            let parsedColor = {name : "" , hex: "#000000"}

            if (colorAttr) {
                try {
                    parsedColor = JSON.parse(colorAttr.value)
                } catch {
                    parsedColor = { name: colorAttr.value, hex: "#000000" };
                }
            }

            if (item.variantId) {
                item.variantId.colorName = parsedColor.name
                item.variantId.colorHex = parsedColor.hex
            }
        })


        return res.render ("user/wishlist",{
            wishlistItems
        })
    } catch (err) {
        console.log(err)
    }
}

const loadCart = async (req,res) => {
    try {

        if (!req.session.user){
            return res.render("user/login")
        }

        const cartItems = await cartModel.findOne({userId:req.session.user._id}).populate({path:"items.variantId",populate:{path:"productId",populate:{path:"categoryId"}}})

        if (!cartItems || !cartItems.items) {
            return res.render("user/cart",{
                cartItems : { items : [] }
            })
        }

        cartItems.items.forEach ((item,index)=>{

            const colorAttr = item.variantId?.attributes?.find(a => a.key === "color");

            let parsedColor = {name : "" , hex: "#000000"}

            if (colorAttr) {
                try {
                    parsedColor = JSON.parse(colorAttr.value)
                } catch {
                    parsedColor = { name: colorAttr.value, hex: "#000000" };
                }
            }

            if (item.variantId) {
                item.variantId.colorName = parsedColor.name
                item.variantId.colorHex = parsedColor.hex

                let subtotal = item.quantity * item.variantId.offeredPrice
                item.subtotal = subtotal
            }
        })

        let cart = await cartModel.findOne({userId:req.session.user._id}).populate("items.variantId")


        let total = 0
            if (cart && cart.items){
                let cal = cart?.items.map ((obj)=>{
                    return obj.variantId.offeredPrice * obj.quantity
                })
                total = cal.reduce ((acc,curr)=>{
                    acc += curr
                    return acc
                },0)
                
            }
        
        return res.render ("user/cart",{
            cartItems,
            total
        })
    } catch (err) {
        console.log(err)
    }
}









const cartRemove = async (req,res) => {
    try {

        const variantId = req.params.id

        if (!variantId) {
            return res.status(400).json({ success: false, message: "Variant ID missing" })
        }
        if (!req.session.user){
            return res.status(401).json({success : false , message : "Not Logged"})
        }
        
        await cartModel.updateOne(
            { userId: req.session.user._id },
            {
                $pull: {
                    items: { variantId: variantId }
                }
            }
        )

        let cart = await cartModel.findOne({userId:req.session.user._id}).populate("items.variantId")

            let total = 0
            if (cart && cart.items){
                let cal = cart?.items.map ((obj)=>{
                    return obj.variantId.offeredPrice * obj.quantity
                })
                total = cal.reduce ((acc,curr)=>{
                    acc += curr
                    return acc
                },0)
                
            }

        return res.json({
            success : true,
            total
        })
    } catch (err) {
        console.log(err)
    }
}


const wishlistRemove = async (req,res) => {
    try {

        const variantId = req.params.id

        if (!variantId) {
            return res.status(400).json({ success: false, message: "Variant ID missing" })
        }
        if (!req.session.user){
            return res.status(401).json({success : false , message : "Not Logged"})
        }
        await wishlistModel.deleteOne({userId:req.session.user._id,variantId})


        return res.json({
            success : true
        })
    } catch (err) {
        console.log(err)
    }
}


const wishlistToggle = async (req,res) => {
    try {
        const {loginRequired,added} = await userProductService.wishlistToggle(req)

        if (loginRequired) {
            return res.json({
                loginRequired : true
            })
        }
        if (added) {
            return res.json({
                success : true,
                added : true
            })
        } else {
            return res.json({
                success : true,
                added : false
            })
        }
    } catch (err) {
        console.log(err)
    }
}


const addToCart = async (req,res) => {
    try {

        const {loginRequired,message,valid} = await userProductService.addToCart(req)

        /*if (!valid) {
            return res.redirect("/shop")
        }*/
        if (loginRequired) {
            return res.json({loginRequired : true})
        }


        return res.json({
            success : true,
            message
        })
    } catch (err) {
        console.log(err)
    }
}


const cartInc = async (req,res) => {
    try {

        const  {failMessage,message,loginRequired} = await userProductService.cartInc(req)

        if (failMessage) {
            return {failMessage}
        }

        /*const cartItems = await cartModel.findOne({userId:req.session.user._id}).populate({path:"items.variantId",populate:{path:"productId"}})
        cartItems.items.forEach ((item,index)=>{

            let subtotal = item.quantity * item.variantId.offeredPrice
            item.subtotal = subtotal
        })*/

        if (message) {
            let variantId = req.query.variantId
            const cartItem = await cartModel.findOne ({userId:req.session.user._id,"items.variantId":variantId})
            let item = cartItem.items.find(
                obj => obj.variantId.toString() === variantId
            )

            let cart = await cartModel.findOne({userId:req.session.user._id}).populate("items.variantId")

            let total = 0
            if (cart && cart.items){
                let cal = cart?.items.map ((obj)=>{
                    return obj.variantId.offeredPrice * obj.quantity
                })
                total = cal.reduce ((acc,curr)=>{
                    acc += curr
                    return acc
                },0)
                
            }
            return res.json({
                success : true,
                message,
                item,
                total
            })
        } else {
            return res.json({
                success : false,
                message : failMessage
            })
        }
    } catch (err) {
        console.log(err)
    }
}


const cartDec = async (req,res) => {
    try {

        const  {failMessage,message,loginRequired} = await userProductService.cartDec(req)

        if (failMessage) {
            return res.json({
                success : false,
                message : failMessage
            })
        }

        /*const cartItems = await cartModel.findOne({userId:req.session.user._id}).populate({path:"items.variantId",populate:{path:"productId"}})
        cartItems.items.forEach ((item,index)=>{

            let subtotal = item.quantity * item.variantId.offeredPrice
            item.subtotal = subtotal
        })*/

        if (message) {
            let variantId = req.query.variantId
            const cartItem = await cartModel.findOne ({userId:req.session.user._id,"items.variantId":variantId})
            //const cartItem = await cartModel.findOne ({userId:req.session.user._id,"items.variantId":variantId}).populate("items.variantId")
            let item = cartItem.items.find(
                obj => obj.variantId.toString() === variantId
            )

            let cart = await cartModel.findOne({userId:req.session.user._id}).populate("items.variantId")


            let total = 0
            if (cart && cart.items){
                let cal = cart?.items.map ((obj)=>{
                    return obj.variantId.offeredPrice * obj.quantity
                })
                total = cal.reduce ((acc,curr)=>{
                    acc += curr
                    return acc
                },0)
    
            }
            
            return res.json({
                success : true,
                message,
                item,
                total
            })
        } else {
            return res.json({
                success : false,
                message : failMessage
            })
        }
    } catch (err) {
        console.log(err)
    }
}


const allToCart = async (req,res) => {
    try {

        const {loginRequired,failMessage,message} = await userProductService.allToCart(req)

        if (loginRequired) {
            return res.json({loginRequired:true})
        }

        if (failMessage){
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









module.exports = {
    loadShop,
    loadProduct,
    wishlistToggle,
    loadWishlist,
    wishlistRemove,
    addToCart,
    loadCart,
    cartInc,
    cartDec,
    cartRemove,
    allToCart
}