# NagarSetu

## Project Title and Brief Description

**NagarSetu** is a smart civic issue reporting and complaint management system that connects citizens with local government authorities.

Citizens can report civic problems such as potholes, garbage, sewage/waterlogging, street light issues, traffic problems, and infrastructure damage by uploading an image, location, category, and description. The system uses a Machine Learning model to classify the uploaded image, calculate severity, assign priority, and suggest the responsible department.

Admins can view all complaints, update complaint status, assign departments, monitor pending issues, and analyze complaint trends through dashboards.

The main aim of NagarSetu is to make civic issue reporting faster, more transparent, and more accountable.

---

## Technology Stack and Tools Used

### Frontend
- React.js
- Vite
- JavaScript
- Tailwind CSS
- React Router DOM
- Framer Motion
- Lucide React Icons

### Backend
- FastAPI
- Python
- SQLAlchemy ORM
- Pydantic
- JWT Authentication
- bcrypt Password Hashing
- Uvicorn Server

### Database
- PostgreSQL

### Machine Learning
- PyTorch
- Torchvision
- MobileNetV3 Small
- ONNX
- ONNX Runtime
- NumPy
- Pillow

### Tools Used
- VS Code
- Git and GitHub
- Postman
- Kaggle Dataset
- Browser Developer Tools

---

## Features and Functionalities Implemented

### Citizen Features
- Citizen registration and login
- Secure password hashing
- JWT-based authentication
- Report civic issues with:
  - Title
  - Description
  - Category
  - Location
  - City
  - Image upload
- Track complaint status
- View complaint history
- View complaint reference ID such as `NS-001`
- View assigned department and current progress

### Admin Features
- Admin login
- Role-based protected admin dashboard
- View all complaints
- Search and filter complaints
- Update complaint status:
  - Pending
  - In Progress
  - Resolved
  - Rejected
- Assign or reassign complaints to departments
- View citizen details related to complaints
- View complaint images
- View dashboard statistics
- View department performance
- View complaint category analytics
- View recent activity feed

### Machine Learning Features
- Image-based civic issue classification
- Predicts issue category such as:
  - Pothole
  - Garbage
  - Sewage
  - Street Light
  - Other
- Calculates AI confidence score
- Calculates severity score
- Assigns priority:
  - Low
  - Medium
  - High
- Flags low-confidence predictions for manual admin review
- Suggests responsible department based on predicted class

### Departments Supported
- PWD Department
- Municipal Corporation
- Electricity Department
- Traffic Police
- NHAI

---

## Installation and Execution Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Aaditya02123/NagarSetu.git
cd NagarSetu
```

### 2. Frontend Setup

```bash
cd NagarSetu-Frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

---

### 3. Backend Setup

```bash
cd NagarSetu-Backend
pip install -r requirements.txt
uvicorn main:app --reload --host localhost --port 8000
```

Backend API will run on `http://localhost:8000`

Backend health check: `http://localhost:8000/health`

---

### 4. ML Inference API Setup

```bash
cd NagarSetu-Backend
uvicorn inference_api:app --reload --host localhost --port 8001
```

ML Inference API will run on `http://localhost:8001`

ML health check: `http://localhost:8001/health`

---

### 5. Database Setup

Create a PostgreSQL database and configure the database URL in the backend environment file.

Create a `.env` file inside `NagarSetu-Backend/` with the following content:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/nagarsetu
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:5173
```

The backend creates required tables automatically using SQLAlchemy when the server starts.

---

### 6. Project Execution Flow

1. Start PostgreSQL database.
2. Start backend server on port `8000`.
3. Start ML inference server on port `8001`.
4. Start frontend server on port `5173`.
5. Open the frontend in the browser at `http://localhost:5173`.
6. Register or log in as a citizen.
7. Submit a civic complaint with an image.
8. The ML service classifies the issue and calculates severity.
9. The backend stores complaint details in PostgreSQL.
10. Admin can view, assign, update, and resolve complaints via the admin dashboard.

---

### Team Members

| Name | Role |
|------|------|
| Aadityaraj Soni | Backend development & ML Integration |
| Aaadi Dubeey | Frontend Developer |
| Aashay Jain | Database and Testing |

---

## Images

### 1. Home Page
![Home Page](screenshots/Home.png)

### 2. Login Page
![Login Page](screenshots/LoginPage.png)

### 3. Register Page
![Register Page](screenshots/RegisterPage.png)

### 4. Report Page
![Report Page](screenshots/ReportPage.png)

### 5. User Dashboard Page
![User Dashboard](screenshots/UserDashboard.png)

### 6. About Page
![About Page](screenshots/About.png)

### 7. Complaint Page
![Complaint Page](screenshots/Complaints.png)

### 8. Department Page
![Department Page](screenshots/Departments.png)

### 9. Analytics Page
![Analytics Page](screenshots/Analytics.png)
