# NovaScribe - AI Video Transcription Web App

NovaScribe is a modern, containerized web application that allows users to upload video files, extracts the audio, and uses the **Google Gemini API** to transcribe the speech into text quickly and accurately.

## 🏗️ Architecture Stack
- **Frontend**: React + Vite (Typescript)
- **Backend**: NestJS (Typescript)
- **Database**: PostgreSQL (via TypeORM)
- **AI Processing**: Google Gemini API (`gemini-1.5-flash`)
- **Containerization**: Docker & Docker Compose

---

## 🚀 Step-by-Step Instructions to Run Locally

### Prerequisites
Before you start, make sure you have the following installed on your machine:
1. **Docker Desktop**: [Download here](https://www.docker.com/products/docker-desktop/)
2. **A Google Gemini API Key**: [Get one here](https://aistudio.google.com/app/apikey)

### Step 1: Configure Environment Variables
You need to provide your Gemini API key so the backend can process transcriptions.

1. Ensure you are in the root directory of the project (`interview-support`).
2. Create a file named `.env` in this directory.
3. Add the following line to the `.env` file, replacing the placeholder with your actual key:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

### Step 2: Start the Application with Docker
Now that the API key is configured, you can start the entire stack (Database, Backend API, and Frontend App) with a single command.

1. Run the following command in your terminal/PowerShell:
   ```bash
   docker-compose up --build -d
   ```
   *Note: The `--build` flag ensures Docker downloads all dependencies and builds the containers. The `-d` flag runs the containers in the background.*

### Step 3: View Live Backend Logs
Since the containers are running in the background, you'll want to stream the backend logs to see real-time updates when a video is processing (e.g. tracking the upload progress and AI generation time).

Run this command in your terminal:
```bash
docker-compose logs -f api
```
*(You can press `Ctrl+C` to stop watching the logs at any time).*

### Step 4:1. **Start the Infrastructure (Database):**
   ```bash
   docker-compose up -d
   ```

2. **Install Root Dependencies:**
   ```bash
   npm install
   ```

3. **Start Both Backend and Frontend:**
   ```bash
   npm start
   ```

The application will now be available at:
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3000](http://localhost:3000)
- **PostgreSQL Database**: Running internally on port `5432`

### Step 5: Test the App
1. Open [http://localhost:5173](http://localhost:5173) in your browser.
2. Drag and drop a `.mp4`, `.mov`, or `.webm` video file into the upload zone.
3. The app will extract the audio and pass it to Gemini. Wait a few seconds for processing to complete.
4. Your full text transcription will appear on the screen!

---

## 🛑 How to Stop the Application
When you are done testing, you can shut down the containers to free up system resources.

1. In the root directory of the project, run:
   ```bash
   docker-compose down
   ```
   *(If you want to clear the database and start entirely fresh next time, you can run `docker-compose down -v` to delete the postgres data volume).*
