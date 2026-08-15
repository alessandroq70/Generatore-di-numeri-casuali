const attackerArmiesInput = document.getElementById('attackerArmies');
const defenderArmiesInput = document.getElementById('defenderArmies');
const rollBattleBtn = document.getElementById('rollBattleBtn');
const resetBattleBtn = document.getElementById('resetBattleBtn');
const battleResult = document.getElementById('battleResult');

let battle = null;

// Selezione rapida delle armate tramite bottoni 1-10 e +1/-1
function setupArmySelector(inputId) {
    const input = document.getElementById(inputId);
    const group = input.closest('.army-group');

    group.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            input.value = btn.dataset.value;
        });
    });

    group.querySelectorAll('.adjust-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const delta = parseInt(btn.dataset.delta, 10);
            const min = parseInt(input.min, 10) || 1;
            let current = parseInt(input.value, 10);
            if (isNaN(current)) current = min;
            input.value = Math.max(min, current + delta);
        });
    });
}

setupArmySelector('attackerArmies');
setupArmySelector('defenderArmies');

function setArmySelectorsEnabled(enabled) {
    document.querySelectorAll('.quick-btn, .adjust-btn').forEach(btn => {
        btn.disabled = !enabled;
    });
}

// Lancia n dadi a 6 facce, ordinati dal più alto al più basso
function rollDice(n) {
    const dice = [];
    for (let i = 0; i < n; i++) {
        dice.push(Math.floor(Math.random() * 6) + 1);
    }
    return dice.sort((a, b) => b - a);
}

function initBattle() {
    const attacker = parseInt(attackerArmiesInput.value);
    const defender = parseInt(defenderArmiesInput.value);

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

    attackerArmiesInput.disabled = true;
    defenderArmiesInput.disabled = true;
    setArmySelectorsEnabled(false);

    return { attacker, defender };
}

function playBattleRound() {
    if (!battle) {
        battle = initBattle();
        if (!battle) return;
    }

    // Regole Risiko (variante casa): attaccante fino a 3 dadi (max armate-1), difensore fino a 3 dadi (max armate)
    const attackDiceCount = Math.min(3, battle.attacker - 1);
    const defenseDiceCount = Math.min(3, battle.defender);

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

    battle.attacker -= attackerLosses;
    battle.defender -= defenderLosses;

    let finalMessage = null;
    let battleEnded = false;
    if (battle.defender <= 0) {
        finalMessage = '🏆 Il difensore è stato sconfitto! Territorio conquistato!';
        battleEnded = true;
    } else if (battle.attacker < 2) {
        finalMessage = "🛡️ L'attaccante non ha più armate sufficienti per continuare l'attacco!";
        battleEnded = true;
    }

    displayBattleRound(attackDice, defenseDice, attackerLosses, defenderLosses, finalMessage);

    if (battleEnded) {
        endBattle();
    }
}

// Aggiorna le armate rimaste sui campi di input per preparare l'attacco successivo
function endBattle() {
    attackerArmiesInput.value = Math.max(battle.attacker, 0);
    defenderArmiesInput.value = Math.max(battle.defender, 0);
    attackerArmiesInput.disabled = false;
    defenderArmiesInput.disabled = false;
    setArmySelectorsEnabled(true);
    battle = null;
}

function displayBattleRound(attackDice, defenseDice, attackerLosses, defenderLosses, finalMessage) {
    battleResult.innerHTML = `
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
            <span>⚔️ Attaccante: <strong>${Math.max(battle.attacker, 0)}</strong></span>
            <span>🛡️ Difensore: <strong>${Math.max(battle.defender, 0)}</strong></span>
        </div>
        ${finalMessage ? `<p class="battle-final-message">${finalMessage}</p>` : ''}
    `;
}

function resetBattle() {
    battle = null;
    attackerArmiesInput.disabled = false;
    defenderArmiesInput.disabled = false;
    setArmySelectorsEnabled(true);
    battleResult.innerHTML = '<p>Imposta le armate e inizia la battaglia</p>';
}

rollBattleBtn.addEventListener('click', playBattleRound);
resetBattleBtn.addEventListener('click', resetBattle);
