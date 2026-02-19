let messageElement = document.getElementById("swalMessage");

    if (messageElement && messageElement.innerText.trim() !== "") {
    swal(messageElement.innerText);
    }


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

        const email = document.getElementById("email").value.trim()
        const password = document.getElementById("password").value.trim()

        const emailDiv=document.getElementById('emailDiv');
        const passwordDiv=document.getElementById('passwordDiv');


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

        if (isValid) {
            event.target.submit()
        }
    })