# CablePro Authentication Fix - Complete Guide

## ✅ What Was Fixed

### 1. **Database Schema Mismatch**
- **Problem**: SQL file had old schema (user_id, username, password) but backend expected (id, name, mobile, password_hash)
- **Fix**: Created complete schema matching backend model expectations

### 2. **Missing Tables**
- **Problem**: No `users`, `areas`, or related tables existed
- **Fix**: Imported `cablepro_complete.sql` with all required tables

### 3. **Missing Sample Data**
- **Problem**: Database was empty, no users to login with
- **Fix**: Added 3 test users with proper bcrypt password hashes

### 4. **Missing Connection Verification**
- **Problem**: Server didn't verify database connection on startup
- **Fix**: Added DB connection test in server.js before starting

### 5. **Poor Error Logging**
- **Problem**: Errors weren't descriptive enough for debugging
- **Fix**: Enhanced error handler middleware with specific error logging

---

## 📋 Test Users Available

| User | Mobile | Role | Password | Notes |
|------|--------|------|----------|-------|
| Admin User | 9999999999 | admin | Admin@123 | Full system access |
| Operator User | 9999999998 | operator | Operator@123 | Operator permissions |
| Test User | 9999999997 | staff | Test@123 | Staff level access |

---

## 🧪 How to Test Login API

### Using cURL (Windows PowerShell):
```powershell
$body = @{
    mobile = "9999999999"
    password = "Admin@123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Using fetch (JavaScript/Frontend):
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    mobile: '9999999999',
    password: 'Admin@123'
  })
});

const data = await response.json();
console.log('Login Response:', data);
// Expected response:
// {
//   "token": "eyJhbGciOiJIUzI1NiIs...",
//   "user": {
//     "id": 1,
//     "name": "Admin User",
//     "mobile": "9999999999",
//     "role": "admin",
//     "status": "active"
//   }
// }
```

### Using Postman:
1. **URL**: `http://localhost:5000/api/auth/login`
2. **Method**: `POST`
3. **Headers**: 
   - `Content-Type: application/json`
4. **Body (raw JSON)**:
```json
{
  "mobile": "9999999999",
  "password": "Admin@123"
}
```

---

## 🔍 Verification Steps

### 1. Check Database Connection
```bash
mysql -u root -p"Thiya@2005#" cablepro -e "SELECT 1;"
```

### 2. Verify Tables Exist
```bash
mysql -u root -p"Thiya@2005#" cablepro -e "SHOW TABLES;"
```

### 3. Check Users in Database
```bash
mysql -u root -p"Thiya@2005#" cablepro -e "SELECT id, name, mobile, role, status FROM users;"
```

### 4. Check Backend is Running
```bash
netstat -ano | findstr "5000"
```

### 5. Check MySQL is Running
```bash
netstat -ano | findstr "3306"
```

### 6. Test Backend Health Endpoint
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET
```

---

## 🚀 Startup Commands

### Start Backend Server
```bash
cd backend
npm install  # Only first time
npm run dev
```

### Expected Startup Output
```
========================================
✓ CablePro API Server Started
  Port: 5000
  Environment: development
  Database: cablepro
  Database Host: localhost:3306
========================================
```

### Start Frontend
```bash
cd frontend
npm install  # Only first time
npm run dev
```

---

## 📝 Configuration Files

### .env (Development)
Located: `backend/.env`
- Used automatically by `npm run dev`
- Contains local development settings

### .env.production
Located: `backend/.env.production`
- Used when `NODE_ENV=production`
- Production database settings
- Stricter security settings

---

## ⚠️ Troubleshooting

### Issue: "Access denied for user 'root'@'localhost'"
**Solution**:
1. Verify MySQL is running: `netstat -ano | findstr "3306"`
2. Check .env password: `DB_PASSWORD=Thiya@2005#`
3. Test MySQL connection:
```bash
mysql -u root -p"Thiya@2005#" -e "SELECT 1;"
```

### Issue: "Table 'cablepro.users' doesn't exist"
**Solution**:
```bash
cd backend
Get-Content ../database/cablepro_complete.sql | mysql -u root -p"Thiya@2005#" cablepro
```

### Issue: "ERR_CONNECTION_REFUSED" on port 5000
**Solution**:
1. Check if backend is running: `netstat -ano | findstr "5000"`
2. Kill existing process if stuck: `Get-Process node | Stop-Process -Force`
3. Restart backend: `npm run dev`

### Issue: "Login failed" on frontend but no error details
**Solution**:
1. Open browser DevTools (F12)
2. Check Network tab - what's the response?
3. Check backend console - is there an error message?
4. Verify .env FRONTEND_URL matches: `http://localhost:5173`

### Issue: CORS Error on login request
**Solution**:
1. Check .env `FRONTEND_URL=http://localhost:5173`
2. Ensure frontend is running on port 5173
3. Verify backend CORS is enabled in `src/app.js`

---

## 🔐 Security Notes for Production

1. **Change JWT_SECRET**: Update to a strong random string
2. **Change Database Password**: Don't use Thiya@2005# in production
3. **Use Environment Variables**: Load from secure secret management
4. **Enable HTTPS**: Use SSL/TLS in production
5. **Use Environment: production**: Set NODE_ENV=production

---

## 📚 Database Schema Overview

### Key Tables:
- **users** - Authentication & user management
- **areas** - Geographic areas for management
- **customers** - Cable subscribers
- **cable_plans** - Available subscription plans
- **subscriptions** - Customer subscriptions
- **monthly_bills** - Billing records
- **payments** - Payment tracking
- **notifications** - User notifications
- **reports** - Generated reports
- **settings** - Application settings

### Relationships:
- users → areas (assigned_area_id)
- customers → areas (area_id)
- customers → subscriptions → cable_plans
- monthly_bills → customers
- payments → monthly_bills & customers

---

## ✨ Expected Login Flow

1. **Frontend sends login request**:
   - POST `/api/auth/login`
   - Body: `{ mobile, password }`

2. **Backend processes login**:
   - Finds user by mobile number
   - Compares password with bcrypt hash
   - Generates JWT token
   - Returns token + user info

3. **Frontend stores token**:
   - Saves token in localStorage/state
   - Includes in Authorization header for future requests

4. **Protected routes use token**:
   - GET `/api/auth/me` (requires token)
   - Other authenticated endpoints

---

## 🎯 Next Steps

1. ✅ Verify database is set up (DONE)
2. ✅ Restart backend server
3. ✅ Test login API with test user
4. ✅ Verify token is received
5. Update React frontend to use correct login endpoint
6. Test full login flow in React app
7. Deploy to production with proper environment variables

---

## 📞 Quick Reference

**Health Check**: `GET http://localhost:5000/health`

**Login**: 
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "mobile": "9999999999",
  "password": "Admin@123"
}
```

**Get Current User** (with token):
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer <token_from_login>
```

---

Last Updated: 2024
Database: MySQL 8.0+
