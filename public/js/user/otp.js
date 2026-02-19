const timerElement = document.getElementById("timer");
  const otpExpiryTime = Number(timerElement.dataset.expiry);

  function updateTimer() {
    const now = Date.now();
    const distance = otpExpiryTime - now;

    if (distance <= 0) {
      timerElement.innerHTML = "OTP Expired";
      return;
    }

    const minutes = Math.floor(distance / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    timerElement.innerHTML =
      "Time remaining: " + minutes + "m " + seconds + "s";
  }

  updateTimer();
  setInterval(updateTimer, 1000);

  document.addEventListener("DOMContentLoaded",()=>{
        document.querySelector("form").addEventListener("submit",formValidate)
    })



    function formValidate (event){

        event.preventDefault()

        let otp = document.getElementById("otp").value
    

        if (!otp){
            swal("Please Enter OTP");
            return false
        }

        event.target.submit()
        return true
    }
    const resendBtn = document.getElementById("resendBtn")
    const timerText = document.getElementById("timerText")

    const MAX_RESEND = 4
    const BLOCK_TIME = 60 * 1000

    let resendCount = Number(localStorage.getItem("resendCount")) || 0
    let blockedUntil = Number(localStorage.getItem("blockedUntil")) || null

    checkBlock()

    function checkBlock() {
        if (blockedUntil && Date.now() < blockedUntil) {
            startTimer(Math.ceil((blockedUntil - Date.now()) / 1000))
        }
    }

    resendBtn.addEventListener("click", function (e) {


    e.preventDefault()


    if (blockedUntil && Date.now() < blockedUntil) {
        return
    }

    if (resendCount >= MAX_RESEND) {
        blockedUntil = Date.now() + BLOCK_TIME

        localStorage.setItem("blockedUntil", blockedUntil)
        localStorage.setItem("resendCount", 0)

        startTimer(60)
        return
    }

    resendCount++

    localStorage.setItem("resendCount", resendCount)

  
    window.location.href = "/resendOtp"
    })

    function startTimer(seconds) {

        resendBtn.style.pointerEvents = "none"
        resendBtn.style.opacity = "0.5"

        const interval = setInterval(() => {

            timerText.innerText = `Try again in ${seconds}s`
            seconds--

            if (seconds < 0) {
                clearInterval(interval)

                resendBtn.style.pointerEvents = "auto"
                resendBtn.style.opacity = "1"
                timerText.innerText = ""

                localStorage.removeItem("blockedUntil")
            }

        }, 1000)
    }
