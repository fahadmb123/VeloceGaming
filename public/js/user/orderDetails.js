    const status = "<%= orderItem.status %>"
    const orderItemId = '<%= orderItem._id %>'
    const orderId = '<%= order._id %>'
    const progressMap = {
        placed: 7,
        shipped: 36,
        ofd: 67,
        delivered: 100,
        cancelled : 100,
        returned : 100
    }

    document.addEventListener("DOMContentLoaded",()=>{

        const progress = document.getElementById("status-progress")
        
        if(progressMap[status]){
            progress.style.width = progressMap[status] + "%"
            if (status === 'delivered') {
                progress.style.background = 'green'
            }
            if (status === 'cancelled' || status === 'returned') {
                progress.style.background = '#8F0F1A'
            }
        }

        // Modal Logic
            const modal = document.getElementById('supportModal');
            const openBtn = document.getElementById('openSupportModal');
            const closeIcon = document.getElementById('closeModalIcon');
            const cancelBtn = document.getElementById('cancelModal');
            const form = document.getElementById('supportForm');

            const openModal = () => {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'
            };

            const closeModal = () => {
                modal.classList.remove('active')
                document.body.style.overflow = ''
            };

            openBtn.addEventListener('click', openModal)
            closeIcon.addEventListener('click', closeModal)
            cancelBtn.addEventListener('click', closeModal)

            // Close modal on click outside
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            })

            // Form Submission
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                let isValid = true
                const descriptionDiv = document.getElementById("descriptionDiv")
                const reasonDiv = document.getElementById("reasonDiv")
                const reason = document.getElementById('returnReason').value
                const description = document.getElementById('returnDescription').value.trim()

                if(!reason){
                    reasonDiv.querySelector('select').style.border='1px solid red'
                    reasonDiv.querySelector('p').style.display='block'
                    isValid = false
                }else{
                    reasonDiv.querySelector('select').style.border='1px solid gray'
                    reasonDiv.querySelector('p').style.display='none'
                }
                if(!description || description.length < 10){
                    descriptionDiv.querySelector('textarea').style.border='1px solid red'
                    descriptionDiv.querySelector('p').style.display='block'
                    isValid = false
                }else{
                    descriptionDiv.querySelector('textarea').style.border='1px solid gray'
                    descriptionDiv.querySelector('p').style.display='none'
                }

                if (isValid) {
                    let url
                    if (status === "delivered") {
                        url = '/orderDetails/return'
                    } else {
                        url = '/orderDetails/cancel'
                    }

                    const formData = new FormData()

                    //formData.append("orderId",orderId)
                    //formData.append("orderItemId",orderItemId)
                    //formData.append("reason",reason)
                    //formData.append("description",description)
                    console.log("ID "+orderId+" itemID "+orderItemId+" reason "+reason+" description "+description)
                    const response = await fetch(url,{
                        method : 'post',
                        headers : {
                            "Content-Type" : "application/json"
                        },
                        body : JSON.stringify({
                            orderId,
                            orderItemId,
                            reason,
                            description
                        })
                    })

                    const data = await response.json()
                    
                    if (data.loginRequired) {
                        window.location.href = '/login'
                    }
                    if (data.success) {
                        showToast(data.message , "success")
                    } else {
                        showToast(data.message,"error")
                    }
                    closeModal()
                    setTimeout(()=>{window.location.reload()},500)
                    //form.reset()
                }

                
                //showToast('Your support request has been submitted successfully!',"success")
                
            });

    })





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