{\rtf1\ansi\ansicpg1252\cocoartf2865
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const generateBtn = document.getElementById('generateBtn');\
const clearBtn = document.getElementById('clearBtn');\
const resultDiv = document.getElementById('result');\
const historyList = document.getElementById('historyList');\
const minInput = document.getElementById('min');\
const maxInput = document.getElementById('max');\
const countInput = document.getElementById('count');\
\
let history = [];\
\
// Genera numeri casuali\
function generateRandomNumbers() \{\
    const min = parseInt(minInput.value);\
    const max = parseInt(maxInput.value);\
    const count = parseInt(countInput.value);\
    \
    if (min >= max) \{\
        alert('Il numero minimo deve essere inferiore al massimo!');\
        return;\
    \}\
    \
    if (count < 1 || count > 100) \{\
        alert('Inserisci una quantit\'e0 tra 1 e 100!');\
        return;\
    \}\
    \
    const numbers = [];\
    for (let i = 0; i < count; i++) \{\
        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;\
        numbers.push(randomNum);\
    \}\
    \
    displayNumbers(numbers);\
    addToHistory(numbers, min, max);\
\}\
\
// Visualizza numeri generati\
function displayNumbers(numbers) \{\
    resultDiv.innerHTML = '<div class="numbers"></div>';\
    const numbersContainer = resultDiv.querySelector('.numbers');\
    \
    numbers.forEach(num => \{\
        const numberDiv = document.createElement('div');\
        numberDiv.className = 'number';\
        numberDiv.textContent = num;\
        numbersContainer.appendChild(numberDiv);\
    \});\
\}\
\
// Aggiungi alla cronologia\
function addToHistory(numbers, min, max) \{\
    const timestamp = new Date().toLocaleString('it-IT');\
    const historyItem = \{\
        numbers: numbers,\
        range: `$\{min\}-$\{max\}`,\
        time: timestamp\
    \};\
    \
    history.unshift(historyItem);\
    if (history.length > 10) history.pop();\
    \
    updateHistoryDisplay();\
\}\
\
// Aggiorna visualizzazione cronologia\
function updateHistoryDisplay() \{\
    historyList.innerHTML = '';\
    \
    history.forEach(item => \{\
        const itemDiv = document.createElement('div');\
        itemDiv.className = 'history-item';\
        itemDiv.innerHTML = `\
            <strong>$\{item.numbers.join(', ')\}</strong><br>\
            <small>Range: $\{item.range\} | $\{item.time\}</small>\
        `;\
        historyList.appendChild(itemDiv);\
    \});\
\}\
\
// Cancella cronologia\
function clearHistory() \{\
    history = [];\
    historyList.innerHTML = '<p style="text-align: center; color: #999;">Nessuna cronologia</p>';\
\}\
\
// Supporto tastiera (Enter per generare)\
document.addEventListener('keypress', (e) => \{\
    if (e.key === 'Enter') \{\
        generateRandomNumbers();\
    \}\
\});\
\
generateBtn.addEventListener('click', generateRandomNumbers);\
clearBtn.addEventListener('click', clearHistory);\
}