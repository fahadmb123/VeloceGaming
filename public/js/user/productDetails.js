    let errorMessageElement = document.getElementById("flashErrorMessage");
    let successMessageElement = document.getElementById("flashSuccessMessage");

    if (errorMessageElement && errorMessageElement.innerText.trim() !== "") {
    showToast(errorMessageElement.innerText,"error");
    } else if (successMessageElement && successMessageElement.innerText.trim() !== "") {
    showToast(successMessageElement.innerText,"error");
    }


document.getElementById("searchIconDesktop").addEventListener("click", function () {

    const value = document.getElementById("desktopSearchInput").value.trim();

    if (value) {
        window.location.href = `/shop?search=${encodeURIComponent(value)}`;
    }

});
    

    
    const searchInputs = document.querySelectorAll('#desktopSearchInput, #shopSearchInput');

    searchInputs.forEach(input => {
        const clearBtn = input.nextElementSibling.querySelector('.clear-search');

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
    });


    
        const mainImg = document.querySelector('.main-image img');
        const thumbnails = document.querySelectorAll('.thumbnail');

        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                const newSrc = thumb.querySelector('img').src;
                mainImg.style.opacity = '0';
                setTimeout(() => {
                    mainImg.src = newSrc;
                    mainImg.style.opacity = '1';
                }, 200);
            });
        });


        const box = document.getElementById('mainImageBox');
        const pane = document.getElementById('zoomPane');

        box.addEventListener('mouseenter', () => {
            pane.style.backgroundImage = `url('${mainImg.src}')`;
            pane.style.backgroundSize = '250%';
            pane.style.display = 'block';
        });
        box.addEventListener('mousemove', e => {
            const r = box.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width * 100;
            const y = (e.clientY - r.top) / r.height * 100;
            pane.style.backgroundPosition = `${x}% ${y}%`;
        });
        box.addEventListener('mouseleave', () => pane.style.display = 'none');



async function toggleWishlist(variantId,button) {
    try {
        //event.preventDefault();
        //event.stopPropagation();
        const response = await fetch ("/wishlist/toggle",{
            method : "post",
            headers : {
                "content-type" : "application/json"
            },
            body : JSON.stringify({variantId})
        })

        const data = await response.json()

        if (data.loginRequired){
            window.location.href = "/login"
            return 
        }
        
        const icon = button.querySelector('i');
        if (data.added) {
            button.classList.add("active")
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            showToast("Product Added To The Wishlist","success")
        }else {
            button.classList.remove("active")
            button.querySelector("i").classList.replace("fa-solid","fa-regular")
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




async function addToCart (id) {
    try {

        const response = await fetch(`/cart/add?variantId=${id}`,{
            method : "post"
        })

        const data = await response.json()

        if (data.loginRequired) {
            return window.location.href = "/login"
        }
        
        const cartElement = document.getElementById("cartCountLogo");
        if (cartElement) {
            cartElement.style.display = "flex"
            cartElement.innerText = data.cartCount.toString();
        }

        if (data.success) {
            showToast(data.message,"success")
            
            return
        }else {
            return showToast(data.message,"error")
        }
    } catch (err) {
        console.log(err)
    }
}


function buyNow(id){
    window.location.href = `/checkout?variantId=${id}&quantity=1`
}