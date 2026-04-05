const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const productModal = document.getElementById('productModal');
const productModalTitle = document.getElementById('productModalTitle');
const productForm = document.getElementById('productForm');
const cropModal = document.getElementById('cropModal');
const cropImage = document.getElementById('cropImage');
let cropper = null;
let currentPhotoBox = null;


let currentEditId = null;


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
        window.location.href = '/admin/productManagement';
    });
}


async function openProductModal(mode, id = null) {
    productModal.style.display = 'flex';
    const addVariantBtn = document.getElementById('addVariantBtn');

    if (mode === 'edit') {
        productModalTitle.innerText = 'Edit Product';
        addVariantBtn.style.display = 'inline-flex';
        currentEditId = id;

        const res = await fetch(`/admin/productManagement/${id}`);
        const data = await res.json();

        const product = data.product
        const variants = data.variants

        
        document.getElementById('prodName').value = product.name;
        document.getElementById('prodCategory').value = product.categoryId._id;
        document.getElementById('prodOffer').value = product.offer || "";
        document.getElementById('prodHomepage').value = product.homepage;

        document.getElementById('prodHighlights').value =
            product.highlights.join("\n");

        document.getElementById('prodServices').value =
            product.services.join("\n");

        document.getElementById('prodDescription').value =
            product.details.join("\n");

        loadVariants(variants);


    } else {
        
        currentEditId = null;

        productModalTitle.innerText = 'Add Product';
        addVariantBtn.style.display = 'inline-flex';
        productForm.reset();

        const container = document.getElementById('variantsContainer');
        
        container.innerHTML = '';

        resetAllPhotos();
        document.getElementById('addVariantBtn').click()
    }
}




// for load the variants in the edit section 

function loadVariants(variants) {

    const container = document.getElementById('variantsContainer');
    container.innerHTML = "";

    variants.forEach((variant, index) => {

        const newCard = document.createElement('div');
        newCard.className = 'variant-card';
        newCard.setAttribute("data-variant-id", variant._id);

        
        


        

        newCard.innerHTML = `
            <button type="button" class="variant-close-btn">&times;</button>

            <div class="form-row-3">
                <div class="color-group">
                    <div class="form-group color-group">
                        <label>Color</label>
                        <input type="text" class="variant-color-name" value="${variant.colorName}">
                        <input type="color" class="variant-color-hex" value="${variant.colorHex}">
                    </div>
                    <p style="color: red;font-size: 13px;font-weight: normal;margin-top: 2px !important;display: none;">Color Is Required</p>
                </div>
                <div class="form-group">
                    <label>RAM</label>
                    <input type="text" placeholder="RAM" value="${variant.ram || ''}">
                </div>
                <div class="form-group">
                    <label>Storage</label>
                    <input type="text" placeholder="Storage" value="${variant.storage || ''}">
                </div>
            </div>

            <div class="form-row-3">
                <div class="form-group price-group">
                    <label>Original Price</label>
                    <input type="text" placeholder="0.00" value="${variant.price}">
                    <p style="color: red;font-size: 13px;font-weight: normal;margin-top: 2px !important;display: none;">Price Is Required</p>
                </div>
                <div class="form-group stock-group">
                    <label>Stock</label>
                   <input type="text" placeholder="00" value="${variant.stock}">
                   <p style="color: red;font-size: 13px;font-weight: normal;margin-top: 2px !important;display: none;">Stock is Required</p>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <div class = "custom-select">
                        <select class="variant-status">
                            <option value="true" ${variant.status ? "selected" : ""}>Active</option>
                            <option value="false" ${!variant.status ? "selected" : ""}>Inactive</option>
                        </select>
                    </div>
                </div>
            </div>
            <label for=""> --> The First Image Will Be The Main Image </label>
            <div class="photo-gallery"></div>
        `;

        const closeBtn = newCard.querySelector('.variant-close-btn');
        closeBtn.onclick = async function () {

        const variantId = newCard.getAttribute("data-variant-id");

    
    if (currentEditId && variantId) {

        

        try {
            const response = await fetch(
                `/admin/productManagement/deleteVariant/${variantId}`,
                { method: "DELETE" }
            );

            const result = await response.json();

            if (result.success) {
                newCard.remove();
                updateVariantCloseButtons();
                showToast("Variant deleted", "success");
            } else {
                showToast(result.message, "error");
            }

        } catch (err) {
            console.log(err);
            showToast("Server error", "error");
        }

    } else {
        
        newCard.remove();
        updateVariantCloseButtons();
    }
   };
        const gallery = newCard.querySelector('.photo-gallery');

        


        variant.images.forEach(img => {
            const box = document.createElement('div');
            box.className = 'photo-upload-box has-image';

            box.innerHTML = `
                <span class="photo-required-badge" style="display:none;">Required</span>
                <img src="${img.url}" 
                    data-public-id="${img.public_id}" 
                    class="photo-preview"
                    onclick="handleEditPhoto(this.parentElement)">
             
                <button type="button" 
                    class="photo-delete-btn" 
                    onclick="removePhoto(this)">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            gallery.appendChild(box);
        });

        
        const addBox = document.createElement('div');
        addBox.className = 'photo-add-box';
        addBox.innerHTML = `
            <i class="fa-solid fa-plus"></i>
            <span>Add Photo</span>
           <input type="file" accept="image/*" hidden>
           `;

        addBox.onclick = function () {
            this.querySelector('input').click();
        };

        addBox.querySelector('input').onchange = function () {
            handleNewPhoto(this);
        };

        gallery.appendChild(addBox);

        container.appendChild(newCard);
        });
        updateVariantCloseButtons(); 
}


function updateVariantCloseButtons() {
    const variantCards = document.querySelectorAll('.variant-card');

    variantCards.forEach(card => {
        const closeBtn = card.querySelector('.variant-close-btn');

        if (!closeBtn) return;

        if (variantCards.length <= 1) {
            closeBtn.style.display = "none";
        } else {
            closeBtn.style.display = "block";
        }
    });
}




function closeProductModal() {
    productModal.style.display = 'none';
    window.location.reload()
}

window.onclick = function (event) {
    if (event.target === productModal) closeProductModal();
    if (event.target === cropModal) closeCropModal();
};



let isEditing = false;
let currentEditingBox = null;

function handleNewPhoto(input) {

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
        return;
    }

    
    if (file.size > 3 * 1024 * 1024) {
        showToast("Image must be less than 3MB", "error");
        input.value = "";
        return;
    }

    const gallery = input.closest('.photo-gallery');
    const photoCount = gallery.querySelectorAll('.photo-upload-box').length;

    if (photoCount >= 6) {
        showToast("Maximum 6 photos allowed", "error");
        input.value = '';
        return;
    }

    isEditing = false;
    currentPhotoBox = input.closest('.photo-add-box');

    const reader = new FileReader();

    reader.onload = function (e) {
        openCropModal(e.target.result);
    }

    reader.readAsDataURL(file);
    input.value = '';
}

function handleEditPhoto(box) {
    isEditing = true;
    currentEditingBox = box;
    const preview = box.querySelector('.photo-preview');
    openCropModal(preview.src);
}

function openCropModal(imageSrc) {
    cropModal.style.display = 'flex';
    cropImage.src = imageSrc;
    cropImage.onload = function () {
        if (cropper) cropper.destroy();
        cropper = new Cropper(cropImage, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: "move",
            cropBoxResizable: false,
            cropBoxMovable: false,
            zoomable: true,
            scalable: false,
            responsive: true
        });
    };
}

function closeCropModal() {
    cropModal.style.display = 'none';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    isEditing = false;
    currentEditingBox = null;
    //window.location.reload()
}

function confirmCrop() {
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
        width: 600,
        height: 600,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });

    const croppedDataUrl = canvas.toDataURL('image/png');

    if (isEditing && currentEditingBox) {
        const preview = currentEditingBox.querySelector('.photo-preview');
        preview.src = croppedDataUrl;
    } else {
        const gallery = currentPhotoBox.closest('.photo-gallery');
        const addBox = currentPhotoBox;

        const newBox = document.createElement('div');
        newBox.className = 'photo-upload-box has-image';
        newBox.innerHTML = `
            <span class="photo-required-badge" style="display:none;">Required</span>
            <img src="${croppedDataUrl}" class="photo-preview" onclick="handleEditPhoto(this.parentElement)">
            <button type="button" class="photo-delete-btn" onclick="removePhoto(this)">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;

        gallery.insertBefore(newBox, addBox);
        updateGalleryControls(gallery);
    }

    closeCropModal();
}

function removePhoto(btn) {
    const box = btn.closest('.photo-upload-box');
    const gallery = box.closest('.photo-gallery');
    box.remove();
    updateGalleryControls(gallery);
}

function updateGalleryControls(gallery) {
    const boxes = gallery.querySelectorAll('.photo-upload-box');
    const addBox = gallery.querySelector('.photo-add-box');
    addBox.style.display = boxes.length >= 6 ? 'none' : 'flex';
}

function resetAllPhotos() {
    document.querySelectorAll('.photo-gallery').forEach(gallery => {
        gallery.querySelectorAll('.photo-upload-box').forEach(box => box.remove());
        const addBox = gallery.querySelector('.photo-add-box');
        if (addBox) addBox.style.display = 'flex';
    });
}


document.getElementById('addVariantBtn').addEventListener('click', function () {

    const container = document.getElementById('variantsContainer');

    const newCard = document.createElement('div');
    newCard.className = 'variant-card';

    newCard.innerHTML = `
        <button type="button" class="variant-close-btn">&times;</button>

        <div class="form-row-3">
            <div class="form-group color-group">
                <label>Color</label>
                <div style="display:flex; gap:10px;">
                    <input type="text" placeholder="Color Name" class="variant-color-name">
                    <input type="color" class="variant-color-hex">
                </div>
                <p style="display:none;color:red;">Color Required</p>
            </div>

            <div class="form-group">
                <label>RAM</label>
                <input type="text" placeholder="RAM">
            </div>

            <div class="form-group">
                <label>Storage</label>
                <input type="text" placeholder="Storage">
            </div>
        </div>

        <div class="form-row-3">
            <div class="form-group price-group">
                <label>Original Price</label>
                <input type="text" placeholder="0.00">
                <p style="display:none;color:red;">Price Required</p>
            </div>

            <div class="form-group stock-group">
                <label>Stock</label>
                <input type="text" placeholder="00">
                <p style="display:none;color:red;">Stock Required</p>
            </div>

            <div class="form-group">
                <label>Status</label>
                <div class="custom-select">
                <select class="variant-status">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
                </div>
            </div>
        </div>

        <label>--> The First Image Will Be The Main Image</label>

        <div class="photo-gallery">
            <div class="photo-add-box" onclick="this.querySelector('input').click()">
                <i class="fa-solid fa-plus"></i>
                <span>Add Photo</span>
                <input type="file" accept="image/*" hidden onchange="handleNewPhoto(this)">
            </div>
        </div>
    `;

    // Close button logic
    newCard.querySelector('.variant-close-btn').onclick = function () {
        newCard.remove();
        updateVariantCloseButtons();
    };

    container.appendChild(newCard);

    updateVariantCloseButtons(); // IMPORTANT
});




productForm.onsubmit = async function (e) {
    e.preventDefault();

    let isValid = true;
    

    const formData = new FormData();

    let name = document.getElementById("prodName").value.trim();
    let category = document.getElementById("prodCategory").value
    let offer = document.getElementById("prodOffer").value
    let highlight = document.getElementById("prodHighlights").value.trim()
    let service = document.getElementById("prodServices").value.trim()
    let details = document.getElementById("prodDescription").value.trim()


    const nameDiv = document.getElementById("nameDiv");
    const offerDiv = document.getElementById("offerDiv");
    const categoryDiv = document.getElementById("categoryDiv");
    const highlightDiv = document.getElementById("highlightDiv");
    const serviceDiv = document.getElementById("serviceDiv");
    const detailsDiv = document.getElementById("descriptionDiv");


    if (!name || name.length < 3) {
            nameDiv.querySelector('input').style.border = '1px solid red';
            nameDiv.querySelector('p').style.display = 'block';
            isValid = false;
        } else {
            nameDiv.querySelector('input').style.border = '1px solid gray';
            nameDiv.querySelector('p').style.display = 'none';
            formData.append("name", name )
        }


    if (category === "") {
        categoryDiv.querySelector('select').style.border = '1px solid red';
        categoryDiv.querySelector('p').style.display = 'block';
        isValid = false;
    } else {
        categoryDiv.querySelector('select').style.border = '1px solid gray';
        categoryDiv.querySelector('p').style.display = 'none';
        formData.append("category", category);
    }

    
    if (offer) {
        if (isNaN(offer) || offer > 100 || offer < 0) {
            offerDiv.querySelector('input').style.border = '1px solid red';
            offerDiv.querySelector('p').style.display = 'block';
            isValid = false;
        } else {
            offerDiv.querySelector('input').style.border = '1px solid gray';
            offerDiv.querySelector('p').style.display = 'none';
            formData.append("offer", offer);
        }
    }


    if (!highlight || highlight.length < 10) {
        highlightDiv.querySelector('textarea').style.border = '1px solid red';
        highlightDiv.querySelector('p').style.display = 'block';
        isValid = false;
    } else {
        highlightDiv.querySelector('textarea').style.border = '1px solid gray';
        highlightDiv.querySelector('p').style.display = 'none';
        formData.append("highlights",
            JSON.stringify(
                highlight.split("\n").filter(h => h.trim() !== "")
            )
        );
    }


    if (!service || service.length < 10) {
        serviceDiv.querySelector('textarea').style.border = '1px solid red';
        serviceDiv.querySelector('p').style.display = 'block';
        isValid = false;
    } else {
        serviceDiv.querySelector('textarea').style.border = '1px solid gray';
        serviceDiv.querySelector('p').style.display = 'none';
        formData.append("services",
            JSON.stringify(
                service.split("\n").filter(s => s.trim() !== "")
            )
        );
    }


    if (!details || details.length < 10) {
        detailsDiv.querySelector('textarea').style.border = '1px solid red';
        detailsDiv.querySelector('p').style.display = 'block';
        isValid = false;
    } else {
        detailsDiv.querySelector('textarea').style.border = '1px solid gray';
        detailsDiv.querySelector('p').style.display = 'none';
        formData.append("details",
            JSON.stringify(
                details.split("\n").filter(s => s.trim() !== "")
            )
        );
    }
    
    


    

    const variantCards = document.querySelectorAll('.variant-card');
    let variants = [];
    let allVariantsValid = true;


    for (let i = 0; i < variantCards.length; i++) {

        const card = variantCards[i];
        const variantId = card.getAttribute("data-variant-id");
        const photoPreviews = card.querySelectorAll('.photo-preview');

        let variantValid = true;

        const priceDiv = card.querySelector('.price-group');
        const stockDiv = card.querySelector('.stock-group');
        const colorDiv = card.querySelector('.color-group')

        let colorName = card.querySelector('.variant-color-name').value;
        let colorHex = card.querySelector('.variant-color-hex').value;
        
        let ram = card.querySelector('input[placeholder="RAM"]').value
        let storage = card.querySelector('input[placeholder="Storage"]').value
        let price = card.querySelector('input[placeholder="0.00"]').value
        let stock = card.querySelector('input[placeholder="00"]').value
        let status =  card.querySelector('.variant-status').value

        

        if (photoPreviews.length < 3) {
            showToast(`Variant ${i + 1} must have at least 3 photos.`,"error");
            return;
        }

        if (!colorName.trim()) {
            colorDiv.querySelector('input').style.border = '1px solid red';
            colorDiv.querySelector('p').style.display = 'block';
            variantValid = false
        }else {
            colorDiv.querySelector('input').style.border = '1px solid gray';
            colorDiv.querySelector('p').style.display = 'none';
        }
        
        if (!price || isNaN(price) || price < 0) {
            priceDiv.querySelector('input').style.border = '1px solid red';
            priceDiv.querySelector('p').style.display = 'block';
            variantValid = false;
        } else {
            priceDiv.querySelector('input').style.border = '1px solid gray';
            priceDiv.querySelector('p').style.display = 'none';
        }


        if (!stock || isNaN(stock) || stock < 0) {
            stockDiv.querySelector('input').style.border = '1px solid red';
            stockDiv.querySelector('p').style.display = 'block';
            variantValid = false;
        } else {
            stockDiv.querySelector('input').style.border = '1px solid gray';
            stockDiv.querySelector('p').style.display = 'none';
        }

        
        let existingImages = [];

        photoPreviews.forEach((img, imgIndex) => {

            if (img.src.startsWith("http")) {
                
                existingImages.push({
                    url : img.src,
                    public_id : img.dataset.publicId
                });
            } else {
                
                const file = dataURLtoFile(img.src, `variant-${i}-${imgIndex}.png`);
                formData.append(`variantImages_${i}`, file);
            }
        });

        let color = JSON.stringify({
            name : colorName,
            hex:colorHex
        })

        const variantObj = {
            _id: variantId || null,
            color: color,
            ram: ram,
            storage: storage,
            price: price,
            stock: stock,
            status: status,
            existingImages
        };


        variants.push(variantObj);

        if (!variantValid) {
            allVariantsValid = false
            continue
        }
    }


    if (!allVariantsValid) return
    if (!isValid) return
    

    formData.append("homepage", document.getElementById("prodHomepage").value);
    formData.append("variants", JSON.stringify(variants));
    const spinner = document.getElementById("admin-spinner");
    spinner.style.display = "flex"
    
    try {

        let url = "/admin/productManagement/add";
        let method = "POST";

        
        if (currentEditId) {
            url = `/admin/productManagement/edit/${currentEditId}`;
            method = "POST";
            formData.append("productId", currentEditId);
        }

        const response = await fetch(url, {
            method: method,
            body: formData
        });

        spinner.style.display = "none";

        const result = await response.json();
        

        if (result.success) {
            showToast(result.message,"success")
            closeProductModal();
            setTimeout(()=>{location.reload();},1500)
        } else {
            showToast(result.message,"error");
        }

    } catch (error) {
        console.log(error);
        showToast("Server error","error");
    }
};


function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}

async function deleteProduct(id,status) {
    
        
        const response = await fetch (`/admin/productManagement/productStatus/${id}?status=${status}`,{
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



function showToast(message, type = "success") {

    const toast = document.createElement("div");
    toast.classList.add("toast", `toast-${type}`);
    toast.innerText = message;

    document.body.appendChild(toast);

    // trigger animation
    setTimeout(() => {
        toast.classList.add("show");
    }, 10);

    // remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
