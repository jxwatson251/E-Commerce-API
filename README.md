#🛒 E-commerce Backend API

# Overview
This is a backend API service for an e-commerce platform built with Node.js, Express, and MongoDB. It features robust user authentication via JWT, secure password hashing with bcrypt, CRUD operations on products, and integration with a Currency Exchange Rate API to convert product prices into different currencies.

# Project Structure
├ controllers/
├ models/
├ routes/
├ utils/
├ middleware/
├ config/
├ .env
├ server.js
└ package.json

# Features
•	User Registration & Login
•	JWT Authentication
•	Password Hashing (bcrypt)
•	Product CRUD Operations
•	Currency Conversion using a 3rd-Party API
•	Input Validation (Joi)
•	Centralized Error Handling
•	API Documentation with Swagger/Postman

# Setup Instructions

## Prerequisites
•	Node.js v16+
•	MongoDB
•	npm or yarn

## Installation
1.	Clone the repository
https://github.com/jxwatson251/E-commerce-Platform.git
cd E-commerce-Platform

2.	Install dependencies
npm install

3.	Create a .env file
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret
EXCHANGE_API_URL=https://api.exchangerate-api.com/v4/latest/USD

4.	Start the server
npm start

# Authentication Endpoints
Endpoint                      Method                      Description
/api/auth/register            POST                        Register a new user
/api/auth/login               POST                        Login and receive JWT
/api/users/me                 GET                         Get user profile (auth required)
/api/users/me                 PUT                         Update profile (auth required)

# Product Endpoints
Endpoint                              Method       Access           Description
/api/products                         GET          Public           Get all products
/api/products/:id                     GET          Public           Get product by ID
/api/products                         POST         Authenticated    Create a new product
/api/products/:id                     PUT          Authenticated    Update product (owner only)
/api/products/:id                     DELETE       Authenticated    Delete product (owner only)
/api/products/:id/price-in/:currency  GET          Public           Get product price in another currency

# Validation & Error Handling
•	Request validation via Joi
•	Centralized error middleware
•	Meaningful HTTP status codes and messages

# API Documentation
•	View the full API documentation via:
•	Swagger UI (if implemented)
•	Postman Collection: Link to Collection
