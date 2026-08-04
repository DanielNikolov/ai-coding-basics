# Messages App

A lightweight Node.js + Express web application that lets users post and search text messages through a browser-based UI. Messages are persisted to a local JSON file.

---

## Features

- **POST** a message with an author name and markup text
- **GET** messages filtered by author name and/or date, with built-in pagination
- **Web UI** with two sections — a post form and a paginated search form
- Mobile-friendly, flexbox-based layout

---

## Requirements

- [Node.js](https://nodejs.org/) v18 or higher (developed with v24.18.0)
- npm (bundled with Node.js)

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/DanielNikolov/ai-coding-basics.git
   cd ai-coding-basics
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Running the Application

Start the server:
```bash
npm start
```

The server starts on port **3000** by default. Open your browser and navigate to:
```
http://localhost:3000
```

To use a different port, set the `PORT` environment variable before starting:
```bash
# Windows (PowerShell)
$env:PORT = 4000; npm start

# macOS / Linux
PORT=4000 npm start
```

---

## API Endpoints

### `POST /messages`

Stores a new message.

**Request body:**
```json
{
  "author": "First Last",
  "message": "<p>Your markup text</p>"
}
```

| Status | Meaning |
|--------|---------|
| `201`  | Message stored successfully |
| `400`  | Missing or invalid `author` / `message` fields |
| `500`  | Unexpected server error |

---

### `GET /messages`

Retrieves messages with optional filtering and pagination.

**Query parameters:**

| Parameter   | Type            | Required                          | Default |
|-------------|-----------------|-----------------------------------|---------|
| `user`      | string          | At least one of `user`/`timestamp` | —       |
| `timestamp` | `dd-MM-yyyy`    | At least one of `user`/`timestamp` | —       |
| `page`      | number          | No                                | `1`     |
| `size`      | number          | No                                | `10`    |

**Example:**
```
GET /messages?user=Jane%20Doe&timestamp=04-08-2026&page=1&size=5
```

| Status | Meaning |
|--------|---------|
| `200`  | Success — returns paginated results and total count |
| `400`  | Neither `user` nor `timestamp` provided, or invalid format |
| `500`  | Unexpected server error |
