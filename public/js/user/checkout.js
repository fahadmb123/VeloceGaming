    let variantId = '<%= variant ? variant._id : null %>'

    let messageElement = document.getElementById("swalMessage");

    if (messageElement && messageElement.innerText.trim() !== "") {
    swal(messageElement.innerText);
    }

    function editAddress(id,variantId) {
        let url = variantId ? `/editAddress?id=${id}&from=checkout&variantId=${variantId}` : `/editAddress?id=${id}&from=checkout`
        window.location.href = url
    }
    function addAddress (variantId) {
        let url = variantId ? `/addAddress?from=checkout&variantId=${variantId}` : `/addAddress?from=checkout`
        window.location.href = url
    }



    async function placeOrder (variantId) {
        let selectedAddress = document.querySelector(".addressOption:checked")
        let paymentElement = document.querySelector(".paymentOption:checked")
        
        if (!paymentElement) {
            return showToast("Please select a payment method", "error")
        }

        if (!selectedAddress){
            return showToast("Please Add Address","error")
        }
        const spinner = document.getElementById("admin-spinner");
        spinner.style.display = "flex"

        let paymentMethod = paymentElement.value
        let addressId = selectedAddress.value

        let url = variantId ? `/placeOrder?variantId=${variantId}&quantity=1` : "/placeOrder"

        const response = await fetch (url,{
            method : "post",
            headers : {
                "content-Type" : "application/json",
            },
            body : JSON.stringify({
                paymentMethod,
                addressId
            })
        })

        const data = await response.json()

        if (data.loginRequired) {
            window.location.href = "/login"
        }
        spinner.style.display = "none"

        if (data.razorpay){
            openRazorpay(data, paymentMethod, addressId,variantId)
            return
        }

        if (!data.success) {
            showToast(data.message,"error")
        }

        if (data.success){
            window.location.href = `/orderSuccessPage?id=${data.orderObjectId}`
        }

    }



function openRazorpay(data,paymentMethod,addressId,variantId){

    const options = {
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "Veloce Gaming",
        description: "Order Payment",
        order_id: data.order.id,

        handler: async function (response){
            response.variantId = variantId
            response.quantity = 1
           
            response.paymentMethod = paymentMethod
            response.addressId = addressId
            const spinner = document.getElementById("admin-spinner");
            spinner.style.display = "flex"
            const verify = await fetch("/verifyRazorpayPayment",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(response)
            })
            
            const result = await verify.json()
            spinner.style.display = "none"
            if(result.success){
                window.location.href = `/orderSuccessPage?id=${result.orderObjectId}`
            }else{
                showToast(result.message,"error")
            }
        }
    }

    const rzp = new Razorpay(options)
    rzp.on('payment.failed', function (response){

        console.log(response.error)

        window.location.href = `/paymentFailure?variantId=${variantId}`

    })
    rzp.open()
}


async function applyCoupon(couponCode) {
    
    
    const response = await fetch ("/applyCoupon",{
        method : "post",
        headers : {
            "content-Type" : "application/json",
        },
        body : JSON.stringify({
            couponCode
        })
    })

    const data = await response.json()

    if (data.loginRequired) {
        return window.location.href = '/login'
    }
    if (data.success) {
        //showToast(data.message,"success")
        window.location.reload()
    } else {
        showToast(data.message,"error")
    }
}


async function removeCoupon(){
    const response = await fetch ("/removeCoupon",{
        method : "post"
    })
    const data = await response.json()

    if (data.loginRequired) {
        return window.location.href = '/login'
    }

    if (data.success) {
        //showToast(data.message,"success")
        window.location.reload()
    } else {
        showToast(data.message,"error")
    }
}






    function showToast(message, type = "success") {

    const toast = document.createElement("div");
    toast.innerText = message;

    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.right = "20px";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "6px";
    toast.style.color = "white";
    toast.style.zIndex = "9999";
    toast.style.fontWeight = "500";
    toast.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
    toast.style.transition = "all 0.3s ease";

    if (type === "success") {
        toast.style.backgroundColor = "#28a745";
    } else {
        toast.style.backgroundColor = "#dc3545";
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}