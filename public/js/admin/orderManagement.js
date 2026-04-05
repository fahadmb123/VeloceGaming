

// Edit Status Modal Logic
const editButtons = document.querySelectorAll(".edit-btn");
const editModal = document.getElementById("editStatusModal");
const closeModal = document.querySelector(".close-modal");
const cancelEditStatus = document.getElementById("cancelEditStatus");
const editStatusForm = document.getElementById("editStatusForm");

const statusSelect = document.getElementById("orderStatus");

function openEditModal(currentStatus, orderId, orderItemId) {
  editModal.classList.add("show");

  document.getElementById("orderId").value = orderId;
  document.getElementById("itemId").value = orderItemId;

  statusSelect.innerHTML = "";

  let statuses = [];

  if (currentStatus === "placed") {
    statuses = ["placed", "shipped", "cancelled"];
  } else if (currentStatus === "shipped") {
    statuses = ["shipped", "outForDelivery"];
  } else if (currentStatus == "ofd") {
    statuses = ["outForDelivery", "delivered"];
  } else if (currentStatus === "delivered") {
    statuses = ["delivered", "returned"];
  } else {
    statuses = [currentStatus];
  }

  statuses.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    statusSelect.appendChild(option);
  });

  if (currentStatus == "ofd") {
    currentStatus = "outForDelivery";
  }
  statusSelect.value = currentStatus;

  //document.getElementById("editStatusModal").style.display = "block"
}

closeModal.addEventListener("click", () => {
  editModal.classList.remove("show");
});

cancelEditStatus.addEventListener("click", () => {
  editModal.classList.remove("show");
});

window.addEventListener("click", (e) => {
  if (e.target === editModal) {
    editModal.classList.remove("show");
  }
});

editStatusForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  // Logic to handle status update goes here

  let status = statusSelect.value;
  const orderId = document.getElementById("orderId").value;
  const orderItemId = document.getElementById("itemId").value;
  if (status == "outForDelivery") {
    status = "ofd";
  }
  const response = await fetch(`/admin/orderManagement/updateOrderStatus`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderStatus: status,
      orderId: orderId,
      orderItemId: orderItemId,
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

  editModal.classList.remove("show");
});

async function viewDetails(orderId, orderItemId) {
  try {
    window.location.href = `/admin/orderDetails?orderId=${orderId}&orderItemId=${orderItemId}`;
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
