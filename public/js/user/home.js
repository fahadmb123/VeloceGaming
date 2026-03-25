    let messageElement = document.getElementById("swalMessage");

    if (messageElement && messageElement.innerText.trim() !== "") {
    swal(messageElement.innerText);
    }

    
        function setupSearchBar(inputId, clearBtnId) {
            const input = document.getElementById(inputId);
            const clearBtn = document.getElementById(clearBtnId);

            if (!input || !clearBtn) return

            input.addEventListener('input', () => {
                if (input.value.length > 0) {
                    clearBtn.classList.add('active')
                } else {
                    clearBtn.classList.remove('active')
                }
            });

            clearBtn.addEventListener('click', () => {
                input.value = '';
                clearBtn.classList.remove('active')
                input.focus()
            })
        }

        setupSearchBar('shopSearchInput', 'clearSearchBtn')
        setupSearchBar('desktopSearchInput', 'clearDesktopSearchBtn')



document.getElementById("searchIconDesktop").addEventListener("click", function () {

    const value = document.getElementById("desktopSearchInput").value.trim();

    if (value) {
        window.location.href = `/shop?search=${encodeURIComponent(value)}`;
    }

});


        // Category Carousel Logic
        const carousel = document.getElementById('categoryCarousel')
        const dots = document.querySelectorAll('#paginationDots .dot')
        const prevBtn = document.getElementById('prevBtn')
        const nextBtn = document.getElementById('nextBtn')

        function updateActiveDot() {
            const scrollLeft = carousel.scrollLeft;
            const itemWidth = carousel.querySelector('.category-card').offsetWidth + 30; // item + gap
            const index = Math.round(scrollLeft / itemWidth);

            // Adjust index to map to dots (since we have 3 dots for 6 items in 2col or 1col)
            // On desktop: 0-1 -> dot0, 2-3 -> dot1, 4-5 -> dot2
            // On mobile: 0-1 -> dot0, 2-3 -> dot1, 4-5 -> dot2 (approx)
            let dotIndex = Math.min(Math.floor(index / 2), dots.length - 1);
            if (window.innerWidth <= 768) {
                dotIndex = Math.min(Math.floor(index / 2), dots.length - 1);
            }

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === dotIndex);
            });
        }

        carousel.addEventListener('scroll', updateActiveDot);

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                const itemWidth = carousel.querySelector('.category-card').offsetWidth + 30;
                carousel.scrollTo({
                    left: i * itemWidth * 2,
                    behavior: 'smooth'
                });
            });
        });

        prevBtn.addEventListener('click', () => {
            const itemWidth = carousel.querySelector('.category-card').offsetWidth + 30;
            carousel.scrollBy({
                left: -itemWidth * 2,
                behavior: 'smooth'
            });
        });

        nextBtn.addEventListener('click', () => {
            const itemWidth = carousel.querySelector('.category-card').offsetWidth + 30;
            carousel.scrollBy({
                left: itemWidth * 2,
                behavior: 'smooth'
            });
            resetAutoScroll();
        });

        prevBtn.addEventListener('click', resetAutoScroll);

        // Auto-Scroll Logic
        const autoScrollDelay = 3000; // 3 seconds
        let autoScrollInterval;

        function autoScroll() {
            const itemWidth = carousel.querySelector('.category-card').offsetWidth + 30;
            const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

            if (carousel.scrollLeft >= maxScrollLeft - 5) {
                // Reached the end, loop back to start
                carousel.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                carousel.scrollBy({ left: itemWidth * 2, behavior: 'smooth' });
            }
        }

        function startAutoScroll() {
            stopAutoScroll();
            autoScrollInterval = setInterval(autoScroll, autoScrollDelay);
        }

        function stopAutoScroll() {
            clearInterval(autoScrollInterval);
        }

        function resetAutoScroll() {
            stopAutoScroll();
            startAutoScroll();
        }

        // Pause on hover, resume on leave
        const container = document.querySelector('.category-carousel-container');
        container.addEventListener('mouseenter', stopAutoScroll);
        container.addEventListener('mouseleave', startAutoScroll);

        // Start auto-scroll on page load
        startAutoScroll();


        document.querySelectorAll('.wishlist-icon').forEach(icon => {
            icon.addEventListener('click', function (e) {
                e.stopPropagation();
                this.classList.toggle('active');
                if (this.classList.contains('active')) {
                    this.classList.remove('fa-regular');
                    this.classList.add('fa-solid');
                } else {
                    this.classList.remove('fa-solid');
                    this.classList.add('fa-regular');
                }
            });
        });



        async function toggleWishlist(event,variantId,button) {
    try {
        event.preventDefault();
        event.stopPropagation();
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
