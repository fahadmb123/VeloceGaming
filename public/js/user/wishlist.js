    function setupSearchBar(inputId, clearBtnId) {
        const input = document.getElementById(inputId);
        const clearBtn = document.getElementById(clearBtnId);

        if (!input || !clearBtn) return;

        input.addEventListener('input', () => {
            if (input.value.length > 0) {
                clearBtn.classList.add('active');
            } else {
                clearBtn.classList.remove('active');
            }
        });

        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.classList.remove('active');
            input.focus();
        });
    }

    setupSearchBar('shopSearchInput', 'clearSearchBtn');
    setupSearchBar('desktopSearchInput', 'clearDesktopSearchBtn');



function handleRemove (event,id) {
    event.preventDefault()
    event.stopPropagation()
    removeWishlist(id)
}

async function removeWishlist (id) {
    try {

        
        
        const response = await fetch(`/wishlist/remove/${id}`,{
            method : "post",
            headers : {
                "content-type" : "application/json"
            }
        })
        const data = await response.json()

        
        if (data.success){
          let card = document.getElementById(`wishlist-${id}`)
          if (card) {
            card.remove()
          }
          showToast("Product Removed","success")
        } else {
            showToast(data.message,"error")
        }


    } catch (err) {
        console.log(err)
    }
}




async function addToCart (id) {
    try {

        const response = await fetch(`/cart/add?variantId=${id}`,{
            method : "post"
        })

        const data = await response.json()

        if (data.loginRequired) {
            window.location.href = "/login"
        }

        if (data.success) {
            let card = document.getElementById(`wishlist-${id}`)
            if (card) {
                card.remove()
            }
            showToast(data.message,"success")
            
            setTimeout(()=>{window.location.reload()},500)
        }else {
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

async function moveAllToBag() {
    try {

        const response = await fetch ("/wishlist/allToCart",{
            method : "post"
        })
        const data = await response.json()

        if (data.loginRequired) {
            return window.location.href = "/login"
        }

        if (data.success) {
            const container = document.querySelector(".wishlist-container")
            if (container) {
                container.innerHTML = "<h1>Products Not Found </h1>"
            }
            showToast(data.message,"success")
            
            setTimeout(()=>{window.location.reload()},500)
        }else {
            showToast(data.message,"error")
        }

    } catch (err) {
        console.log(err)
    }
}