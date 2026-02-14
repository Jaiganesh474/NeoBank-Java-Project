---
description: Setup and run the banking system
---

# Banking System Setup and Run Guide

## Prerequisites
1. Java 17 or higher
2. Node.js 18+ and npm
3. MySQL 8.0+
4. Maven 3.6+

## Backend Setup

// turbo-all

1. Navigate to backend directory
```bash
cd "c:/Users/jaiga/Downloads/Banking System/backend"
```

2. Configure MySQL Database
```bash
mysql -u root -p
```
Then run:
```sql
CREATE DATABASE banking_system;
CREATE USER 'banking_user'@'localhost' IDENTIFIED BY 'banking_password';
GRANT ALL PRIVILEGES ON banking_system.* TO 'banking_user'@'localhost';
FLUSH PRIVILEGES;
```

3. Update application.properties with your MySQL credentials and Google OAuth credentials

4. Build the backend
```bash
mvn clean install
```

5. Run the backend
```bash
mvn spring-boot:run
```

Backend will run on http://localhost:8080

## Frontend Setup

1. Navigate to frontend directory
```bash
cd "c:/Users/jaiga/Downloads/Banking System/frontend"
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

Frontend will run on http://localhost:5173

## Access the Application

- User Portal: http://localhost:5173/
- Admin Portal: http://localhost:5173/admin
- API Documentation: http://localhost:8080/swagger-ui.html

## Default Admin Credentials
- Email: admin@banking.com
- Password: Admin@123
