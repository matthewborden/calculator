# `$ calc` ~ Terminal Calculator

A full-stack calculator application with **Ghostty-inspired terminal UI** and **Go backend** demonstrating microservices architecture.

## Architecture

```
┌─────────────────┐    HTTP/JSON    ┌──────────────────┐
│  Frontend UI    │ ──────────────► │   Backend API    │
│  (Node.js:3000) │                 │   (Go:8080)      │
│  • Web UI       │                 │  • Calculations  │
│  • API Proxy    │                 │  • Validation    │
│  • Health Check │                 │  • CORS Support  │
└─────────────────┘                 └──────────────────┘
```

## 🔧 Project Structure

```
calculator-app/
├── frontend/                    # Node.js Web Server
│   ├── server.js               # Express server + API proxy
│   ├── package.json            
│   ├── public/                 
│   │   ├── index.html          # Calculator UI
│   │   ├── calculator.js       # Frontend logic
│   │   └── styles.css          # Responsive design
│   ├── src/
│   │   └── calculator.js       # Core functions (testing)
│   └── __tests__/
│       └── app.test.js         # Frontend tests
├── backend/                     # Go REST API
│   ├── main.go                 # HTTP server + calculation logic
│   ├── go.mod                  
│   └── main_test.go            # Go unit tests
├── buildkite-pipeline.yml      # K8s pipeline config
└── README.md
```

## ✨ Features

### Frontend (Node.js + Express)
- 💻 **Terminal-themed UI** - Ghostty-inspired dark interface with monospace fonts
- 🎨 **Interactive Web Interface** - Responsive calculator with terminal aesthetics
- 🔄 **API Proxy** - Routes calculations to Go backend
- ⌨️ **Keyboard Support** - Full keyboard navigation like a real terminal
- 📊 **Real-time Status** - Backend connection monitoring with terminal-style indicators
- 🏥 **Health Checks** - Frontend and backend health endpoints

### Backend (Go + HTTP)
- ⚡ **Fast Calculations** - Pure Go arithmetic operations  
- 🛡️ **Input Validation** - Type checking and error handling
- 🌐 **CORS Support** - Cross-origin resource sharing
- 📝 **JSON API** - RESTful endpoints with proper responses
- 🔍 **Comprehensive Logging** - Request/response tracking

## 🚀 Quick Start

### Local Development

1. **Start Backend** (Terminal 1):
```bash
cd backend
go run main.go
# Backend running on http://localhost:8080
```

2. **Start Frontend** (Terminal 2):
```bash
cd frontend
npm install
npm start
# Frontend running on http://localhost:3000
```

3. **Open Calculator**: http://localhost:3000

### Using the Calculator

- **Web UI**: Click buttons or use keyboard
- **Direct API**: Make POST requests to `/api/calculate`

```bash
# Via frontend proxy
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"a": 15, "b": 3, "operation": "multiply"}'

# Direct to backend
curl -X POST http://localhost:8080/calculate \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 5, "operation": "add"}'
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests  
```bash
cd backend
go test -v ./...
```

### Integration Tests
```bash
# Start both services, then:
curl -f http://localhost:3000/api/backend-health
```

## 🏗️ Buildkite Pipelines

This repository includes **two pipeline configurations**:

1. **`buildkite-pipeline.yml`** - Full Kubernetes plugin with advanced features
2. **`buildkite-pipeline-simple.yml`** - Simple image syntax for easy setup

### Kubernetes Plugin Pipeline

The advanced pipeline demonstrates **agent-stack-k8s** with multiple container images:

| Step | Container | Purpose |
|------|-----------|---------|
| Frontend Tests | `node:18` | Jest testing |
| Backend Tests | `golang:1.21` | Go unit tests |
| Backend Service | `golang:1.21` | Start API server |
| Frontend Service | `node:18` | Start web server |
| Integration Tests | `golang:1.21` | End-to-end testing |
| Package App | `ubuntu:22.04` | Create deployments |

### Pipeline Features
- ✅ **Parallel Testing** - Frontend/Backend tests run simultaneously
- 🔗 **Service Integration** - Tests full request flow
- 📦 **Artifact Creation** - Deployment packages with metadata
- 🩺 **Health Checking** - Validates all endpoints

### Simple Image Syntax Pipeline

The simplified pipeline uses the new **image syntax** for easier configuration:

```yaml
image: "ubuntu:22.04" # Default for pipeline

steps:
  - label: ":node: Frontend tests"
    command: npm test
    image: "node:18" # Override for this step
```

**Benefits:**
- 🚀 **Quick Setup** - Minimal configuration required
- 📖 **Easy to Read** - Clean, simple syntax
- 🔄 **Migration Friendly** - Easy to convert existing pipelines
- 🏃 **Faster Startup** - Less overhead than Kubernetes pods

See [`PIPELINE_COMPARISON.md`](PIPELINE_COMPARISON.md) for detailed comparison.

## 📡 API Reference

### Backend Endpoints (Go - Port 8080)

#### `POST /calculate`
Perform arithmetic calculations.

**Request:**
```json
{
  "a": 10,
  "b": 5, 
  "operation": "add"
}
```

**Response:**
```json
{
  "result": 15,
  "operation": "add",
  "a": 10,
  "b": 5,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Operations:** `add`, `subtract`, `multiply`, `divide`

#### `GET /health`
Backend health check.

#### `GET /`
API documentation.

### Frontend Endpoints (Node.js - Port 3000)

#### `GET /`
Calculator web interface.

#### `POST /api/calculate`
Proxy to backend calculation service.

#### `GET /health`
Frontend health check.

#### `GET /api/backend-health`
Backend health check via proxy.

## 🐳 Container Support

Ready for containerization:

**Backend Dockerfile:**
```dockerfile
FROM golang:1.21-alpine
WORKDIR /app
COPY . .
RUN go build -o calculator .
EXPOSE 8080
CMD ["./calculator"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Configuration

### Environment Variables

**Frontend:**
- `PORT` - Server port (default: 3000)
- `BACKEND_URL` - Backend API URL (default: http://localhost:8080)

**Backend:**
- Server runs on port 8080 (configurable in source)

## 📊 Architecture Benefits

1. **Separation of Concerns** - UI logic separate from business logic
2. **Language Optimization** - Go for fast calculations, Node.js for web serving  
3. **Independent Scaling** - Scale frontend and backend separately
4. **Technology Flexibility** - Easy to swap out components
5. **Testing Isolation** - Test frontend and backend independently

This demonstrates a modern microservices architecture ready for production deployment with Kubernetes and Buildkite! 🚀
