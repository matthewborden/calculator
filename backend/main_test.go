package main

import "testing"

func TestBasic(t *testing.T) {
	if 1+1 != 2 {
		t.Error("Math is broken")
	}
}

func TestAdd(t *testing.T) {
	result := Add(2, 3)
	if result != 5 {
		t.Errorf("Add(2, 3) = %f; want 5", result)
	}
}

func TestSubtract(t *testing.T) {
	result := Subtract(5, 3)
	if result != 2 {
		t.Errorf("Subtract(5, 3) = %f; want 2", result)
	}
}

func TestMultiply(t *testing.T) {
	result := Multiply(3, 4)
	if result != 12 {
		t.Errorf("Multiply(3, 4) = %f; want 12", result)
	}
}

func TestDivide(t *testing.T) {
	result, err := Divide(10, 2)
	if err != nil {
		t.Errorf("Divide(10, 2) returned error: %v", err)
	}
	if result != 5 {
		t.Errorf("Divide(10, 2) = %f; want 5", result)
	}
}

func TestDivideByZero(t *testing.T) {
	_, err := Divide(5, 0)
	if err == nil {
		t.Error("Divide(5, 0) should return an error")
	}
}
