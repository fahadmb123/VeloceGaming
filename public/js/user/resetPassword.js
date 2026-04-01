function togglePassword(id) {
        const input = document.getElementById(id);
        const toggle = input.nextElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            toggle.textContent = 'Hide';
        } else {
            input.type = 'password';
            toggle.textContent = 'Show';
        }
    }

    document.addEventListener("DOMContentLoaded",()=>{
        document.querySelector("form").addEventListener("submit",formValidate)
    })


    function formValidate (event){

        event.preventDefault()

        let newPassword = document.getElementById("newPassword").value
        let confirmPassword = document.getElementById("confirmPassword").value

        if(!newPassword){
            showToast("Password Required","error")
            return false
        }
        else if(!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()[\]{};:'",.<>/?\\|_+\-=]).{6,20}$/.test(newPassword)){
            
            showToast("Password must include letter, number and special character","error")
            return false
        }
        else if(newPassword.length < 6){
            showToast("Password Must At Least 6 Charecters","error")
            return false
        }
        
        if (newPassword == "" || confirmPassword == ""){
            showToast("Please fill all the fields","error");
            return false
        } else if (/^\s*$/.test(newPassword)) {
            showToast("newPassword cannot be empty or spaces only","error");
            return false;
        }else if (newPassword != confirmPassword){
            showToast("Password Not Matching","error")
            return false
        }

        event.target.submit()
        return true
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