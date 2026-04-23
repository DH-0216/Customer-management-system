# Customer Management System

A full-stack web application built with Spring Boot, React JS, and MariaDB.

## Features
- Complete Customer CRUD
- One-to-Many relationships for Mobile Numbers and Addresses
- Many-to-Many self-referencing relationship for Family Members
- Async streaming Bulk Upload of Customers via Excel (up to 1M rows)
- UI with sorting, pagination, and dynamic nested forms
- MariaDB backend out-of-the-box via Data JPA

## Architecture
- **Backend:** Java 8, Spring Boot 2.7.18, MariaDB client, Apache POI (SAX Streaming for large files)
- **Frontend:** React 18, Vite, React Router, React Hook Form, TanStack Table, Axios

## Requirements
- Java 8
- Node.js (16+ recommended)
- MariaDB 10.x running locally on port 3306

## Setup Instructions

### 1. Database
Create a database named `customer_db` in MariaDB with credentials `root` / `root`.
Or, open `backend/src/main/resources/application.properties` and update the DB URL, username, and password accordingly.
DDL and basic lookup tables (Cities, Countries) are auto-populated on startup.

### 2. Run Backend
```bash
cd backend
mvn spring-boot:run
```
The server will start on port `8080`.

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on port `5173`. Access it at `http://localhost:5173`.

## Bulk Upload feature
Navigate to Bulk Upload in the UI. Download the template, populate rows, and upload. The system processes massive files asynchronously and provides real-time progress via polling.
