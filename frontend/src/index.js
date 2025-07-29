// Calculator logic for the frontend web app

class Calculator {
  constructor() {
    this.display = document.getElementById('display');
    this.currentInput = '0';
    this.previousInput = null;
    this.operation = null;
    this.waitingForNewInput = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Number buttons
    document.querySelectorAll('.number').forEach(button => {
      button.addEventListener('click', () => this.inputNumber(button.textContent));
    });

    // Operation buttons
    document.querySelectorAll('.operation').forEach(button => {
      button.addEventListener('click', () => this.inputOperation(button.dataset.operation));
    });

    // Equals button
    document.getElementById('equals').addEventListener('click', () => this.calculate());

    // Clear button
    document.getElementById('clear').addEventListener('click', () => this.clear());

    // Decimal button
    document.getElementById('decimal').addEventListener('click', () => this.inputDecimal());

    // Keyboard support
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  inputNumber(num) {
    if (this.waitingForNewInput) {
      this.currentInput = num;
      this.waitingForNewInput = false;
    } else {
      this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
    }
    this.updateDisplay();
  }

  inputOperation(nextOperation) {
    const inputValue = parseFloat(this.currentInput);

    if (this.previousInput === null) {
      this.previousInput = inputValue;
    } else if (this.operation) {
      const currentValue = this.previousInput || 0;
      this.performCalculation(currentValue, inputValue, this.operation);
    }

    this.waitingForNewInput = true;
    this.operation = nextOperation;
  }

  inputDecimal() {
    if (this.waitingForNewInput) {
      this.currentInput = '0.';
      this.waitingForNewInput = false;
    } else if (this.currentInput.indexOf('.') === -1) {
      this.currentInput += '.';
    }
    this.updateDisplay();
  }

  clear() {
    this.currentInput = '0';
    this.previousInput = null;
    this.operation = null;
    this.waitingForNewInput = false;
    this.updateDisplay();
  }

  calculate() {
    const inputValue = parseFloat(this.currentInput);
    
    if (this.previousInput !== null && this.operation) {
      this.performCalculation(this.previousInput, inputValue, this.operation);
      this.operation = null;
      this.previousInput = null;
      this.waitingForNewInput = true;
    }
  }

  async performCalculation(firstOperand, secondOperand, operation) {
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          a: firstOperand,
          b: secondOperand,
          operation: operation
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        this.currentInput = data.result.toString();
        this.previousInput = data.result;
      } else {
        this.currentInput = 'Error';
        console.error('Calculation error:', data.error);
      }
    } catch (error) {
      this.currentInput = 'Error';
      console.error('Network error:', error);
    }
    
    this.updateDisplay();
  }

  handleKeyboard(e) {
    if (e.key >= '0' && e.key <= '9') {
      this.inputNumber(e.key);
    } else if (e.key === '.') {
      this.inputDecimal();
    } else if (e.key === '+') {
      this.inputOperation('add');
    } else if (e.key === '-') {
      this.inputOperation('subtract');
    } else if (e.key === '*') {
      this.inputOperation('multiply');
    } else if (e.key === '/') {
      e.preventDefault();
      this.inputOperation('divide');
    } else if (e.key === 'Enter' || e.key === '=') {
      this.calculate();
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
      this.clear();
    }
  }

  updateDisplay() {
    this.display.textContent = this.currentInput;
  }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Calculator();
});

// Export for testing (Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Calculator };
}
