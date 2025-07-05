# 🔒 Secure Chat App

A full-stack real-time chat application built with robust end-to-end encryption, designed to keep your conversations private and secure. Connect with confidence knowing your data stays between you and your intended recipient.

## 🚀 Features

- 🔐 End-to-End AES Encryption for secure communication
- 💬 Real-time messaging with Socket.IO
- 😎 Keep your room code private anyone from this code able to chat with you
- 👥 User authentication using JWT (JSON Web Tokens)
- 📱 Responsive UI for desktop and mobile
- 🛠️ Built with Node.js, Express, MongoDB, React, and Tailwind CSS

## 🧰 Tech Stack

| Frontend      | Backend           | Security       | Database |
|---------------|-------------------|----------------|----------|
| React         | Node.js + Express | JWT, AES       | MongoDB  |
| Tailwind CSS  | Socket.IO         | HTTPS enabled  | Mongoose |

## 📸 Screenshots

![Screenshot_20250705-104639](https://github.com/user-attachments/assets/665d1922-d5ca-469b-97b6-215b026550a5)


## 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/kumar-pratik1006/secure-chat-app.git
cd secure-chat-app

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Run the app
npm run dev
