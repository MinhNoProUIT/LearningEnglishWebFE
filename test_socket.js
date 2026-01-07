const io = require("socket.io-client");

// Use backend URL
const socket = io("http://localhost:5001");

const USER_ID = "33146e2e-31ac-462a-8161-22c2f2150a3e";
const GROUP_ID = "586835ef-58c4-4845-9e0b-7a00cd7b13fa";

console.log("Connecting to server...");

socket.on("connect", () => {
  console.log("Connected with ID:", socket.id);
  
  // Join Group
  socket.emit("joinGroup", GROUP_ID);
  
  // Send a message after 1 second
  setTimeout(() => {
      console.log("Sending test message...");
      socket.emit("sendMessage", {
          senderId: USER_ID,
          groupId: GROUP_ID,
          content: "HELLO WORLD FROM TEST SCRIPT"
      });
  }, 1000);
});

// Listen for receiveMessage (was renamed from newMessage)
socket.on("receiveMessage", (message) => {
  console.log("RECEIVED MESSAGE:", message);
  if (message.content === "HELLO WORLD FROM TEST SCRIPT") {
      console.log("SUCCESS: Realtime loop works!");
      if (message.sender_username) {
          console.log("SUCCESS: Message enriched with sender info!");
      } else {
          console.warn("WARNING: Message NOT enriched (sender_username missing).");
      }
      socket.disconnect();
      // process.exit(0); 
  }
});

socket.on("disconnect", () => {
    console.log("Disconnected.");
});

socket.on("connect_error", (err) => {
    console.error("Connection error:", err.message);
    process.exit(1);
});

socket.on("error", (err) => {
    console.error("SERVER ERROR:", err);
    process.exit(1);
});

// Timeout
setTimeout(() => {
    console.error("TIMEOUT: Did not receive message back.");
    process.exit(1);
}, 10000);
