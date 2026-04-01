let messageElement = document.getElementById("swalMessage");

    if (messageElement && messageElement.innerText.trim() !== "") {
    swal(messageElement.innerText);
    }



   document.getElementById("registerForm").addEventListener("submit",async function (event) {


        
        event.preventDefault()

        let name = document.getElementById("name").value.trim()
        let phone = document.getElementById("phone").value.trim()
        let pincode = document.getElementById("pincode").value.trim()
        let address = document.getElementById("address").value.trim()
        let state = document.getElementById("state").value.trim()
        let city = document.getElementById("city").value.trim()


        const nameDiv = document.getElementById('nameDiv');
        const phoneDiv = document.getElementById('phoneDiv');
        const pincodeDiv = document.getElementById('pincodeDiv');
        const addressDiv = document.getElementById('addressDiv');
        const stateDiv = document.getElementById('stateDiv');
        const cityDiv = document.getElementById('cityDiv');


       let isValid = true

        if(!name){
            nameDiv.querySelector('input').style.border='1px solid red'
            nameDiv.querySelector('p').style.display='block'
            isValid = false
        }
        else if (name.length <= 3){
            nameDiv.querySelector('input').style.border='1px solid red'
            nameDiv.querySelector('p').style.display='block'
            isValid = false
        }
        else{
            nameDiv.querySelector('input').style.border='1px solid gray'
            nameDiv.querySelector('p').style.display='none'
        }

        if(!phone){
            phoneDiv.querySelector('input').style.border='1px solid red'
            phoneDiv.querySelector('p').style.display='block'
            isValid = false
        }else{
            phoneDiv.querySelector('input').style.border='1px solid gray'
            phoneDiv.querySelector('p').style.display='none'
        }

        if(!pincode){
            pincodeDiv.querySelector('input').style.border='1px solid red'
            pincodeDiv.querySelector('p').style.display='block'
            isValid = false
        }else{
            pincodeDiv.querySelector('input').style.border='1px solid gray'
            pincodeDiv.querySelector('p').style.display='none'
        }

        if(!address){
            addressDiv.querySelector('input').style.border='1px solid red'
            addressDiv.querySelector('p').style.display='block'
            isValid = false
        }else{
            addressDiv.querySelector('input').style.border='1px solid gray'
            addressDiv.querySelector('p').style.display='none'
        }

        if(!state){
            stateDiv.querySelector('input').style.border='1px solid red'
            stateDiv.querySelector('p').style.display='block'
            isValid = false
        }else{
            stateDiv.querySelector('input').style.border='1px solid gray'
            stateDiv.querySelector('p').style.display='none'
        }

        if(!phone){
            phoneDiv.querySelector('input').style.border='1px solid red'
            phoneDiv.querySelector('p').style.display='block'
            isValid = false
        }
        else if (!/^[0-9]{10}$/.test(phone)) {
            swal("Invalid Phone Number");
            isValid = false
        }else{
            phoneDiv.querySelector('input').style.border='1px solid gray'
            phoneDiv.querySelector('p').style.display='none'
        }

        if(!city){
            cityDiv.querySelector('input').style.border='1px solid red'
            cityDiv.querySelector('p').style.display='block'
            isValid = false
        }else{
            cityDiv.querySelector('input').style.border='1px solid gray'
            cityDiv.querySelector('p').style.display='none'
        }



        if (isValid){
            const spinner = document.getElementById("admin-spinner");
            spinner.style.display = "flex"
            const response = await fetch("/validatePincode",{
                method : "post",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    state,
                    city,
                    pincode
                })
            })

            const data = await response.json()
            spinner.style.display = "none"
            if (!data.success) {
                isValid = false
                return showToast(data.message,"error")
            }
        }

        if (isValid) {
            event.target.submit()
        }
    })

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