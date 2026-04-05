    const searchInput = document.getElementById('searchInput')
    const clearSearch = document.getElementById('clearSearch')
    const modal = document.getElementById('categoryModal')
    const modalTitle = document.getElementById('modalTitle')
    const catForm = document.getElementById('categoryForm')

    let currentMode = null;
    let currentCategoryId = null;
    let cropper = null

   
    if (searchInput) {
        if (searchInput.value) clearSearch.style.display = 'block';

        searchInput.addEventListener('input', () => {
            clearSearch.style.display = searchInput.value ? 'block' : 'none';
        });
    }

    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            clearSearch.style.display = 'none';
            window.location.href = '/admin/categoryManagement';
        });
    }

    
    function openCategoryModal(mode, row = null) {
        if (cropper) {
            cropper.destroy()
            cropper = null
        }
        currentMode = mode;
        modal.style.display = 'flex';

        if (mode === 'edit' && row) {

            modalTitle.innerText = 'Edit Category Details';

            const cells = row.cells;

            document.getElementById('catName').value =
                cells[1].innerText.trim();

            document.getElementById('catOffer').value =
                cells[2].innerText.replace('%', '').trim();

                const categoryData = JSON.parse(
                    row.getAttribute("data-category")
                );

            const preview = document.getElementById("catImagePreview");

            if (categoryData.image){
                preview.src = categoryData.image;
                preview.style.display = "block";

                preview.onload = function () {

                    if (cropper) {
                        cropper.destroy();
                    }

                    cropper = new Cropper(preview, {
                        viewMode: 1,            
                        dragMode: 'move',       
                        aspectRatio: 1,         
                        cropBoxResizable: false, 
                        cropBoxMovable: false,   
                        zoomable: true,          
                        background: true,        
                        guides: true             
                    });
                }
            }
            

            currentCategoryId = categoryData._id

        } else {

            modalTitle.innerText = 'Add Category';
            catForm.reset();
            document.getElementById('catImagePreview').style.display = 'none';
            currentCategoryId = null;
        }
    }

    function closeModal() {
        modal.style.display = 'none';
        if (cropper) {
                cropper.destroy()
                cropper = null
            }
        
    }

    function previewCategoryImage(input) {

    const preview = document.getElementById('catImagePreview');

    if (!input.files || !input.files[0]) return;

    const file = input.files[0];

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg"
    ];

    
    if (!allowedTypes.includes(file.type)) {
        showToast("Only JPG, JPEG, PNG, WEBP images allowed", "error");
        input.value = "";
        preview.style.display = "none";
        return;
    }

    
    if (file.size > 2 * 1024 * 1024) {
        showToast("Image must be less than 2MB", "error");
        input.value = "";
        preview.style.display = "none";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {

        preview.src = e.target.result;
        preview.style.display = "block";

        setTimeout(() => {

            if (cropper) {
                cropper.destroy();
            }

            cropper = new Cropper(preview, {
                viewMode: 1,
                dragMode: 'move',
                aspectRatio: 1,
                cropBoxResizable: false,
                cropBoxMovable: false,
                zoomable: true,
                background: true,
                guides: true
            });

        }, 100);

    };

    reader.readAsDataURL(file);
}



    window.onclick = function (event) {
        if (event.target == modal) {
            closeModal();
        }
    }


    async function deleteCategory(id,status) {
        
            
            const response = await fetch (`/admin/categoryManagement/categoryStatus/${id}?status=${status}`,{
                method: "PATCH"
            })
            const data = await response.json()

            if (data.success){
                showToast(data.message,"success")

                setTimeout(()=>{location.reload()},500)
            }else {
                showToast(data.message,"error")
            }
        
    }

    function activateCategory(id) {
        
            window.location.href =
                `/admin/categoryManagement/categoryStatus/${id}?status=true`;
        
    }

    
    
    catForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        let isValid = true; 

        const name = document.getElementById("catName").value.trim().toLowerCase()
        const offer = document.getElementById("catOffer").value.trim();
        const imageInput = document.getElementById("catImageInput");

        const nameDiv = document.getElementById("nameDiv");
        const offerDiv = document.getElementById("offerDiv");
        const imageDiv = document.getElementById("imageDiv");

        
        if (!name || name.length < 3) {
            nameDiv.querySelector('input').style.border = '1px solid red';
            nameDiv.querySelector('p').style.display = 'block';
            isValid = false;
        } else {
            nameDiv.querySelector('input').style.border = '1px solid gray';
            nameDiv.querySelector('p').style.display = 'none';
        }

        
        if (offer) {
            if (isNaN(offer) || offer > 100 || offer < 0) {
                offerDiv.querySelector('input').style.border = '1px solid red';
                offerDiv.querySelector('p').style.display = 'block';
                isValid = false;
            } else {
                offerDiv.querySelector('input').style.border = '1px solid gray';
                offerDiv.querySelector('p').style.display = 'none'; 
            }
        }
        
        
        if (currentMode === "add" && imageInput.files.length === 0) {
            imageDiv.querySelector('p').style.display = 'block';
            isValid = false;
        } else {
            imageDiv.querySelector('p').style.display = 'none';
        }

        if (!isValid) return;

        if (!cropper && currentMode === "add") {
            showToast("Please Select And Crop Image","error")
            return 
        }


        
        const formData = new FormData();
        formData.append("name", name);
        formData.append("offer", offer);

        if (cropper) {

            const canvas = cropper.getCroppedCanvas({
            width: 300,
            height: 300
        });

        const blob = await new Promise(resolve =>
            canvas.toBlob(resolve, "image/jpeg")
        );

        formData.append("categoryImage", blob, "cropped.jpg");
        }

        const spinner = document.getElementById("admin-spinner");
        spinner.style.display = "flex"

        try {

            const url = currentMode === "add"
                ? "/admin/addCategory"
                : `/admin/editCategory/${currentCategoryId}`;

            const response = await fetch(url, {
                method: "POST",
                body: formData
            });
            spinner.style.display = "none";

            const data = await response.json();

            if (data.success) {

                showToast(data.message,"success");
                modal.style.display = "none";
                setTimeout(()=>{location.reload();},500)

            } else {
                showToast(data.message,"error");
                modal.style.display = "none";
                setTimeout(()=>{location.reload();},2000)
            }

        } catch (error) {
            console.error(error);
            showToast("Something went wrong","error");
        }
    })


    function showToast(message, type = "success") {

    const toast = document.createElement("div")
    toast.innerText = message

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
