let errorMessageElement = document.getElementById("flashErrorMessage");
    let successMessageElement = document.getElementById("flashSuccessMessage");

    if (errorMessageElement && errorMessageElement.innerText.trim() !== "") {
    showToast(errorMessageElement.innerText,"error");
    } else if (successMessageElement && successMessageElement.innerText.trim() !== "") {
    showToast(successMessageElement.innerText,"error");
    }




    document.querySelectorAll('.quantity-control').forEach(control => {
        const input = control.querySelector('input');
        const upBtn = control.querySelector('.qty-up');
        const downBtn = control.querySelector('.qty-down');

        upBtn.addEventListener('click', () => {
            let val = parseInt(input.value);
            val++;
            input.value = val < 10 ? '0' + val : val;
        });

        downBtn.addEventListener('click', () => {
            let val = parseInt(input.value);
            if (val > 1) {
                val--;
                input.value = val < 10 ? '0' + val : val;
            }
        });
    });


async function incQuantity(id) {
    try {
        const response = await fetch(`/cart/inc?variantId=${id}`,{
            method:"post"
        })

        const data = await response.json()

        if (data.loginRequired){
            return window.location.href = "/login"
        }

        if (data.success) {
            showToast(data.message,"success")
            
            const card = document.getElementById(`cart-${id}`)

            const qtyInput = card.querySelector(".quantityInput")
            const subtotalEl = card.querySelector(".itemSubtotalInput")

            let price = Number(card.dataset.price)

            qtyInput.value = data.item.quantity

            subtotalEl.innerHTML =
                `Subtotal : <span>₹ ${(data.item.quantity * price).toLocaleString("en-IN")}</span>`
            
            document.getElementById("totalInput").innerHTML = `₹ ${data.total.toLocaleString("en-IN")}`

        } else {
            showToast(data.message,"error")
        }
    } catch (err) {
        console.log(err)
        showToast("Somthing Went Wrong","error")
    }
}

async function decQuantity(id) {
    try {
        const response = await fetch(`/cart/dec?variantId=${id}`,{
            method:"post"
        })

        
        const data = await response.json()

        if (data.loginRequired){
            return window.location.href = "/login"
        }

        if (data.success) {
            showToast(data.message,"success")

            const card = document.getElementById(`cart-${id}`)

            const qtyInput = card.querySelector(".quantityInput")
            const subtotalEl = card.querySelector(".itemSubtotalInput")

            let price = Number(card.dataset.price)

            qtyInput.value = data.item.quantity

            subtotalEl.innerHTML =
                `Subtotal : <span>₹ ${(data.item.quantity * price).toLocaleString("en-IN")}</span>`

            document.getElementById("totalInput").innerHTML = `₹ ${data.total.toLocaleString("en-IN")}`
        } else {
            showToast(data.message,"error")
        }
    } catch (err) {
        console.log(err)
        showToast("Somthing Went Wrong","error")
    }
}


function handleRemove (event,id) {
    event.preventDefault()
    event.stopPropagation()
    removeCart(id)
}
async function removeCart (id) {
    try {

        
        
        const response = await fetch(`/cart/remove/${id}`,{
            method : "post",
            headers : {
                "content-type" : "application/json"
            }
        })
        const data = await response.json()

        
        if (data.success){
          let card = document.getElementById(`cart-${id}`)
          if (card) {
            card.remove()
          }
          showToast("Product Removed","success")

          document.getElementById("totalInput").innerHTML = `₹ ${data.total.toLocaleString("en-IN")}`
        } else {
            showToast(data.message,"error")
        }


    } catch (err) {
        console.log(err)
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