NagarSetu Project Overview:

NagarSetu is a web application that helps citizens to connect with their local government and get their issues resolved.

Tech Stack:
Frontend: HTML, CSS, JavaScript
Backend: FAST-API (Python)
Database: PostgreSQL
ML : PyTorch

Features:

1. Citizen can register and login
2. Citizen can create a complaint
3. Citizen can track the status of their complaint
4. Admin can login and view complaints
5. Admin can update the status of the complaint

Run these commands in the terminal to start the application:

1. npm install
2. npm run dev (in the Frontend folder)
3. uvicorn main:app --reload --host [IP_ADDRESS] --port 8000 (in the Backend folder)
4. uvicorn inference_api:app --reload --host [IP_ADDRESS] --port 8001 (in the Backend folder)
