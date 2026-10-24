Internship Application Tracker — Backend

The backend API for the Internship Application Tracker, a web-based application that helps students manage internship opportunities and track their applications.

🚀 Deployment

Backend API: https://itelect4-backend-topaz.vercel.app

Frontend Application: https://itelect4-project-eight.vercel.app

Backend Repo: https://github.com/jashiadeveza/itelect4-backend

Frontend Repo: https://github.com/jashiadeveza/itelect4-project

Backend Repository: itelect4-backend

🛠️ Technologies Used

Node.js — JavaScript runtime

Express.js — Backend framework for building REST APIs

MongoDB Atlas — Cloud database

Mongoose — MongoDB object modeling

JWT — Authentication tokens

CORS — Controls which frontend origins can access the API

Vercel — Backend deployment platform

✨ Features

User authentication and registration

REST API endpoints for application resources

Database connectivity with MongoDB Atlas

CORS configuration using environment variables

Health check endpoint for checking API and database status

⚙️ Getting Started

Prerequisites

Node.js and npm

A MongoDB Atlas account and database

Git

Installation

Clone the repository:

git clone https://github.com/jashiadeveza/itelect4-backend.git

Navigate to the backend directory:

cd itelect4-backend

Install dependencies:

npm install

Create a .env file in the root directory:

MONGODB_URI=your_mongodb_connection_string JWT_SECRET=your_secret_key CORS_ORIGIN=http://localhost:5173,https://itelect4-project-eight.vercel.app
