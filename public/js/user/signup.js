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


    document.getElementById("registerForm").addEventListener("submit", function (event) {


        
        event.preventDefault()

        let name = document.getElementById("name").value.trim()
        let email = document.getElementById("email").value.trim()
        let password = document.getElementById("password").value.trim()
        let confirmPassword = document.getElementById("confirmPassword").value.trim()
        let refferalCode = document.getElementById("refferalCode")

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
            passwordDiv.querySelector('input').style.border='1px solid red'
            passwordDiv.querySelector('p').style.display='block'
            isValid = false
        }else{
            passwordDiv.querySelector('input').style.border='1px solid gray'
            passwordDiv.querySelector('p').style.display='none'
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

        if(!confirmPassword){
            confirmPasswordDiv.querySelector('input').style.border='1px solid red'
            confirmPasswordDiv.querySelector('p').style.display='block'
            isValid = false
        }else{
            confirmPasswordDiv.querySelector('input').style.border='1px solid gray'
            confirmPasswordDiv.querySelector('p').style.display='none'
        }

        if (isValid) {
            event.target.submit()
        }
    })