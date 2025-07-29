package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type CalculationRequest struct {
	A         float64 `json:"a"`
	B         float64 `json:"b"`
	Operation string  `json:"operation"`
}

type CalculationResponse struct {
	Result    float64 `json:"result"`
	Operation string  `json:"operation"`
	A         float64 `json:"a"`
	B         float64 `json:"b"`
	Error     string  `json:"error,omitempty"`
	Timestamp string  `json:"timestamp"`
}

type HealthResponse struct {
	Status    string `json:"status"`
	Service   string `json:"service"`
	Version   string `json:"version"`
	Timestamp string `json:"timestamp"`
}

func Add(a, b float64) float64 {
	return a + b
}

func Subtract(a, b float64) float64 {
	return a - b
}

func Multiply(a, b float64) float64 {
	return a * b
}

func Divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, fmt.Errorf("division by zero")
	}
	return a / b, nil
}

// CORS middleware
func enableCORS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
}

func calculateHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	
	if r.Method == "OPTIONS" {
		return
	}
	
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req CalculationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid JSON format",
		})
		return
	}

	var result float64
	var calcError error

	switch req.Operation {
	case "add":
		result = Add(req.A, req.B)
	case "subtract":
		result = Subtract(req.A, req.B)
	case "multiply":
		result = Multiply(req.A, req.B)
	case "divide":
		result, calcError = Divide(req.A, req.B)
	default:
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid operation. Supported operations: add, subtract, multiply, divide",
		})
		return
	}

	response := CalculationResponse{
		Result:    result,
		Operation: req.Operation,
		A:         req.A,
		B:         req.B,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}
	
	if calcError != nil {
		w.WriteHeader(http.StatusBadRequest)
		response.Error = calcError.Error()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	
	if r.Method == "OPTIONS" {
		return
	}

	response := HealthResponse{
		Status:    "OK",
		Service:   "calculator-backend",
		Version:   "1.0.0",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	
	if r.Method == "OPTIONS" {
		return
	}

	response := map[string]interface{}{
		"service": "Calculator Backend API",
		"version": "1.0.0",
		"endpoints": map[string]string{
			"POST /calculate": "Perform calculations",
			"GET /health":     "Health check",
		},
		"example": map[string]interface{}{
			"url":    "/calculate",
			"method": "POST",
			"body": map[string]interface{}{
				"a":         10,
				"b":         5,
				"operation": "add",
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	http.HandleFunc("/", rootHandler)
	http.HandleFunc("/calculate", calculateHandler)
	http.HandleFunc("/health", healthHandler)
	
	fmt.Println("🧮 Calculator Backend API server starting on :8080")
	fmt.Println("📋 Available endpoints:")
	fmt.Println("   POST /calculate - Perform calculations")
	fmt.Println("   GET  /health    - Health check")
	fmt.Println("   GET  /          - API documentation")
	
	log.Fatal(http.ListenAndServe(":8081", nil))
}
