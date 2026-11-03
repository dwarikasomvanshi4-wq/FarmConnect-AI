# FarmConnect AI 🌱

**An AI-powered, voice-enabled agricultural marketplace connecting farmers directly with buyers.**

FarmConnect AI is a web application designed to help farmers access digital marketplace services, manage crops and orders, receive weather information, and screen plant images for possible diseases. It aims to make agricultural technology more accessible through voice interaction and multilingual support.

## 🚀 Features

- **User Authentication:** Registration, login, OTP verification, and password reset.
- **Farmer–Buyer Marketplace:** Supports direct connections between farmers and buyers.
- **Crop Management:** View and manage crop-related information.
- **Order Management:** Supports order-related operations.
- **Weather Information:** Access weather information to support agricultural planning.
- **Voice Assistant:** Voice-based interaction for agricultural marketplace tasks.
- **Plant Disease Screening:** AI-based image analysis to identify possible plant diseases.
- **Multilingual Support:** Designed to make the application more accessible to users with different language preferences.

## 🛠️ Technologies Used

### Frontend
- React
- Vite
- JavaScript
- HTML and CSS

### Backend
- Python
- Flask
- Flask-CORS
- Flask-Mail

### Database
- MySQL

### AI and Image Analysis
- Hugging Face Transformers
- PyTorch
- Pillow
- Plant disease image classification model

## 📁 Project Structure

```text
FarmConnect-AI/
├── backend/
│   ├── app.py
│   ├── db.py
│   ├── disease_detector.py
│   ├── voice.py
│   └── weather.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── package.json
├── package-lock.json
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the application:

- Python 3
- Node.js and npm
- MySQL Server
- Git

### 1. Clone the repository

```bash
git clone https://github.com/dwarikasomvanshi4-wq/FarmConnect-AI.git
cd FarmConnect-AI
```

### 2. Set up the backend

Open a terminal in the project root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install flask flask-cors flask-mail pymysql sqlalchemy transformers torch pillow
```

Configure your database connection, email settings, and other required environment variables using a local `.env` file or the configuration method used by the backend. **Never commit credentials or API keys to GitHub.**

Create and configure the MySQL database according to the database setup required by the backend.

Start the backend using the command appropriate for your project configuration. If `app.py` is the Flask entry point:

```powershell
python app.py
```

The backend is expected to run at:

`http://127.0.0.1:5000`

### 3. Set up the frontend

Open a second terminal in the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, typically:

`http://localhost:5173`

## 🧪 Testing

The backend includes test scripts for selected application features, such as registration, login, orders, uploads, crop operations, and feedback.

The plant disease screening endpoint can be tested using a `POST` request to:

`http://127.0.0.1:5000/detect-disease`

Send an image using `multipart/form-data` with the field name `image`.

AI-generated plant disease results are preliminary screening results and should not be treated as a confirmed diagnosis. Predictions can be uncertain and should be verified with an agricultural expert.

## 🔒 Security Notes

- Keep passwords, email credentials, API keys, and database credentials private.
- Store local secrets in environment variables or a local `.env` file.
- Do not upload `.env`, virtual environments, or local user-uploaded images.
- Configure appropriate security, validation, and access controls before production deployment.

## 🎯 Project Objective

FarmConnect AI aims to improve access to agricultural digital services by combining marketplace functionality, crop and order management, weather information, voice interaction, multilingual accessibility, and AI-assisted plant disease screening in a single web application.

## 👩‍💻 Repository

GitHub: [FarmConnect-AI](https://github.com/dwarikasomvanshi4-wq/FarmConnect-AI)

## 📌 Future Enhancements

- Improve plant disease classification reliability and confidence handling.
- Expand voice recognition and multilingual interaction.
- Enhance marketplace discovery and farmer–buyer communication.
- Add analytics and insights for crop sales and demand.
- Improve deployment, automated testing, and application security.
