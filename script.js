const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const resultDiv = document.getElementById('result');
const historyList = document.getElementById('historyList');
const minInput = document.getElementById('min');
const maxInput = document.getElementById('max');
const countInput = document.getElementById('count');
const uniqueCheckbox = document.getElementById('uniqueNumbers');

let history = [];

// Genera numeri casuali
function generateRandomNumbers() {
    const min = parseInt(minInput.value);
    const max = parseInt(maxInput.value);
    const count = parseInt(countInput.value);
    const unique = uniqueCheckbox.checked;
    
    if (min >= max) {
        alert('Il numero minimo deve essere inferiore al massimo!');
        return;
    }
    
    if (count < 1 || count > 1000) {
        alert('Inserisci una quantità tra 1 e 1000!');
        return;
    }
    
    // Controllo per numeri unici
    const availableNumbers = max - min + 1;
    if (unique && count > availableNumbers) {
        alert(`Impossibile generare ${count} numeri unici nel range ${min}-${max}!\nMassimo possibile: ${availableNumbers}`);
        return;
    }
    
    let numbers = [];
    
    if (unique) {
        // Genera numeri senza ripetizioni
        numbers = generateUniqueNumbers(min, max, count);
    } else {
        // Genera numeri con possibili ripetizioni (comportamento originale)
        for (let i = 0; i < count; i++) {
            const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
            numbers.push(randomNum);
        }
    }
    
    // Ordina i numeri se sono unici (utile per lotterie)
    if (unique && numbers.length > 1) {
        numbers.sort((a, b) => a - b);
    }
    
    displayNumbers(numbers, unique);
    addToHistory(numbers, min, max, unique);
}

// Genera numeri unici senza ripetizioni
function generateUniqueNumbers(min, max, count) {
    const numbers = [];
    const availableNumbers = [];
    
    // Crea array con tutti i numeri possibili
    for (let i = min; i <= max; i++) {
        availableNumbers.push(i);
    }
    
    // Fisher-Yates shuffle per selezione casuale efficiente
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        numbers.push(availableNumbers[randomIndex]);
        availableNumbers.splice(randomIndex, 1);
    }
    
    return numbers;
}

// Visualizza numeri generati
function displayNumbers(numbers, isUnique) {
    resultDiv.innerHTML = '<div class="numbers"></div>';
    const numbersContainer = resultDiv.querySelector('.numbers');
    
    // Aggiungi badge se i numeri sono unici
    if (isUnique && numbers.length > 1) {
        const badge = document.createElement('div');
        badge.className = 'unique-badge';
        badge.innerHTML = '✨ Numeri Unici';
        resultDiv.insertBefore(badge, numbersContainer);
    }
    
    numbers.forEach((num, index) => {
        const numberDiv = document.createElement('div');
        numberDiv.className = 'number';
        if (isUnique) numberDiv.classList.add('unique');
        numberDiv.textContent = num;
        
        // Animazione con delay per effetto cascata
        numberDiv.style.animationDelay = `${index * 0.1}s`;
        numbersContainer.appendChild(numberDiv);
    });
}

// Aggiungi alla cronologia
function addToHistory(numbers, min, max, isUnique) {
    const timestamp = new Date().toLocaleString('it-IT');
    const historyItem = {
        numbers: numbers,
        range: `${min}-${max}`,
        time: timestamp,
        unique: isUnique
    };
    
    history.unshift(historyItem);
    if (history.length > 10) history.pop();
    
    updateHistoryDisplay();
}

// Aggiorna visualizzazione cronologia
function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    history.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'history-item';
        
        const uniqueBadge = item.unique ? '<span class="history-badge">UNICI</span>' : '';
        itemDiv.innerHTML = `
            <div class="history-content">
                <strong>${item.numbers.join(', ')}</strong> ${uniqueBadge}<br>
                <small>Range: ${item.range} | ${item.time}</small>
            </div>
        `;
        historyList.appendChild(itemDiv);
    });
}

// Cancella cronologia
function clearHistory() {
    history = [];
    historyList.innerHTML = '<p style="text-align: center; color: #999;">Nessuna cronologia</p>';
}

// Aggiorna il testo del pulsante in base alla modalità
function updateButtonText() {
    const count = parseInt(countInput.value) || 1;
    const isUnique = uniqueCheckbox.checked;
    
    if (count === 1) {
        generateBtn.textContent = 'Genera Numero';
    } else {
        if (isUnique) {
            generateBtn.textContent = `Genera ${count} Numeri Unici`;
        } else {
            generateBtn.textContent = `Genera ${count} Numeri`;
        }
    }
}

// Event listeners
generateBtn.addEventListener('click', generateRandomNumbers);
clearBtn.addEventListener('click', clearHistory);
countInput.addEventListener('input', updateButtonText);
uniqueCheckbox.addEventListener('change', updateButtonText);

// Supporto tastiera (Enter per generare)
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateRandomNumbers();
    }
});

// Inizializza il testo del pulsante
updateButtonText();