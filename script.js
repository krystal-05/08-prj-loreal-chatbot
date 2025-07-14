/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

// Initialize an array to keep track of the conversation history
let messages = [
  {
    role: "system",
    content: `You are a helpful and knowledgeable assistant for L’Oréal. Only answer questions related to L’Oréal products, skincare and haircare routines, and product recommendations. If a user asks something unrelated to L’Oréal, politely redirect them to ask about L’Oréal's offerings.`,
  },
];

// REPLACE with your actual Cloudflare Worker URL
const workerUrl = "https://misty-hill-502e.kdaviso5.workers.dev/";

// Add event listener to the form
chatForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent the form from submitting the traditional way
  //I need to figure out how to get this to display while still keeping all the chats

  chatWindow.textContent = "Thinking..."; // Display a loading message

  // Add the user's message to the conversation history
  messages.push({ role: "user", content: userInput.value });

  // Show chat history plus "Thinking..." message
  let chatHistory = "";
  for (const msg of messages) {
    if (msg.role === "user") {
      chatHistory += `<div class="user-message"><strong>You:</strong> ${msg.content}</div>`;
    } else if (msg.role === "assistant") {
      chatHistory += `<div class="assistant-message"><strong>Assistant:</strong> ${msg.content}</div>`;
    }
  }
  // Add the "Thinking..." message at the end
  chatHistory += `<div class="assistant-message"><em>Assistant is thinking...</em></div>`;
  chatWindow.innerHTML = chatHistory;

  try {
    // Send a POST request to your Cloudflare Worker
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
        max_completion_tokens: 1000,
        temperature: 0.5,
        frequency_penalty: 0.5,
      }),
    });

    // Check if the response is not ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse JSON response from the Cloudflare Worker
    const result = await response.json();

    // Get the reply from OpenAI's response structure
    const replyText = result.choices[0].message.content;

    // Add the Worker's response to the conversation history
    messages.push({ role: "assistant", content: replyText });

    // Show all messages in the chat window
    // Build a string with each message on a new line
    chatHistory = "";
    for (const msg of messages) {
      // Only show user and assistant messages (skip system)
      if (msg.role === "user") {
        chatHistory += `<div class="user-message"><strong>You:</strong> ${msg.content}</div>`;
      } else if (msg.role === "assistant") {
        chatHistory += `<div class="assistant-message"><strong>Assistant:</strong> ${msg.content}</div>`;
      }
    }
    // Display the conversation in the chat window using innerHTML
    chatWindow.innerHTML = chatHistory;
  } catch (error) {
    console.error("Error:", error); // Log the error
    chatWindow.textContent =
      "Sorry, something went wrong. Please try again later."; // Show error message to the user
  }

  // Clear the input field
  userInput.value = "";
});
