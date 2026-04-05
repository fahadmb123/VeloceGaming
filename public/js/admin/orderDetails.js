const modalOverlay = document.getElementById("pickupModalOverlay");
document.addEventListener("DOMContentLoaded", () => {
  const scheduleBtn = document.getElementById("schedulePickupBtn");

  const closeBtn = document.getElementById("closeModalBtn");

  if (scheduleBtn && modalOverlay) {
    scheduleBtn.addEventListener("click", () => {
      modalOverlay.classList.add("active");
    });
  }

  if (closeBtn && modalOverlay) {
    closeBtn.addEventListener("click", () => {
      modalOverlay.classList.remove("active");
    });
  }

  const dateInput = document.getElementById("pickupDate");
  if (dateInput) {
    const today = new Date();
    dateInput.min = today.toISOString().split("T")[0];
  }
});

function redirectOrders() {
  window.location.href = "/admin/orderManagement";
}

async function confirmPickupSlot(orderId, orderItemId) {
  try {
    const pickUpTime = document.getElementById("pickupWindow").value;
    const pickUpDate = document.getElementById("pickupDate").value;
    const dateDiv = document.getElementById("dateDiv");
    const timeDiv = document.getElementById("timeDiv");
    let isValid = true;

    if (!pickUpDate) {
      dateDiv.querySelector("input").style.border = "1px solid red";
      dateDiv.querySelector("p").style.display = "block";
      isValid = false;
    } else {
      dateDiv.querySelector("input").style.border = "1px solid gray";
      dateDiv.querySelector("p").style.display = "none";
    }

    if (!pickUpTime) {
      timeDiv.querySelector("select").style.border = "1px solid red";
      timeDiv.querySelector("p").style.display = "block";
      isValid = false;
    } else {
      timeDiv.querySelector("select").style.border = "1px solid gray";
      timeDiv.querySelector("p").style.display = "none";
    }

    if (isValid) {
      const response = await fetch(
        "/admin/orderManagement/returnRequestAccept",
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: orderId,
            orderItemId: orderItemId,
            pickUpDate,
            pickUpTime,
          }),
        },
      );

      const data = await response.json();

      if (data.loginRequired) {
        return (window.location.href = "/admin/login");
      }

      if (data.success) {
        showToast(data.message, "success");
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        showToast(data.message, "error");
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
      modalOverlay.classList.remove("active");
    }
  } catch (err) {
    console.log(err);
  }
}

async function rejectReturnRequest(orderId, orderItemId) {
  try {
    const response = await fetch("/admin/orderManagement/rejectReturnRequest", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        orderItemId,
      }),
    });

    const data = await response.json();

    if (data.loginRequired) {
      return (window.location.href = "/admin/login");
    }

    if (data.success) {
      showToast(data.message, "success");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      showToast(data.message, "error");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  } catch (err) {
    console.log(err);
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
