let messageElement = document.getElementById("swalMessage");

if (messageElement && messageElement.innerText.trim() !== "") {
  swal(messageElement.innerText);
}

const togglePassword = document.querySelector("#togglePassword");
const password = document.querySelector("#password");

togglePassword.addEventListener("click", function (e) {
  const type =
    password.getAttribute("type") === "password" ? "text" : "password";
  password.setAttribute("type", type);
  this.classList.toggle("fa-eye");
  this.classList.toggle("fa-eye-slash");
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("form").addEventListener("submit", formValidate);
});

function formValidate(event) {
  event.preventDefault();

  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  if (email == "" || password == "") {
    swal("Please fill all the fields");
    return false;
  }

  event.target.submit();
  return true;
}
