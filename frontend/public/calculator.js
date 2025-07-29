// Frontend Calculator - All calculations done on Go backend

class Calculator {
  constructor() {
    this.display = document.getElementById('display');
    this.currentInput = '0';
    this.previousInput = null;
    this.operation = null;
    this.waitingForNewInput = false;
    this.setupEventListeners();
    this.checkBackendHealth();
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

  async checkBackendHealth() {
    const statusElement = document.getElementById('backend-status');
    const indicator = statusElement.querySelector('.status-indicator');
    
    try {
      const response = await fetch('/api/backend-health');
      const data = await response.json();
      
      if (response.ok && data.status === 'OK') {
        indicator.className = 'status-indicator status-ok';
        statusElement.innerHTML = `
          <span class="status-indicator status-ok"></span>
          ✅ Backend connected - Go service running
        `;
      } else {
        throw new Error('Backend not healthy');
      }
    } catch (error) {
      indicator.className = 'status-indicator status-error';
      statusElement.innerHTML = `
        <span class="status-indicator status-error"></span>
        ❌ Backend disconnected - Start Go service on :8080
      `;
    }
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

  async inputOperation(nextOperation) {
    const inputValue = parseFloat(this.currentInput);

    if (this.previousInput === null) {
      this.previousInput = inputValue;
    } else if (this.operation) {
      const currentValue = this.previousInput || 0;
      await this.performCalculation(currentValue, inputValue, this.operation);
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

  async calculate() {
    const inputValue = parseFloat(this.currentInput);
    
    if (this.previousInput !== null && this.operation) {
      await this.performCalculation(this.previousInput, inputValue, this.operation);
      this.operation = null;
      this.previousInput = null;
      this.waitingForNewInput = true;
    }
  }

  async performCalculation(firstOperand, secondOperand, operation) {
    try {
      console.log(`Calculating: ${firstOperand} ${operation} ${secondOperand}`);
      
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
      console.log('Backend response:', data);
      
      if (response.ok && !data.error) {
        this.currentInput = data.result.toString();
        this.previousInput = data.result;
        console.log(`Result: ${data.result}`);
      } else {
        this.currentInput = 'Error';
        console.error('Calculation error:', data.error);
        
        // Show error in status
        const statusElement = document.getElementById('backend-status');
        statusElement.innerHTML = `
          <span class="status-indicator status-error"></span>
          ❌ ${data.error || 'Calculation failed'}
        `;
        
        // Reset status after 3 seconds
        setTimeout(() => this.checkBackendHealth(), 3000);
      }
    } catch (error) {
      this.currentInput = 'Error';
      console.error('Network error:', error);
      
      // Show network error in status
      const statusElement = document.getElementById('backend-status');
      statusElement.innerHTML = `
        <span class="status-indicator status-error"></span>
        ❌ Network error - Check backend connection
      `;
      
      // Reset status after 3 seconds
      setTimeout(() => this.checkBackendHealth(), 3000);
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
    this.display.value = this.currentInput;
  }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Calculator();
});

// Test function for manual API testing
async function testAPI() {
  try {
    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: 10, b: 5, operation: 'add' })
    });
    const data = await response.json();
    console.log('API Test Result:', data);
  } catch (error) {
    console.error('API Test Failed:', error);
  }
}

// Expose test function globally
window.testAPI = testAPI;
