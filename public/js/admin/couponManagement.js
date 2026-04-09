document.addEventListener("DOMContentLoaded", () => {
  // Search Clear Button Logic
  const couponSearchInput = document.getElementById("couponSearchInput");
  const clearSearch = document.getElementById("clearSearch");

  if (couponSearchInput && clearSearch) {
    couponSearchInput.addEventListener("input", () => {
      if (couponSearchInput.value.length > 0) {
        clearSearch.style.display = "block";
      } else {
        clearSearch.style.display = "none";
      }
    });

    clearSearch.addEventListener("click", () => {
      couponSearchInput.value = "";
      clearSearch.style.display = "none";
      couponSearchInput.focus();
      window.location.href = "/admin/couponManagement?filter=<%= filter %>";
    });
  }
  couponSearchInput.addEventListener("input", () => {
    clearSearch.style.display = couponSearchInput.value ? "block" : "none";
  });
  if (couponSearchInput.value.trim() !== "") {
    clearSearch.style.display = "block";
  }
  couponSearchInput.addEventListener("input", () => {
    clearSearch.style.display =
      couponSearchInput.value.trim() !== "" ? "block" : "none";
  });

  clearSearch.addEventListener("click", () => {
    couponSearchInput.value = "";
    clearSearch.style.display = "none";
    couponSearchInput.focus();
    window.location.href = "/admin/couponManagement?filter=<%= filter %>";
  });

  // --- Unified Modal Logic ---
  const modal = document.getElementById("couponModal");
  const modalTitle = document.getElementById("modalTitle");
  const submitBtn = document.getElementById("submitBtn");
  const cancelBtn = document.getElementById("cancelModal");
  const couponForm = document.getElementById("couponForm");

  const addBtn = document.getElementById("addCouponBtn");
  const editBtnList = document.querySelectorAll(".edit-btn");
  let currentMode;
  let couponId;
  // Open for Add
  addBtn.addEventListener("click", () => {
    modalTitle.textContent = "Add Coupon";
    submitBtn.textContent = "Add";
    couponForm.reset();
    modal.classList.add("show");
    currentMode = "add";

   
    const typeElement = document.getElementById("discountType");
    const maxDiscountDiv = document.getElementById("maxDiscountDiv");

    if (typeElement.value === "flat") {
        maxDiscountDiv.style.display = "none";
    } else {
        maxDiscountDiv.style.display = "block";
    }
  });

  // Open for Edit
  window.editCoupon = function editCoupon(btn) {
    const coupon = JSON.parse(btn.dataset.coupon);

    modalTitle.textContent = "Edit Coupon Details";
    submitBtn.textContent = "Save";

    const typeElement = document.getElementById("discountType");
    const maxDiscountDiv = document.getElementById("maxDiscountDiv");

    if (coupon?.type === "flat") {
        maxDiscountDiv.style.display = "none";
    } else {
        maxDiscountDiv.style.display = "block";
    }

    
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    const row = btn.closest("tr");
    const code = row.querySelector(".code-val").textContent;
    document.getElementById("couponCode").value = coupon?.code;
    document.getElementById("discountType").value = coupon?.type;
    document.getElementById("discountValue").value = coupon?.discountValue;
    document.getElementById("minPurchase").value = coupon?.minPurchase;
    document.getElementById("maxDiscount").value = coupon?.maxDiscount;
    document.getElementById("expDate").min = today;
    document.getElementById("expDate").value = coupon?.expiryDate.split("T")[0];
    document.getElementById("maxUsage").value = coupon?.maxUsage;
    currentMode = "edit";
    couponId = coupon?._id;
    modal.classList.add("show");
  };

  cancelBtn.addEventListener("click", () => {
    modal.classList.remove("show");
    window.location.reload();
  });

  couponForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const couponCode = document.getElementById("couponCode").value.trim();
    const discountType = document.getElementById("discountType").value.trim();
    const discountValue = document.getElementById("discountValue").value.trim();
    const minPurchase = document.getElementById("minPurchase").value.trim();
    const maxDiscount = document.getElementById("maxDiscount").value.trim();
    const expDate = document.getElementById("expDate").value.trim();
    const maxUsage = document.getElementById("maxUsage").value.trim();

    //Divsss
    const codeDiv = document.getElementById("codeDiv");
    const discountTypeDiv = document.getElementById("discountTypeDiv");
    const discountValueDiv = document.getElementById("discountValueDiv");
    const minPurchaseDiv = document.getElementById("minPurchaseDiv");
    const maxDiscountDiv = document.getElementById("maxDiscountDiv");
    const expDateDiv = document.getElementById("expDateDiv");
    const maxUsageDiv = document.getElementById("maxUsageDiv");
    let isValid = true;

    if (!couponCode || couponCode.length < 5) {
      codeDiv.querySelector("input").style.border = "1px solid red";
      codeDiv.querySelector("p").style.display = "block";
      isValid = false;
    } else {
      codeDiv.querySelector("input").style.border = "1px solid gray";
      codeDiv.querySelector("p").style.display = "none";
    }

    if (!discountType) {
      discountTypeDiv.querySelector("select").style.border = "1px solid red";
      discountTypeDiv.querySelector("p").style.display = "block";
      isValid = false;
    } else {
      discountTypeDiv.querySelector("select").style.border = "1px solid gray";
      discountTypeDiv.querySelector("p").style.display = "none";
    }

    if (!discountType) {
      discountTypeDiv.querySelector("select").style.border = "1px solid red";
      discountTypeDiv.querySelector("p").style.display = "block";
      isValid = false;
    } else {
      discountTypeDiv.querySelector("select").style.border = "1px solid gray";
      discountTypeDiv.querySelector("p").style.display = "none";
    }

    if (!discountValue || Number(discountValue) < 0) {
      discountValueDiv.querySelector("p").innerText = "Discount Value Required";
      discountValueDiv.querySelector("input").style.border = "1px solid red";
      discountValueDiv.querySelector("p").style.display = "block";
      isValid = false;
    } else {
      discountValueDiv.querySelector("input").style.border = "1px solid gray";
      discountValueDiv.querySelector("p").style.display = "none";
    }

    if (isValid) {
      if (discountType === "percentage") {
        if (discountValue > 100) {
          discountValueDiv.querySelector("input").style.border =
            "1px solid red";
          discountValueDiv.querySelector("p").innerText = "Invalid Value";
          discountValueDiv.querySelector("p").style.display = "block";
          isValid = false;
        } else {
          discountValueDiv.querySelector("input").style.border =
            "1px solid gray";
          discountValueDiv.querySelector("p").style.display = "none";
        }
      }
    }

    if (!minPurchase || Number(minPurchase) < 0) {
      minPurchaseDiv.querySelector("input").style.border = "1px solid red";
      minPurchaseDiv.querySelector("p").style.display = "block";
      isValid = false;
    } else {
      minPurchaseDiv.querySelector("input").style.border = "1px solid gray";
      minPurchaseDiv.querySelector("p").style.display = "none";
    }

    if (isValid) {
      if (discountType === "percentage") {
        if (!maxDiscount || maxDiscount < 0) {
          maxDiscountDiv.querySelector("input").style.border = "1px solid red";
          maxDiscountDiv.querySelector("p").style.display = "block";
          isValid = false;
        } else {
          maxDiscountDiv.querySelector("input").style.border = "1px solid gray";
          maxDiscountDiv.querySelector("p").style.display = "none";
          const maxDisc = Number(maxDiscount);
          const maxPossible = minPurchase * (discountValue / 100);
          if (maxDisc > maxPossible) {
            showToast(`Max discount cannot exceed ₹${maxPossible}`, "error");
            return;
          }
        }
      } else {
        if (Number(discountValue) >= Number(minPurchase)) {
          discountValueDiv.querySelector("p").innerText =
            "Discount Value Should Be Lower Than Min Purchase";
          discountValueDiv.querySelector("input").style.border =
            "1px solid red";
          discountValueDiv.querySelector("p").style.display = "block";
          isValid = false;
        }
      }
    }

    if (!expDate) {
      expDateDiv.querySelector("input").style.border = "1px solid red";
      expDateDiv.querySelector("p").style.display = "block";
      isValid = false;
    } else {
      expDateDiv.querySelector("input").style.border = "1px solid gray";
      expDateDiv.querySelector("p").style.display = "none";
    }

    if (!maxUsage || Number(maxUsage) < 0) {
      maxUsageDiv.querySelector("input").style.border = "1px solid red";
      maxUsageDiv.querySelector("p").style.display = "block";
      isValid = false;
    } else {
      maxUsageDiv.querySelector("input").style.border = "1px solid gray";
      maxUsageDiv.querySelector("p").style.display = "none";
    }

    if (isValid) {
      let url;

      if (currentMode === "edit") {
        url = `/admin/editCoupon?id=${couponId}`;
      } else if (currentMode === "add") {
        url = "/admin/addCoupon";
      }

      const response = await fetch(url, {
        method: "post",
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode,
          discountType,
          discountValue,
          minPurchase,
          maxDiscount,
          expDate,
          maxUsage,
        }),
      });
      const data = await response.json();
      if (data.loginRequried) {
        return (window.location.href = "/admin/login");
      }
      if (data.validateFail) {
        return showToast(data.message, "error");
      }
      if (!data.success) {
        return showToast(data.message, "error");
      } else {
        modal.classList.remove("show");
        showToast(data.message, "success");
        setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      }
    }
  });

  // Close when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("show");
    }
  });
});
const couponInput = document.getElementById("couponCode");
couponInput.addEventListener("input", function () {
  this.value = this.value.toUpperCase();
});

async function couponStatus(couponId, status) {
  const response = await fetch(
    `/admin/couponStatus?id=${couponId}&status=${status}`,
    {
      method: "post",
    },
  );
  const data = await response.json();

  if (data.loginRequried) {
    return (window.location.href = "/admin/login");
  }

  if (data.success) {
    showToast(data.message, "success");
    setTimeout(() => {
      window.location.reload();
    }, 500);
    return;
  } else {
    showToast(data.message, "error");
    return;
  }
}

document.addEventListener("DOMContentLoaded", function () {

    const typeElement = document.getElementById("discountType");
    const maxDiscountDiv = document.getElementById("maxDiscountDiv");

    if (!typeElement || !maxDiscountDiv) return;

    function toggleMaxDiscount() {
        const type = typeElement.value.trim();

        if (type === "flat") {
            maxDiscountDiv.style.display = "none";
        } else {
            maxDiscountDiv.style.display = "block";
        }
    }

    // Run initially
    toggleMaxDiscount();

    // Run when dropdown changes
    typeElement.addEventListener("change", toggleMaxDiscount);
});

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
