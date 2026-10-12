# Plant Disease Detection App

> **Academic Undergraduate Graduation Project**  
> **Institution:** Konya Technical University — Department of Computer Engineering  
> **Author:** Asım Karabulut ([@asmss](https://github.com/asmss))

---

## About the Project
An end-to-end autonomous plant health ecosystem designed to diagnose plant diseases accurately and provide customized agricultural treatment prescriptions. The system combines modern mobile technologies with advanced deep learning models and Retrieval-Augmented Generation (RAG) capabilities to assist farmers and agricultural professionals.

---

## Key Features
- **Smart Pre-filtering (YOLOv8):** Prevents irrelevant or non-plant images from misleading the system before classification.
- **High-Accuracy Classification (ResNet34):** Deep learning model trained to classify plant diseases with high precision.
- **AI Treatment Assistant (Llama 3 + RAG):** Generates contextual, expert-level agricultural treatment recommendations and allows interactive chat.
- **Smart Task Management & Calendar:** Syncs treatment schedules with automated reminders.
- **Professional Reporting:** Exports diagnostic results and treatment plans into downloadable PDF reports.
- **Offline-First & Cloud Sync:** Built with React Native and supported by a robust Node.js and Python backend infrastructure.

---

## Tech Stack

### **Frontend (Mobile)**
- **Framework:** React Native (Expo Go)
- **State Management & UI:** Modern React hooks, responsive mobile layouts

### **Backend & APIs**
- **Main Backend:** Node.js, Express.js
- **AI & ML Services:** Python, Flask / FastAPI, YOLOv8, PyTorch (ResNet34), Llama 3 (RAG)
- **Database:** MongoDB Atlas

### **DevOps & Tools**
- **Containerization:** Docker, Docker Compose
- **API Testing:** Postman
- **Version Control:** Git, GitHub

---

## Project Structure

```tree
bitirme_bitkilerdeHastalikTahminiApp/
│
├── Frontend/
│   └── bitkiHastalikApp/       # React Native (Expo) mobile application
│
├── Backend/
│   ├── app_api/                # Node.js & Express.js core REST API server
│   ├── ai_connect/             # Python ML models (YOLOv8 & ResNet34 processing)
│   └── chatbot_connect/        # Llama 3 & RAG chatbot integration
│
├── tam_eğit.py                 # Model training scripts
├── test.py                     # Evaluation and testing scripts
└── README.md
