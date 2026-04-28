# Knowledge Hub

## Prerequisites

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.

## Downloading

```
git clone {repository URL}
```

## Installing NPM modules

```
npm install
```

## Running application

```
npm start
```

After starting the app on port (4000 as default) you can open
in your browser OpenAPI documentation by typing http://localhost:4000/doc/.
For more information about OpenAPI/Swagger please visit https://swagger.io/.

## Testing

After application running open new terminal and enter:

To run all tests without authorization

```
npm run test
```

Mentions: if tests don't work because of

```
TypeError: Cannot read properties of undefined (reading 'prototype')
```

try use

```
npm i jsonwebtoken@latest
```

because the library is lacked of updating

### Auto-fix and format

```
npm run lint
```

```
npm run format
```

### Debugging in VSCode

Press <kbd>F5</kbd> to debug.

For more information, visit: https://code.visualstudio.com/docs/editor/debugging

## Docker

The DockerHub: https://hub.docker.com/r/doordoom/nodejs-2026q1-knowledge-hub/tags

start work:

```
docker-compose up --build
```

## Gemini API

### Overview

This project integrates Google’s Gemini API to analyze and summarize article content. It demonstrates how to structure AI responses into a predictable backend interface and expose them via NestJS endpoints.

### How to Obtain a Gemini API Key (Step-by-Step)

Go to Google AI Studio: https://aistudio.google.com/
Sign in with your Google account
Click “Get API key” in the top-right corner
Select an existing Google Cloud project or create a new one
Click “Create API Key”
Copy the generated API key

⚠️ Keep your API key private. Do not commit it to source control.

### Gemini model

I have used gemini-3-flash-preview Gemini model

### Setup instructions

1. Clone the repository
   git clone <your-repo-url>
   cd <your-project-folder>
2. Install dependencies
   npm install
3. Configure environment variables

Create a .env file in the root of the project:

GOOGLE_API_KEY=your_api_key_here
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_MODEL=gemini-2.0-flash
AI_RATE_LIMIT_RPM=20
AI_CACHE_TTL_SEC=300

DATABASE_URL=your_database_url
PORT=3000

👉 Paste your Gemini API key into GOOGLE_API_KEY

4. Run the application
   npm run start:dev

Server will start on:

http://localhost:3000

### Known Limitations

1. Free-tier quotas
   Limited number of requests per minute/day
   May return errors if quota is exceeded
2. Response consistency
   Gemini may occasionally return:
   Invalid JSON
   Extra formatting (e.g., ```json blocks)
   Backend parsing and validation are required
3. Latency
   Typical response time: 1–3 seconds
   Can increase with longer inputs
4. Input size limits
   Large articles may exceed token limits
   Recommended approach:
   Split content into chunks
   Summarize progressively
5. Regional availability
   Some regions may experience:
   Higher latency
   Limited availability depending on Google Cloud setup
