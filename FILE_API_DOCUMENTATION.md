# File Management API Documentation

## Overview

Complete REST API for managing files with automatic Media record creation, file upload handling, pagination, filtering, and sorting capabilities.

**Base URL**: `/api/v1/files`
**Version**: 1.0
**Last Updated**: April 13, 2026

---

## Table of Contents

1. [Endpoints](#endpoints)
2. [Request/Response Examples](#requestresponse-examples)
3. [Query Parameters](#query-parameters)
4. [Error Codes](#error-codes)
5. [Data Models](#data-models)
6. [Usage Examples](#usage-examples)

---

## Endpoints

### 1. POST /api/v1/files

**Description**: Create a new file record manually (without file upload)

**Request Body**:
```json
{
  "media_id": 1,
  "user_id": 1,
  "target_user": 2,
  "node_path": "/uploads/document.pdf",
  "tags": ["document", "important"],
  "comment": "Important document"
}
```

**Required Fields**:
- `media_id` (BIGINT): ID of existing Media record
- `user_id` (BIGINT): ID of uploader User
- `node_path` (STRING): Path or filename

**Optional Fields**:
- `target_user` (BIGINT): ID of recipient user
- `tags` (ARRAY): Array of tags
- `comment` (STRING): Optional comment

**Response** (201 Created):
```json
{
  "success": true,
  "message": "File created successfully",
  "data": {
    "id": 1,
    "media_id": 1,
    "user_id": 1,
    "target_user": 2,
    "node_path": "/uploads/document.pdf",
    "size": null,
    "tags": ["document", "important"],
    "comment": "Important document",
    "isDeleted": false,
    "createdAt": "2026-04-13T10:30:45.000Z",
    "updatedAt": "2026-04-13T10:30:45.000Z",
    "media": {
      "id": 1,
      "s3_path": null,
      "local_path": "/uploads/document.pdf",
      "upload_status": 0
    },
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "admin"
    },
    "targetUser": {
      "id": 2,
      "username": "jane_doe",
      "email": "jane@example.com",
      "role": "user"
    }
  }
}
```

**Error Responses**:
- 400: Missing required fields
- 404: Media or User not found
- 500: Server error

---

### 2. POST /api/v1/files/upload

**Description**: Upload a file and automatically create Media + File records

**Content-Type**: `multipart/form-data`

**Form Fields**:
```
file              (FILE, required)     - The file to upload
user_id           (BIGINT, required)   - Uploader user ID
target_user       (BIGINT, optional)   - Recipient user ID
tags              (STRING/ARRAY, opt)  - Tags (repeatable)
comment           (STRING, optional)   - Optional comment
local_path        (STRING, optional)   - Override local path
s3_path           (STRING, optional)   - S3 path if pre-uploaded
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "File uploaded and created successfully",
  "data": {
    "id": 1,
    "media_id": 1,
    "user_id": 1,
    "target_user": 2,
    "node_path": "1704067245000_document.pdf",
    "size": 2097152,
    "tags": ["important", "document"],
    "comment": "Important document",
    "isDeleted": false,
    "createdAt": "2026-04-13T10:30:45.000Z",
    "updatedAt": "2026-04-13T10:30:45.000Z",
    "media": {
      "id": 1,
      "s3_path": null,
      "local_path": "/uploads/files/1704067245000_document.pdf",
      "upload_status": 0
    },
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "admin"
    },
    "targetUser": {
      "id": 2,
      "username": "jane_doe",
      "email": "jane@example.com",
      "role": "user"
    }
  }
}
```

**Key Features**:
- Automatic file size capture (in bytes)
- Media record creation
- File record creation with Media link
- Complete associations in response

---

### 3. GET /api/v1/files

**Description**: List all files with pagination, filtering, and sorting

**Query Parameters**:
- `page` (INT, default: 1): Page number
- `limit` (INT, default: 20): Items per page
- `media_id` (BIGINT): Filter by media ID
- `user_id` (BIGINT): Filter by uploader
- `target_user` (BIGINT): Filter by recipient
- `search` (STRING): Search in node_path and comment
- `sortBy` (STRING): Sort field (createdAt, updatedAt, id, node_path, size)
- `sortOrder` (STRING): ASC or DESC (default: DESC)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Files retrieved successfully",
  "data": [
    {
      "id": 1,
      "media_id": 1,
      "user_id": 1,
      "target_user": 2,
      "node_path": "1704067245000_document.pdf",
      "size": 2097152,
      "tags": ["important"],
      "comment": "Important doc",
      "isDeleted": false,
      "createdAt": "2026-04-13T10:30:45.000Z",
      "updatedAt": "2026-04-13T10:30:45.000Z",
      "media": { ... },
      "user": { ... },
      "targetUser": { ... }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  },
  "filters": {
    "sortBy": "createdAt",
    "sortOrder": "DESC"
  }
}
```

---

### 4. GET /api/v1/files/:id

**Description**: Get a single file by ID

**Parameters**:
- `id` (BIGINT, required): File ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "File retrieved successfully",
  "data": {
    "id": 1,
    "media_id": 1,
    "user_id": 1,
    "target_user": 2,
    "node_path": "1704067245000_document.pdf",
    "size": 2097152,
    "tags": ["important"],
    "comment": "Important doc",
    "isDeleted": false,
    "createdAt": "2026-04-13T10:30:45.000Z",
    "updatedAt": "2026-04-13T10:30:45.000Z",
    "media": { ... },
    "user": { ... },
    "targetUser": { ... }
  }
}
```

**Error Responses**:
- 404: File not found or deleted

---

### 5. PUT /api/v1/files/:id

**Description**: Update a file record

**Parameters**:
- `id` (BIGINT, required): File ID

**Request Body** (all optional):
```json
{
  "media_id": 1,
  "user_id": 1,
  "target_user": 2,
  "node_path": "/uploads/updated.pdf",
  "tags": ["updated", "important"],
  "comment": "Updated comment"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "File updated successfully",
  "data": { ... }
}
```

**Error Responses**:
- 404: File not found
- 400: Invalid foreign key reference

---

### 6. DELETE /api/v1/files/:id

**Description**: Soft delete a file (sets isDeleted: true)

**Parameters**:
- `id` (BIGINT, required): File ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "id": 1
  }
}
```

**Error Responses**:
- 404: File not found

---

### 7. GET /api/v1/files/user/:userId

**Description**: Get all files uploaded by a specific user

**Parameters**:
- `userId` (BIGINT, required): User ID

**Query Parameters**:
- `page` (INT, default: 1)
- `limit` (INT, default: 20)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User files retrieved successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### 8. GET /api/v1/files/target/:userId

**Description**: Get all files targeted to a specific user

**Parameters**:
- `userId` (BIGINT, required): User ID

**Query Parameters**:
- `page` (INT, default: 1)
- `limit` (INT, default: 20)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Files for user retrieved successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

---

## Request/Response Examples

### Example 1: Upload a File

```bash
curl -X POST http://localhost:3000/api/v1/files/upload \
  -F "file=@document.pdf" \
  -F "user_id=1" \
  -F "target_user=2" \
  -F "tags=important" \
  -F "tags=document" \
  -F "comment=Important PDF"
```

**Response**:
```json
{
  "success": true,
  "message": "File uploaded and created successfully",
  "data": {
    "id": 1,
    "media_id": 1,
    "user_id": 1,
    "target_user": 2,
    "node_path": "1704067245000_document.pdf",
    "size": 2097152,
    "tags": ["important", "document"],
    "comment": "Important PDF",
    "isDeleted": false,
    "createdAt": "2026-04-13T10:30:45.000Z",
    "updatedAt": "2026-04-13T10:30:45.000Z",
    "media": { ... },
    "user": { ... },
    "targetUser": { ... }
  }
}
```

---

### Example 2: List Files with Pagination

```bash
curl "http://localhost:3000/api/v1/files?page=1&limit=10"
```

---

### Example 3: Sort Files by Size (Descending)

```bash
curl "http://localhost:3000/api/v1/files?sortBy=size&sortOrder=DESC"
```

---

### Example 4: Search for Files

```bash
curl "http://localhost:3000/api/v1/files?search=document"
```

---

### Example 5: Filter by User and Sort by Date

```bash
curl "http://localhost:3000/api/v1/files?user_id=1&sortBy=createdAt&sortOrder=DESC"
```

---

### Example 6: Get Files for Specific User

```bash
curl "http://localhost:3000/api/v1/files/target/2?page=1&limit=20"
```

---

### Example 7: Update File Comment

```bash
curl -X PUT http://localhost:3000/api/v1/files/1 \
  -H "Content-Type: application/json" \
  -d '{"comment": "Updated comment"}'
```

---

### Example 8: Delete File

```bash
curl -X DELETE http://localhost:3000/api/v1/files/1
```

---

### Example 9: JavaScript Upload

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('user_id', '1');
formData.append('target_user', '2');
formData.append('tags', 'important');
formData.append('comment', 'Important document');

fetch('/api/v1/files/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

---

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | INT | 1 | Page number for pagination |
| `limit` | INT | 20 | Items per page |
| `media_id` | BIGINT | - | Filter by media ID |
| `user_id` | BIGINT | - | Filter by uploader |
| `target_user` | BIGINT | - | Filter by recipient |
| `search` | STRING | - | Search in node_path and comment |
| `sortBy` | STRING | createdAt | Sort field |
| `sortOrder` | STRING | DESC | ASC or DESC |

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Missing required fields | Required parameter not provided |
| 404 | Resource not found | File, Media, or User not found |
| 404 | File has been deleted | File marked as deleted |
| 500 | Error message | Server error |

---

## Data Models

### File Object

```javascript
{
  id: BIGINT,                    // Primary key
  media_id: BIGINT,              // Reference to Medias
  user_id: BIGINT,               // Uploader user
  target_user: BIGINT or null,   // Recipient user
  node_path: STRING,             // Filename/path
  size: BIGINT or null,          // File size in bytes
  tags: ARRAY,                   // Array of tags
  comment: STRING or null,       // Optional comment
  isDeleted: BOOLEAN,            // Soft delete flag
  createdAt: DATE,               // Creation timestamp
  updatedAt: DATE,               // Last update timestamp
  media: OBJECT,                 // Associated Media
  user: OBJECT,                  // Uploader user details
  targetUser: OBJECT or null     // Recipient user details
}
```

### Media Object

```javascript
{
  id: BIGINT,
  s3_path: STRING or null,       // S3 path
  local_path: STRING,            // Local file path
  upload_status: INT             // 0: Local, 1: S3
}
```

### User Object

```javascript
{
  id: BIGINT,
  username: STRING,
  email: STRING,
  role: STRING
}
```

---

## Relationships

### File ↔ Medias (One-to-One)
- Via `media_id` foreign key
- CASCADE delete on Media deletion

### File ↔ User (One-to-Many, Uploader)
- Via `user_id` foreign key
- Alias: `user`
- CASCADE delete on User deletion

### File ↔ User (One-to-Many, Recipient)
- Via `target_user` foreign key
- Alias: `targetUser`
- SET NULL on User deletion (optional)

---

## File Upload Workflow

```
1. POST /api/v1/files/upload
   ↓
2. Multer receives file and stores in uploads/files/
   ↓
3. Medias record created with file path info
   ↓
4. File size automatically captured
   ↓
5. File record created with Media reference
   ↓
6. All associations loaded
   ↓
7. Complete File object returned (201)
```

---

## Soft Delete

Files are soft-deleted by setting `isDeleted: true`. This:
- Preserves file data for audit trails
- Excludes deleted files from list operations
- Allows data recovery if needed
- Returns 404 when accessing deleted files

---

## Pagination

- **Default limit**: 20 items per page
- **Max recommended limit**: 100 items per page
- **Response includes**: total, page, limit, totalPages

---

## Sorting

**Available sort fields**:
- `createdAt` (default)
- `updatedAt`
- `id`
- `node_path`
- `size`

**Sort orders**:
- `ASC` - Ascending
- `DESC` - Descending (default)

---

## Best Practices

1. **Always validate user_id**: Ensure user exists before uploading
2. **Use tags for organization**: Makes files easier to find
3. **Set target_user for sharing**: When file is for someone else
4. **Add meaningful comments**: Helps with file description
5. **Handle errors gracefully**: Check response status and message
6. **Test pagination**: Ensure app handles large datasets
7. **Monitor file sizes**: Track total storage usage
8. **Use soft delete**: Never hard-delete important files

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- File size is in bytes
- Upload directory auto-created on first use
- Filenames are timestamped to prevent collisions
- Multiple tags can be provided as repeated form fields
- S3 path is optional for future cloud integration
- All associations are loaded in responses
- Invalid sort fields default to `createdAt`
- Invalid sort order defaults to `DESC`
