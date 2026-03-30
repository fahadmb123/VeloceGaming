function togglePassword(inputId, el) {
        const input = document.getElementById(inputId);
        if (input.type === "password") {
            input.type = "text";
            el.textContent = "Hide";
        } else {
            input.type = "password";
            el.textContent = "Show";
        }
    }


    function copyCode() {
    const text = document.getElementById("referralText").innerText;

    navigator.clipboard.writeText(text)
        .then(() => showToast("Copied!","success"));
    }

    let messageElement = document.getElementById("swalMessage");

    if (messageElement && messageElement.innerText.trim() !== "") {
        swal(messageElement.innerText);
    }



    document.getElementById("registerForm").addEventListener("submit", function (event) {


        
        event.preventDefault()

        let name = document.getElementById("name").value.trim()
        let email = document.getElementById("email").value.trim()
        let currentPassword = document.getElementById("currentPassword").value.trim()
        let newPassword = document.getElementById("newPassword").value.trim()
        let confirmPassword = document.getElementById("confirmPassword").value.trim()

        const nameDiv = document.getElementById('nameDiv');
        const newPasswordDiv = document.getElementById('newPasswordDiv');
        const emailDiv = document.getElementById('emailDiv');
        const currentPasswordDiv = document.getElementById('currentPasswordDiv');
        const confirmPasswordDiv = document.getElementById('confirmPasswordDiv');


       let isValid = true
       if(!email){
            emailDiv.querySelector('input').style.border='1px solid red'
            emailDiv.querySelector('p').style.display='block'
            isValid = false
        }else{
            emailDiv.querySelector('input').style.border='1px solid gray'
            emailDiv.querySelector('p').style.display='none'
        }

        

        if(!name ){
            nameDiv.querySelector('input').style.border='1px solid red'
            nameDiv.querySelector('p').style.display='block'
            isValid = false
        }
        else if (name.length <= 3){
            nameDiv.querySelector('input').style.border='1px solid red'
            nameDiv.querySelector('p').style.display='block'
            isValid = false
        }
        else{
            nameDiv.querySelector('input').style.border='1px solid gray'
            nameDiv.querySelector('p').style.display='none'
        }
        

        if (currentPassword) {
            if(!newPassword){
                newPasswordDiv.querySelector('input').style.border='1px solid red'
                newPasswordDiv.querySelector('p').style.display='block'
                isValid = false
            }else{
                newPasswordDiv.querySelector('input').style.border='1px solid gray'
                newPasswordDiv.querySelector('p').style.display='none'
            }
            
            if(!currentPassword){
                currentPasswordDiv.querySelector('input').style.border='1px solid red'
                currentPasswordDiv.querySelector('p').style.display='block'
                isValid = false
            }else{
                currentPasswordDiv.querySelector('input').style.border='1px solid gray'
                currentPasswordDiv.querySelector('p').style.display='none'
            }

            if(!confirmPassword){
                confirmPasswordDiv.querySelector('input').style.border='1px solid red'
                confirmPasswordDiv.querySelector('p').style.display='block'
                isValid = false
            }else{
                confirmPasswordDiv.querySelector('input').style.border='1px solid gray'
                confirmPasswordDiv.querySelector('p').style.display='none'
           }

           if (newPassword !== confirmPassword){
            swal("New And Confirm Password Is Not Match")
            isValid = false
           }
        }
        

        if (isValid) {
            event.target.submit()
        }
    })

    window.addEventListener("pageshow", function (event) {
        if (event.persisted) {
            window.location.reload();
        }
    });


        const modal = document.getElementById('uploadModal');
        const openBtn = document.getElementById('openUploadModal');
        const closeBtn = document.getElementById('closeUploadModal');
        const cancelBtn = document.getElementById('cancelUpload');
        const confirmBtn = document.getElementById('confirmUpload');
        const fileInput = document.getElementById('fileInput');
        const previewImg = document.getElementById('imagePreview');
        const previewContainer = document.getElementById('previewContainer');
        const dropZone = document.getElementById('dropZone');
        const avatarDisplay = document.getElementById('profileAvatarDisplay');
        let cropper;

        function openModal() {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            // Reset modal state
            fileInput.value = '';
            previewContainer.classList.remove('active');
            dropZone.style.display = 'flex';
            confirmBtn.disabled = true;

            if (cropper) {
                cropper.destroy()
                cropper = null
            }
        }

        openBtn.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        document.getElementById('modalOverlay').addEventListener('click', closeModal);

        function handleFile(file) {
            const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

            if (!file) return;

            if (!allowedTypes.includes(file.type)) {
                showToast("Only JPG, JPEG, PNG, and WEBP images are allowed!","error")
                fileInput.value = ""; // reset the input
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                showToast("Image must be less than 2MB","error")
                fileInput.value = ""; // reset the input
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                previewContainer.classList.add('active');
                dropZone.style.display = 'none';
                confirmBtn.disabled = false;

                if (cropper) cropper.destroy();

                cropper = new Cropper(previewImg, {
                    aspectRatio: 1,
                    viewMode: 1,
                    dragMode: "move",
                    cropBoxResizable: false, 
                    cropBoxMovable: false,
                    zoomable: true,
                    scalable: false,
                    responsive: true
                })
            }
            reader.readAsDataURL(file)
        }

        fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            handleFile(e.dataTransfer.files[0]);
        });

        confirmBtn.addEventListener('click', async () => {
            
            
            const spinner = document.getElementById("admin-spinner");
            spinner.style.display = "flex"
            if (!cropper ) return 

            const canvas = cropper.getCroppedCanvas({
                width : 300,
                height : 300
            })

            const blob = await new Promise(resolve => 
                canvas.toBlob(resolve,"image/jpeg")
            )

            //const file = fileInput.files[0]

            const formData = new FormData()

            formData.append("profileImage",blob)


            const response = await fetch("/profile-upload",{
                method: "post",
                body : formData
            })
            spinner.style.display = "none"
            const data = await response.json()


            if (data.success){
                avatarDisplay.innerHTML = `<img src="${data.imageUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
                closeModal();
            }
        })



       const removeBtn = document.getElementById('removeProfilePhoto');
        if (removeBtn) {
            removeBtn.addEventListener('click', async () => {
                
                    const response = await fetch("/profile-remove",{
                        method : "post"
                    })

                    const data = await response.json()

                    if (data.success){
                        
                        showToast(data.message)
                        window.location.reload();
                    }
                
            });
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