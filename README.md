
# WorkElate
collabrative whiteboard
---

## 📁 Folder Structure

```
workElate/
│
├── client/     👉 React (Vite) frontend
└── server/     👉 Node.js + Express backend
```

---

## 🔐 Environment Variables Setup

To make the project run correctly, you'll need to add the following `.env` files in both the `server` and `client` folders.

### 👉 For the Backend (`server/.env`)

```
MONGODB_URI=
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 👉 For the Frontend (`client/.env`)

```
VITE_SERVER_URL=http://localhost:3000
```

Make sure to create these `.env` files before starting the project.

---

## 🚀 Getting Started Locally

Follow these steps to run the project on your local machine.

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd workElate
```

### 2. Install dependencies

Open two terminals or tabs — one for the server and one for the client.

#### In the `server` folder:

```bash
cd server
npm install
```

#### In the `client` folder:

```bash
cd client
npm install
```

### 3. Run both servers

#### Start the backend:

```bash
cd server
nodemon server.js
```

#### Start the frontend:

```bash
cd client
npm run dev
```

Now open your browser and go to: [http://localhost:5173](http://localhost:5173)



