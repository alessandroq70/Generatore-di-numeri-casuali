const attackerArmiesInput = document.getElementById('attackerArmies');
const defenderArmiesInput = document.getElementById('defenderArmies');
const rollBattleBtn = document.getElementById('rollBattleBtn');
const autoBattleBtn = document.getElementById('autoBattleBtn');
const resetBattleBtn = document.getElementById('resetBattleBtn');
const battleResult = document.getElementById('battleResult');
const logBtn = document.getElementById('logBtn');
const battleLogPanel = document.getElementById('battleLogPanel');
const battleLogList = document.getElementById('battleLogList');

const AUTO_ROUND_DELAY_MS = 450;

// Cronologia di tutti i round giocati nella battaglia corrente
let battleLog = [];

function logRound(round) {
    battleLog.push(round);
    renderBattleLog();
}

function renderBattleLog() {
    if (battleLog.length === 0) {
        battleLogList.innerHTML = '<p class="log-entry-empty">Nessun round giocato ancora</p>';
    } else {
        battleLogList.innerHTML = battleLog.map((round, index) => `
            <div class="log-entry">
                Round ${index + 1}: ⚔️ [${round.attackDice.join(', ')}] vs 🛡️ [${round.defenseDice.join(', ')}]
                → Attacc. −${round.attackerLosses} / Dif. −${round.defenderLosses}
                (rimaste ${round.attackerRemaining}/${round.defenderRemaining})
            </div>
        `).join('');
    }

    scrollLogToLatest();
}

// Se il pannello e' visibile, scorre automaticamente all'ultima giocata
// (utile mentre "Auto" sta ancora giocando round su round)
function scrollLogToLatest() {
    if (!battleLogPanel.hidden) {
        battleLogPanel.scrollTop = battleLogPanel.scrollHeight;
    }
}

function clearBattleLog() {
    battleLog = [];
    battleLogPanel.hidden = true;
    renderBattleLog();
}

logBtn.addEventListener('click', () => {
    battleLogPanel.hidden = !battleLogPanel.hidden;
    scrollLogToLatest();
});

renderBattleLog();

// Ultimi valori inseriti manualmente dall'utente (non dai round di battaglia),
// usati da "Reset" per ripristinare la situazione di partenza voluta
let lastManualAttacker = parseInt(attackerArmiesInput.value, 10) || 5;
let lastManualDefender = parseInt(defenderArmiesInput.value, 10) || 3;

function captureManualInput() {
    const attacker = parseInt(attackerArmiesInput.value, 10);
    const defender = parseInt(defenderArmiesInput.value, 10);
    if (!isNaN(attacker)) lastManualAttacker = attacker;
    if (!isNaN(defender)) lastManualDefender = defender;
}

// Mostra nel bottone Reset il rapporto attaccante:difensore attualmente impostato
function updateRatioLabel() {
    const attacker = parseInt(attackerArmiesInput.value, 10);
    const defender = parseInt(defenderArmiesInput.value, 10);

    if (isNaN(attacker) || isNaN(defender) || defender <= 0) {
        resetBattleBtn.textContent = 'Reset';
        return;
    }

    const ratio = (attacker / defender).toFixed(1);
    resetBattleBtn.textContent = `Reset · 📊 Rapporto attuale: ${ratio}:1`;
}

// Selezione rapida delle armate tramite bottoni 1-10 e +1/-1
function setupArmySelector(inputId) {
    const input = document.getElementById(inputId);
    const group = input.closest('.army-group');

    group.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            input.value = btn.dataset.value;
            captureManualInput();
            updateRatioLabel();
        });
    });

    group.querySelectorAll('.adjust-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const delta = parseInt(btn.dataset.delta, 10);
            const min = parseInt(input.min, 10) || 1;
            let current = parseInt(input.value, 10);
            if (isNaN(current)) current = min;
            input.value = Math.max(min, current + delta);
            captureManualInput();
            updateRatioLabel();
        });
    });

    input.addEventListener('input', () => {
        captureManualInput();
        updateRatioLabel();
    });
}

setupArmySelector('attackerArmies');
setupArmySelector('defenderArmies');

// Lancia n dadi a 6 facce, ordinati dal più alto al più basso
function rollDice(n) {
    const dice = [];
    for (let i = 0; i < n; i++) {
        dice.push(Math.floor(Math.random() * 6) + 1);
    }
    return dice.sort((a, b) => b - a);
}

function readArmies() {
    const attacker = parseInt(attackerArmiesInput.value, 10);
    const defender = parseInt(defenderArmiesInput.value, 10);

    if (isNaN(attacker) || isNaN(defender)) {
        alert('Inserisci valori numerici validi!');
        return null;
    }

    if (attacker < 2) {
        alert("L'attaccante deve avere almeno 2 armate (ne serve sempre 1 di riserva)!");
        return null;
    }

    if (defender < 1) {
        alert('Il difensore deve avere almeno 1 armata!');
        return null;
    }

    return { attacker, defender };
}

// Simula un singolo round di combattimento (regole Risiko, variante casa:
// attaccante fino a 3 dadi, difensore fino a 3 dadi se ha almeno 3 armate)
function simulateRound(attacker, defender) {
    const attackDiceCount = Math.min(3, attacker - 1);
    const defenseDiceCount = Math.min(3, defender);

    const attackDice = rollDice(attackDiceCount);
    const defenseDice = rollDice(defenseDiceCount);

    const comparisons = Math.min(attackDice.length, defenseDice.length);
    let attackerLosses = 0;
    let defenderLosses = 0;

    for (let i = 0; i < comparisons; i++) {
        // In caso di parità vince il difensore
        if (attackDice[i] > defenseDice[i]) {
            defenderLosses++;
        } else {
            attackerLosses++;
        }
    }

    return {
        attackDice,
        defenseDice,
        attackerLosses,
        defenderLosses,
        attackerRemaining: Math.max(attacker - attackerLosses, 0),
        defenderRemaining: Math.max(defender - defenderLosses, 0)
    };
}

// Determina se la battaglia deve fermarsi e con quale messaggio
function getBattleOutcome(attackerRemaining, defenderRemaining) {
    if (defenderRemaining <= 0) {
        return { stop: true, finalMessage: '🏆 Il difensore è stato sconfitto! Territorio conquistato!', finalType: 'victory' };
    }
    if (attackerRemaining < 2) {
        return { stop: true, finalMessage: "🛡️ L'attaccante non ha più armate sufficienti per continuare l'attacco!", finalType: 'halt' };
    }
    if (attackerRemaining <= defenderRemaining) {
        return { stop: true, finalMessage: '⚖️ L\'attaccante non è più in vantaggio numerico: battaglia fermata automaticamente.', finalType: 'parity' };
    }
    return { stop: false, finalMessage: null, finalType: null };
}

function setBattleControlsEnabled(enabled) {
    rollBattleBtn.disabled = !enabled;
    autoBattleBtn.disabled = !enabled;
    resetBattleBtn.disabled = !enabled;
    attackerArmiesInput.disabled = !enabled;
    defenderArmiesInput.disabled = !enabled;
    document.querySelectorAll('.quick-btn, .adjust-btn').forEach(btn => {
        btn.disabled = !enabled;
    });
}

function playBattleRound() {
    const armies = readArmies();
    if (!armies) return;

    const round = simulateRound(armies.attacker, armies.defender);
    logRound(round);

    // Aggiorna subito i campi con le armate rimaste, cosi' restano modificabili
    // (es. il difensore puo' decidere di difendere con meno armate al round successivo)
    attackerArmiesInput.value = round.attackerRemaining;
    defenderArmiesInput.value = round.defenderRemaining;
    updateRatioLabel();

    // Il singolo tiro manuale si ferma solo per vittoria/mancanza di armate,
    // non per la parita' (quella riguarda solo la modalita' Auto)
    let finalMessage = null;
    let finalType = null;
    if (round.defenderRemaining <= 0) {
        finalMessage = '🏆 Il difensore è stato sconfitto! Territorio conquistato!';
        finalType = 'victory';
    } else if (round.attackerRemaining < 2) {
        finalMessage = "🛡️ L'attaccante non ha più armate sufficienti per continuare l'attacco!";
        finalType = 'halt';
    }

    displayBattleRound(round, finalMessage, finalType);
}

// Tira i dadi automaticamente fino alla conquista, alla mancanza di armate
// dell'attaccante, oppure fino a quando le armate sono in parita'
function autoBattle() {
    const armies = readArmies();
    if (!armies) return;

    setBattleControlsEnabled(false);

    let attacker = armies.attacker;
    let defender = armies.defender;

    function step() {
        const round = simulateRound(attacker, defender);
        logRound(round);
        attacker = round.attackerRemaining;
        defender = round.defenderRemaining;

        attackerArmiesInput.value = attacker;
        defenderArmiesInput.value = defender;
        updateRatioLabel();

        const outcome = getBattleOutcome(attacker, defender);
        displayBattleRound(round, outcome.finalMessage, outcome.finalType);

        if (outcome.stop) {
            setBattleControlsEnabled(true);
        } else {
            setTimeout(step, AUTO_ROUND_DELAY_MS);
        }
    }

    step();
}

// Separa l'emoji iniziale dal testo per mostrarla piu' grande nel banner finale
function renderFinalBanner(message, type) {
    if (!message) return '';
    const [icon, ...rest] = message.split(' ');
    return `
        <div class="battle-final-message ${type}">
            <span class="final-icon">${icon}</span>
            <span class="final-text">${rest.join(' ')}</span>
        </div>
    `;
}

function displayBattleRound(round, finalMessage, finalType) {
    const { attackDice, defenseDice, attackerLosses, defenderLosses, attackerRemaining, defenderRemaining } = round;
    battleResult.innerHTML = `
        ${renderFinalBanner(finalMessage, finalType)}
        <div class="dice-row">
            <div class="dice-group">
                <strong>⚔️ Attaccante</strong>
                <div class="dice">${attackDice.map(d => `<span class="die attack-die">${d}</span>`).join('')}</div>
            </div>
            <div class="dice-group">
                <strong>🛡️ Difensore</strong>
                <div class="dice">${defenseDice.map(d => `<span class="die defense-die">${d}</span>`).join('')}</div>
            </div>
        </div>
        <ul class="round-outcome-list">
            <li class="attacker-loss">⚔️ Attaccante perde <strong>${attackerLosses}</strong> armat${attackerLosses === 1 ? 'a' : 'e'}</li>
            <li class="defender-loss">🛡️ Difensore perde <strong>${defenderLosses}</strong> armat${defenderLosses === 1 ? 'a' : 'e'}</li>
        </ul>
        <div class="armies-status">
            <span>⚔️ Attaccante: <strong>${attackerRemaining}</strong></span>
            <span>🛡️ Difensore: <strong>${defenderRemaining}</strong></span>
        </div>
    `;
}

function resetBattle() {
    attackerArmiesInput.value = lastManualAttacker;
    defenderArmiesInput.value = lastManualDefender;
    battleResult.innerHTML = '<p>Imposta le armate e inizia la battaglia</p>';
    updateRatioLabel();
    clearBattleLog();
}

rollBattleBtn.addEventListener('click', playBattleRound);
autoBattleBtn.addEventListener('click', autoBattle);
resetBattleBtn.addEventListener('click', resetBattle);

updateRatioLabel();
