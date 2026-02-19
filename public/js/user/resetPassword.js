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

        if (newPassword == "" || confirmPassword == ""){
            swal("Please fill all the fields");
            return false
        } else if (/^\s*$/.test(newPassword)) {
            swal("newPassword cannot be empty or spaces only");
            return false;
        }else if (newPassword != confirmPassword){
            swal("Password Not Matching")
            return false
        }

        event.target.submit()
        return true
    }