function togglePassword(inputId, el) {
        const input = document.getElementById(inputId);
        if (input.type === "password") {
            input.type = "text";
            el.textContent = "Hide";
        } else {
            input.type = "password";
            el.textContent = "Show";
        }
    }


    document.getElementById("registerForm").addEventListener("submit",async function (event) {


        
        event.preventDefault()

        let name = document.getElementById("name").value.trim()
        let email = document.getElementById("email").value.trim()
        let password = document.getElementById("password").value.trim()
        let confirmPassword = document.getElementById("confirmPassword").value.trim()
        let refferalCode = document.getElementById("refferalCode").value.trim()

        const nameDiv=document.getElementById('nameDiv');
        const passwordDiv=document.getElementById('passwordDiv');
        const emailDiv=document.getElementById('emailDiv');
        const confirmPasswordDiv=document.getElementById('confirmPasswordDiv');


       let isValid = true
       if(!email){
            emailDiv.querySelector('input').style.border='1px solid red'
            emailDiv.querySelector('p').style.display='block'
            isValid = false
        }else{
            emailDiv.querySelector('input').style.border='1px solid gray'
            emailDiv.querySelector('p').style.display='none'
        }

        if(!password){
            passwordDiv.querySelector('p').innerText = "Password Required"
            passwordDiv.querySelector('input').style.border='1px solid red'
            passwordDiv.querySelector('p').style.display='block'
            isValid = false
        }
        else if(!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()[\]{};:'",.<>/?\\|_+\-=]).{6,20}$/.test(password)){
            passwordDiv.querySelector('p').innerText = "Password must include letter, number and special character"
            passwordDiv.querySelector('input').style.border='1px solid red'
            passwordDiv.querySelector('p').style.display='block'
            isValid = false
        }
        else if(password.length < 6){
            passwordDiv.querySelector('p').innerText = "Password Must At Least 6 Charecters"
            passwordDiv.querySelector('input').style.border='1px solid red'
            passwordDiv.querySelector('p').style.display='block'
            isValid = false
        }else{
            passwordDiv.querySelector('input').style.border='1px solid gray'
            passwordDiv.querySelector('p').style.display='none'
        }

        if(!name ){
            nameDiv.querySelector('p').innerText = "Name is Required"
            nameDiv.querySelector('input').style.border='1px solid red'
            nameDiv.querySelector('p').style.display='block'
            isValid = false
        }
        else if (name.length <= 3){
            nameDiv.querySelector('p').innerText = "Name must be at least 3 letters"
            nameDiv.querySelector('input').style.border='1px solid red'
            nameDiv.querySelector('p').style.display='block'
            isValid = false
        }
        
        else if (!/^[A-Za-z\s]+$/.test(name)){
            nameDiv.querySelector('p').innerText = "Only letters allowed"
            nameDiv.querySelector('input').style.border='1px solid red'
            nameDiv.querySelector('p').style.display='block'
            isValid = false
        }
        else if (/\s{2,}/.test(name)){
            nameDiv.querySelector('p').innerText = "Too Many Spaces Contains"
            nameDiv.querySelector('input').style.border='1px solid red'
            nameDiv.querySelector('p').style.display='block'
            isValid = false
        }
        else{
            nameDiv.querySelector('input').style.border='1px solid gray'
            nameDiv.querySelector('p').style.display='none'
        }

        if(!confirmPassword){
            confirmPasswordDiv.querySelector('input').style.border='1px solid red'
            confirmPasswordDiv.querySelector('p').style.display='block'
            isValid = false
        }else{
            confirmPasswordDiv.querySelector('input').style.border='1px solid gray'
            confirmPasswordDiv.querySelector('p').style.display='none'
        }

        if (isValid) {
            if (confirmPassword != password) {
                showToast("Password Not Matching","error")
                isValid = false
            }
        }

        if (refferalCode) {

            const response = await fetch("/checkRefferal",{
                method : "post",
                headers : {
                    "content-Type" : "application/json"
                },
                body : JSON.stringify({
                    refferalCode
                })
            })
            const data = await response.json()

            if (!data.success) {
                showToast(data.message,"error")
                isValid = false
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