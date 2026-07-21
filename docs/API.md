# API Documentation

Base URL: `http://localhost:8000/api/v1` (or your deployed domain)

## Authentication
Most endpoints require a JWT Bearer token.
Header: `Authorization: Bearer <your_token>`

---

## Auth Endpoints

### Login
`POST /auth/login`
Authenticate a user and get a JWT token.
*   **Request Body** (application/x-www-form-urlencoded):
    *   `username` (email)
    *   `password`
*   **Response** (200 OK):
    ```json
    {
      "access_token": "eyJhbG...",
      "token_type": "bearer"
    }
    ```

### Register
`POST /auth/register`
Register a new user.
*   **Request Body** (application/json):
    ```json
    {
      "email": "user@example.com",
      "password": "strongpassword123",
      "full_name": "John Doe"
    }
    ```
*   **Response** (201 Created):
    ```json
    {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "is_active": true
    }
    ```

---

## Image Endpoints

### Analyze Image
`POST /images/analyze`
Upload an image for forgery detection.
*   **Requires Auth**: Yes
*   **Request Body** (multipart/form-data):
    *   `file`: The image file (JPEG/PNG)
*   **Response** (200 OK):
    ```json
    {
      "id": "uuid-1234",
      "filename": "image.jpg",
      "result": {
        "is_forged": true,
        "confidence": 0.95,
        "heatmap_url": "/uploads/heatmaps/uuid-1234.png"
      },
      "created_at": "2023-10-27T10:00:00Z"
    }
    ```
*   **cURL Example**:
    ```bash
    curl -X POST "http://localhost:8000/api/v1/images/analyze" \
      -H "Authorization: Bearer <token>" \
      -F "file=@/path/to/image.jpg"
    ```

### Get Scan History
`GET /images/history`
Get the user's past image scans.
*   **Requires Auth**: Yes
*   **Response** (200 OK): Array of analysis objects.

---

## Admin Endpoints

### Get All Users
`GET /admin/users`
List all users in the system.
*   **Requires Auth**: Yes (Admin only)
*   **Response** (200 OK): Array of user objects.
