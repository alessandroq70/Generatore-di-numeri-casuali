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
    
    // Validazione input
    if (isNaN(min) || isNaN(max) || isNaN(count)) {
        alert('Inserisci valori numerici validi!');
        return;
    }
    
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
        // ALGORITMO GARANTITO per numeri senza ripetizioni
        numbers = generateUniqueNumbers(min, max, count);
        
        // Verifica finale per sicurezza
        const uniqueCheck = new Set(numbers);
        if (uniqueCheck.size !== numbers.length) {
            console.error('ERRORE: Numeri duplicati rilevati!', numbers);
            // Ripeti la generazione come fallback
            numbers = generateUniqueNumbersSecure(min, max, count);
        }
        
        // Ordina i numeri per lotterie
        numbers.sort((a, b) => a - b);
    } else {
        // Genera numeri con possibili ripetizioni
        for (let i = 0; i < count; i++) {
            const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
            numbers.push(randomNum);
        }
    }
    
    displayNumbers(numbers, unique);
    addToHistory(numbers, min, max, unique);
}

// METODO PRIMARIO: Genera numeri unici senza ripetizioni
function generateUniqueNumbers(min, max, count) {
    const numbers = [];
    const used = new Set(); // Usa Set per tracking più veloce
    
    while (numbers.length < count) {
        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        
        if (!used.has(randomNum)) {
            numbers.push(randomNum);
            used.add(randomNum);
        }
    }
    
    return numbers;
}

// METODO SICURO: Algoritmo alternativo garantito
function generateUniqueNumbersSecure(min, max, count) {
    console.log('Usando algoritmo sicuro di fallback');
    
    // Crea array con tutti i numeri possibili
    const availableNumbers = [];
    for (let i = min; i <= max; i++) {
        availableNumbers.push(i);
    }
    
    // Mescola l'array usando Fisher-Yates
    for (let i = availableNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableNumbers[i], availableNumbers[j]] = [availableNumbers[j], availableNumbers[i]];
    }
    
    // Prendi i primi 'count' elementi
    return availableNumbers.slice(0, count);
}

// Visualizza numeri generati
function displayNumbers(numbers, isUnique) {
    // Debug per verificare unicità
    if (isUnique) {
        const uniqueCheck = new Set(numbers);
        console.log(`Numeri generati: ${numbers.length}, Numeri unici: ${uniqueCheck.size}`);
        console.log('Numeri:', numbers.join(', '));
    }
    
    resultDiv.innerHTML = '<div class="numbers"></div>';
    const numbersContainer = resultDiv.querySelector('.numbers');
    
    // Aggiungi badge se i numeri sono unici
    if (isUnique) {
        const badge = document.createElement('div');
        badge.className = 'unique-badge';
        badge.innerHTML = '✨ Numeri Unici (Nessun Duplicato)';
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
    
    // Verifica finale unicità per cronologia
    let actuallyUnique = isUnique;
    if (isUnique) {
        const uniqueCheck = new Set(numbers);
        actuallyUnique = uniqueCheck.size === numbers.length;
    }
    
    const historyItem = {
        numbers: numbers,
        range: `${min}-${max}`,
        time: timestamp,
        unique: actuallyUnique,
        count: numbers.length
    };
    
    history.unshift(historyItem);
    if (history.length > 10) history.pop();
    
    updateHistoryDisplay();
}

// Aggiorna visualizzazione cronologia
function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    history.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'history-item';
        
        let badges = '';
        if (item.unique) {
            badges += '<span class="history-badge unique-badge-small">UNICI</span>';
        }
        if (item.count > 1) {
            badges += `<span class="history-badge count-badge">${item.count}x</span>`;
        }
        
        itemDiv.innerHTML = `
            <div class="history-content">
                <div class="history-numbers">
                    <strong>${item.numbers.join(', ')}</strong> ${badges}
                </div>
                <small class="history-details">Range: ${item.range} | ${item.time}</small>
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
        generateBtn.textContent = isUnique ? 'Genera 1 Numero Unico' : 'Genera Numero';
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

// Test della console per debugging
console.log('Generatore numeri casuali caricato - versione con debug');

// Inizializza il testo del pulsante
updateButtonText();