document.addEventListener("DOMContentLoaded", function () {
  const chatBox = document.getElementById("chat-box");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const recentChatsList = document.getElementById("recent-chats");
  const newChatButton = document.getElementById("new-chat");
  const pdfInput = document.getElementById("pdf-input");
  const toggleBtn = document.getElementById("toggle-btn");

  let currentChatId = null;

  toggleBtn.addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("collapsed");
  });

  // Load chat from URL parameter if present
  const urlParams = new URLSearchParams(window.location.search);
  const existingChatId = urlParams.get("chatId");
  if (existingChatId) {
    loadChat(existingChatId);
  }

  newChatButton.addEventListener("click", createNewChat);
  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
  pdfInput.addEventListener("change", handlePDFUpload);

  async function createNewChat() {
    const chatId = Date.now();
    currentChatId = chatId;

    const newChatItem = document.createElement("li");
    newChatItem.innerHTML = `<i class="far fa-comment"></i> Chat - ${chatId}`;
    newChatItem.addEventListener("click", () => loadChat(chatId));
    recentChatsList.appendChild(newChatItem);

    chatBox.innerHTML = "";
    window.history.pushState({}, "", `/chat?chatId=${chatId}`);
  }

  async function loadChat(chatId) {
    currentChatId = chatId;
    chatBox.innerHTML = "";

    try {
      const response = await fetch(`/chat/${chatId}`);
      const data = await response.json();

      if (!data.messages || data.messages.length === 0) {
        appendMessage("No messages in this chat yet.", "info-message");
        return;
      }

      data.messages.forEach((msg) => {
        appendMessage(
          msg.text,
          msg.sender === "user" ? "user-message" : "bot-message"
        );
      });

      window.history.pushState({}, "", `/chat?chatId=${chatId}`);
    } catch (error) {
      console.error("Error loading chat:", error);
      appendMessage(
        "Sorry, an error occurred while loading the chat.",
        "error-message"
      );
    }
  }

  async function handlePDFUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      const formData = new FormData();
      formData.append("pdf", file);

      try {
        const response = await fetch("/upload-pdf", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          appendMessage(
            `PDF uploaded and processed. You can now ask questions about ${file.name}.`,
            "info-message"
          );
        } else {
          throw new Error("PDF upload failed");
        }
      } catch (error) {
        console.error("Error uploading PDF:", error);
        appendMessage(
          "Sorry, an error occurred while uploading the PDF.",
          "error-message"
        );
      }
    } else {
      appendMessage("Please upload a valid PDF file.", "error-message");
    }
  }

  async function sendMessage() {
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    appendMessage(userMessage, "user-message");
    messageInput.value = "";

    try {
      const response = await fetch(`/chat/${currentChatId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Server responded with ${response.status}: ${
            errorData.error || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      appendMessage(data.reply, "bot-message");
    } catch (error) {
      console.error("Error sending message:", error);
      let errorMessage = "Sorry, an error occurred while sending the message.";
      if (error.message) {
        errorMessage += ` Details: ${error.message}`;
      }
      appendMessage(errorMessage, "error-message");
    }
  }

  function appendMessage(content, className) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", className);

    if (className === "user-message" || className === "bot-message") {
      const userIcon = document.createElement("div");
      userIcon.classList.add("user-icon");
      messageDiv.appendChild(userIcon);
    }

    const messageParagraph = document.createElement("div");
    messageParagraph.innerHTML = content;

    messageDiv.appendChild(messageParagraph);

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});
