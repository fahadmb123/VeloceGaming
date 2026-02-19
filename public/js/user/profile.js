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


    function copyCode() {
    const text = document.getElementById("referralText").innerText;

    navigator.clipboard.writeText(text)
        .then(() => alert("Copied!"));
    }

    let messageElement = document.getElementById("swalMessage");

    if (messageElement && messageElement.innerText.trim() !== "") {
        swal(messageElement.innerText);
    }



    document.getElementById("registerForm").addEventListener("submit", function (event) {


        
        event.preventDefault()

        let name = document.getElementById("name").value.trim()
        let email = document.getElementById("email").value.trim()
        let currentPassword = document.getElementById("currentPassword").value.trim()
        let newPassword = document.getElementById("newPassword").value.trim()
        let confirmPassword = document.getElementById("confirmPassword").value.trim()

        const nameDiv = document.getElementById('nameDiv');
        const newPasswordDiv = document.getElementById('newPasswordDiv');
        const emailDiv = document.getElementById('emailDiv');
        const currentPasswordDiv = document.getElementById('currentPasswordDiv');
        const confirmPasswordDiv = document.getElementById('confirmPasswordDiv');


       let isValid = true
       if(!email){
            emailDiv.querySelector('input').style.border='1px solid red'
            emailDiv.querySelector('p').style.display='block'
            isValid = false
        }else{
            emailDiv.querySelector('input').style.border='1px solid gray'
            emailDiv.querySelector('p').style.display='none'
        }

        

        if(!name ){
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
        

        if (currentPassword) {
            if(!newPassword){
                newPasswordDiv.querySelector('input').style.border='1px solid red'
                newPasswordDiv.querySelector('p').style.display='block'
                isValid = false
            }else{
                newPasswordDiv.querySelector('input').style.border='1px solid gray'
                newPasswordDiv.querySelector('p').style.display='none'
            }
            
            if(!currentPassword){
                currentPasswordDiv.querySelector('input').style.border='1px solid red'
                currentPasswordDiv.querySelector('p').style.display='block'
                isValid = false
            }else{
                currentPasswordDiv.querySelector('input').style.border='1px solid gray'
                currentPasswordDiv.querySelector('p').style.display='none'
            }

            if(!confirmPassword){
                confirmPasswordDiv.querySelector('input').style.border='1px solid red'
                confirmPasswordDiv.querySelector('p').style.display='block'
                isValid = false
            }else{
                confirmPasswordDiv.querySelector('input').style.border='1px solid gray'
                confirmPasswordDiv.querySelector('p').style.display='none'
           }

           if (newPassword !== confirmPassword){
            swal("New And Confirm Password Is Not Match")
            isValid = false
           }
        }
        

        if (isValid) {
            event.target.submit()
        }
    })

    window.addEventListener("pageshow", function (event) {
        if (event.persisted) {
            window.location.reload();
        }
    });