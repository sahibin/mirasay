// Ses Kontrolleri
let isMusicMuted = false;
let isSoundMuted = false;
const backgroundMusic = document.getElementById('backgroundMusic');
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const gameOverSound = document.getElementById('gameOverSound');

// Ses butonları için event listener'lar
document.getElementById('toggleMusic').addEventListener('click', function() {
    isMusicMuted = !isMusicMuted;
    backgroundMusic.muted = isMusicMuted;
    this.classList.toggle('muted');
    this.querySelector('i').className = isMusicMuted ? 'fas fa-music-slash' : 'fas fa-music';
});

document.getElementById('toggleSound').addEventListener('click', function() {
    isSoundMuted = !isSoundMuted;
    this.classList.toggle('muted');
    this.querySelector('i').className = isSoundMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
});

function playSound(sound) {
    if (!isSoundMuted) {
        sound.currentTime = 0;
        sound.play();
    }
}

// Oyun Değişkenleri
let currentNumber = 100;
let step = 2;
let timeLeft = 15;
let timer;
let isGameActive = false;
let currentScore = 0;

// Oyunu Başlat
function startGame(selectedStep) {
    step = selectedStep;
    currentNumber = 100;
    timeLeft = 15;
    isGameActive = true;
    currentScore = 0;
    
    if (!isMusicMuted) {
        backgroundMusic.play();
    }
    
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    document.getElementById('currentScore').textContent = currentScore;
    document.getElementById('gameTitle').textContent = getStepText(step);
    
    updateDisplay();
    startTimer();
    generateOptions();
}

// Adım metnini al
function getStepText(step) {
    const numberMap = {
        1: 'Birer',
        2: 'İkişer',
        3: 'Üçer',
        4: 'Dörder',
        5: 'Beşer',
        10: 'Onar'
    };
    return `${numberMap[step]} Geri Sayma`;
}

// Cevap kontrolü
function checkAnswer(selected, correct) {
    if (!isGameActive) return;
    
    const buttons = document.querySelectorAll('#options button');
    buttons.forEach(button => {
        const buttonValue = parseInt(button.textContent);
        if (buttonValue === selected) {
            if (selected === correct) {
                button.classList.add('correct');
                playSound(correctSound);
                const points = calculatePoints(timeLeft);
                currentScore += points;
                document.getElementById('currentScore').textContent = currentScore;
                
                // Tüm sayıları gizle
                const optionsContainer = document.getElementById('options');
                optionsContainer.style.opacity = '0';
                optionsContainer.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    if (correct <= 0) {
                        endGame(true);
                    } else {
                        currentNumber = correct;
                        updateDisplay();
                        // Sayıları tamamen gizle ve yeni sayıları hazırla
                        optionsContainer.innerHTML = '';
                        setTimeout(() => {
                            // Yeni sayıları göster
                            generateOptions();
                            optionsContainer.style.opacity = '1';
                            timeLeft = 15;
                        }, 1000);
                    }
                }, 300); // Solma animasyonu için biraz bekle
            } else {
                button.classList.add('wrong');
                playSound(wrongSound);
            }
        }
    });
}

// Oyunu bitir
function endGame(isWin) {
    isGameActive = false;
    clearInterval(timer);
    
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    playSound(gameOverSound);
    
    updateHighScore(step, currentScore);
    
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('endScreen').classList.remove('hidden');
    document.getElementById('finalScore').textContent = currentScore;
    document.getElementById('endTitle').textContent = getStepText(step);
    
    const endMessage = document.getElementById('endMessage');
    endMessage.textContent = isWin 
        ? "Tebrikler! Oyunu başarıyla tamamladın!" 
        : "Süre doldu! Tekrar dene!";
}

// Ana menüye dön
function returnToHome() {
    clearInterval(timer);
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    
    ['gameScreen', 'endScreen', 'scoreScreen'].forEach(screen => {
        document.getElementById(screen).classList.add('hidden');
    });
    document.getElementById('startScreen').classList.remove('hidden');
}

// Seçenekleri oluştur
function generateOptions() {
    const correct = currentNumber - step;
    let options = [correct];
    
    while (options.length < 3) {
        const randomOffset = Math.floor(Math.random() * 10) - 5;
        const newOption = correct + randomOffset;
        if (!options.includes(newOption) && newOption >= 0) {
            options.push(newOption);
        }
    }
    
    options.sort(() => Math.random() - 0.5);
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => checkAnswer(option, correct);
        optionsContainer.appendChild(button);
    });
}

// Puan hesapla
function calculatePoints(timeLeft) {
    const basePoints = 10;
    const timeBonus = timeLeft * 2;
    const difficultyBonus = step * 2;
    return basePoints + timeBonus + difficultyBonus;
}

// Yüksek skoru güncelle
function updateHighScore(step, score) {
    const scores = JSON.parse(localStorage.getItem('scores') || '{}');
    const stepScores = scores[step] || [];
    
    stepScores.push({
        score: score,
        date: new Date().toLocaleDateString('tr-TR')
    });
    
    stepScores.sort((a, b) => b.score - a.score);
    scores[step] = stepScores.slice(0, 5);
    
    localStorage.setItem('scores', JSON.stringify(scores));
}

// Skor tablosunu göster
function showScoreTable() {
    const scores = JSON.parse(localStorage.getItem('scores') || '{}');
    const tableBody = document.getElementById('scoreTableBody');
    tableBody.innerHTML = '';

    [1, 2, 3, 4, 5, 10].forEach(step => {
        const stepScores = scores[step] || [];
        if (stepScores.length > 0) {
            const highestScore = stepScores[0];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${getStepText(step)}</td>
                <td>${highestScore.score}</td>
                <td>${highestScore.date}</td>
            `;
            tableBody.appendChild(row);
        }
    });

    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('scoreScreen').classList.remove('hidden');
}

// Ekranı güncelle
function updateDisplay() {
    document.getElementById('currentNumber').textContent = currentNumber;
    document.getElementById('timeLeft').textContent = timeLeft;
}

// Zamanlayıcıyı başlat
function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

// Oyunu yeniden başlat
function restartGame() {
    startGame(step);
}

// Sayfa yüklendiğinde ses ayarlarını yap
window.addEventListener('load', () => {
    backgroundMusic.volume = 0.3;
    correctSound.volume = 0.5;
    wrongSound.volume = 0.5;
    gameOverSound.volume = 0.5;
});