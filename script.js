document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.querySelector('.chat-messages');
    const messageInput = document.querySelector('#message-input');
    const sendButton = document.querySelector('#send-button');
    const uploadButton = document.querySelector('#upload-button');
    const imageInput = document.querySelector('#image-input');
    const initialMessage = document.getElementById('initial-message');
    const toggleDarkModeButton = document.getElementById('toggle-dark-mode');

    let currentImage = null;

    // Initially hide the initial message
    initialMessage.style.display = 'block';

    function addMessage(message, isBot, isImage = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isBot ? 'bot-message' : 'user-message');
        
        if (isImage) {
            messageElement.classList.add('image-message');
            const img = document.createElement('img');
            img.src = URL.createObjectURL(message);
            messageElement.appendChild(img);
        } else {
            messageElement.textContent = message;
        }
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sendMessage() {
        const message = messageInput.value.trim();
        
        if (message) {
            addMessage(message, false); // Add user message
            messageInput.value = ''; // Clear input
            initialMessage.style.display = 'none'; // Hide initial message when sending
            
            // If there is an image, include it in the request
            if (currentImage) {
                const formData = new FormData();
                formData.append('image', currentImage);
                formData.append('question', message);
                
                fetch('/ask', {
                    method: 'POST',
                    body: formData,
                })
                .then(response => response.json())
                .then(data => {
                    addMessage(data.answer, true); // Add bot response
                })
                .catch(error => {
                    console.error('Error:', error);
                    addMessage("Sorry, something went wrong. Please try again later.", true);
                });
            } else {
                // If there's no image, just respond with a message
                addMessage("Image not uploaded. Ask me something else!", true);
            }
        } else {
            addMessage("Please type a message before sending.", true);
        }
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    uploadButton.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            currentImage = file;
            addMessage(file, false, true);
            addMessage("Image uploaded successfully. You can now ask questions about it.", true);
            initialMessage.style.display = 'none'; // Hide initial message after upload
        } else {
            addMessage("Please upload a valid image file.", true);
        }
    });

    // Dark Mode Toggle
    toggleDarkModeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    // Hide suggestion on user input
    messageInput.addEventListener('input', () => {
        initialMessage.style.display = 'none'; // Hide the suggestion when user starts typing
    });
});
