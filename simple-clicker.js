// Game state
let cookies = 0;
let cookiesPerSecond = 0;
let totalCookiesClicked = 0;
let lastUpdateTime = Date.now();

// Upgrades data
const upgrades = {
    cursor: { name: "Cursor", cost: 50, cps: 0.1, owned: 0, element: null },
    grandma: { name: "Grandma", cost: 100, cps: 1, owned: 0, element: null },
    farm: { name: "Farm", cost: 500, cps: 5, owned: 0, element: null },
    mine: { name: "Mine", cost: 1000, cps: 10, owned: 0, element: null },
    factory: { name: "Factory", cost: 5000, cps: 50, owned: 0, element: null }
};

// Achievements
const achievements = [
    { id: 'click-10', name: 'First Clicks', description: 'Click the cookie 10 times', threshold: 10, achieved: false },
    { id: 'click-100', name: 'Hundred Clicks', description: 'Click the cookie 100 times', threshold: 100, achieved: false },
    { id: 'click-1000', name: 'Cookie Master', description: 'Click the cookie 1000 times', threshold: 1000, achieved: false },
    { id: 'earn-100', name: 'Small Bakery', description: 'Earn 100 cookies', threshold: 100, achieved: false },
    { id: 'earn-1000', name: 'Cookie Factory', description: 'Earn 1,000 cookies', threshold: 1000, achieved: false },
    { id: 'earn-10000', name: 'Cookie Empire', description: 'Earn 10,000 cookies', threshold: 10000, achieved: false },
    { id: 'cps-10', name: 'Mass Production', description: 'Reach 10 cookies per second', threshold: 10, achieved: false },
    { id: 'cps-100', name: 'Industrial Scale', description: 'Reach 100 cookies per second', threshold: 100, achieved: false }
];

// DOM elements
let cookieElement;
let counterElement;
let cpsElement;
let upgradesContainer;
let statsContainer;
let upgradeCountsElement;
let achievementsElement;

// Initialize the game
function init() {
    createUI();
    loadGame();
    requestAnimationFrame(gameLoop);
}

// Create all UI elements
function createUI() {
    // Main container
    const gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    document.body.appendChild(gameContainer);
    
    // Apply styles
    applyStyles();
    
    // Title
    const title = document.createElement('h1');
    title.textContent = 'Cookie Clicker';
    gameContainer.appendChild(title);
    
    // Counter
    counterElement = document.createElement('div');
    counterElement.id = 'counter';
    gameContainer.appendChild(counterElement);
    
    // CPS display
    cpsElement = document.createElement('div');
    cpsElement.id = 'cookies-per-second';
    gameContainer.appendChild(cpsElement);
    
    // Cookie
    cookieElement = document.createElement('img');
    cookieElement.id = 'cookie';
    cookieElement.src = 'https://cdn.pixabay.com/photo/2014/04/03/00/41/cookie-309171_960_720.png';
    cookieElement.alt = 'Cookie';
    gameContainer.appendChild(cookieElement);
    
    // Upgrades container
    upgradesContainer = document.createElement('div');
    upgradesContainer.id = 'upgrades';
    gameContainer.appendChild(upgradesContainer);
    
    // Create upgrade buttons
    for (const [id, upgrade] of Object.entries(upgrades)) {
        const button = document.createElement('button');
        button.className = 'upgrade';
        button.id = id;
        button.onclick = () => buyUpgrade(id);
        upgrades[id].element = button;
        upgradesContainer.appendChild(button);
    }
    
    // Stats container
    statsContainer = document.createElement('div');
    statsContainer.id = 'stats';
    gameContainer.appendChild(statsContainer);
    
    // Stats title
    const statsTitle = document.createElement('h3');
    statsTitle.textContent = 'Stats';
    statsContainer.appendChild(statsTitle);
    
    // Upgrade counts
    upgradeCountsElement = document.createElement('div');
    upgradeCountsElement.id = 'upgrade-counts';
    statsContainer.appendChild(upgradeCountsElement);
    
    // Achievements
    achievementsElement = document.createElement('div');
    achievementsElement.id = 'achievements';
    statsContainer.appendChild(achievementsElement);
    
    // Add click event to cookie
    cookieElement.addEventListener('click', () => {
        cookies += 1;
        totalCookiesClicked += 1;
        checkAchievements();
        updateUI();
    });
}

// Apply CSS styles
function applyStyles() {
    const style = document.createElement('style');
    style.textContent = `
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        
        #game-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        #cookie {
            width: 200px;
            height: 200px;
            cursor: pointer;
            transition: transform 0.1s;
            margin: 20px auto;
        }
        
        #cookie:active {
            transform: scale(0.95);
        }
        
        #counter {
            font-size: 24px;
            margin: 20px 0;
        }
        
        #upgrades {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
        }
        
        .upgrade {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .upgrade:hover {
            background-color: #45a049;
        }
        
        .upgrade:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        
        #stats {
            margin-top: 20px;
            text-align: left;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
        
        .achievement {
            background-color: gold;
            padding: 5px 10px;
            border-radius: 5px;
            margin: 5px 0;
            display: inline-block;
        }
    `;
    document.head.appendChild(style);
}

// Main game loop
function gameLoop() {
    const now = Date.now();
    const deltaTime = (now - lastUpdateTime) / 1000; // Convert to seconds
    lastUpdateTime = now;
    
    cookies += cookiesPerSecond * deltaTime;
    checkAchievements();
    updateUI();
    saveGame();
    
    requestAnimationFrame(gameLoop);
}

// Buy upgrade function
function buyUpgrade(upgradeId) {
    const upgrade = upgrades[upgradeId];
    
    if (cookies >= upgrade.cost) {
        cookies -= upgrade.cost;
        upgrade.owned += 1;
        upgrade.cost = Math.floor(upgrade.cost * 1.15); // Increase cost by 15%
        cookiesPerSecond += upgrade.cps;
        
        updateUI();
        saveGame();
    }
}

// Update the UI
function updateUI() {
    counterElement.textContent = `Cookies: ${Math.floor(cookies)}`;
    cpsElement.textContent = `Cookies per second: ${cookiesPerSecond.toFixed(1)}`;
    
    // Update upgrade buttons
    for (const [id, upgrade] of Object.entries(upgrades)) {
        upgrade.element.innerHTML = `${upgrade.name} (${Math.floor(upgrade.cost)} cookies)<br>+${upgrade.cps} cookies per second`;
        upgrade.element.disabled = cookies < upgrade.cost;
    }
    
    // Update upgrade counts
    let upgradeCountsHTML = '<h4>Upgrades</h4>';
    for (const [id, upgrade] of Object.entries(upgrades)) {
        if (upgrade.owned > 0) {
            upgradeCountsHTML += `<p>${upgrade.name}: ${upgrade.owned}</p>`;
        }
    }
    upgradeCountsElement.innerHTML = upgradeCountsHTML;
}

// Check for achievements
function checkAchievements() {
    let newAchievements = false;
    
    for (const achievement of achievements) {
        if (!achievement.achieved) {
            let conditionMet = false;
            
            if (achievement.id.startsWith('click-')) {
                conditionMet = totalCookiesClicked >= achievement.threshold;
            } else if (achievement.id.startsWith('earn-')) {
                conditionMet = cookies >= achievement.threshold;
            } else if (achievement.id.startsWith('cps-')) {
                conditionMet = cookiesPerSecond >= achievement.threshold;
            }
            
            if (conditionMet) {
                achievement.achieved = true;
                newAchievements = true;
            }
        }
    }
    
    if (newAchievements) {
        displayAchievements();
    }
}

// Display achieved achievements
function displayAchievements() {
    let achieved = achievements.filter(a => a.achieved);
    if (achieved.length > 0) {
        achievementsElement.innerHTML = '<h4>Achievements</h4>';
        for (const achievement of achieved) {
            achievementsElement.innerHTML += `
                <div class="achievement">
                    <strong>${achievement.name}</strong><br>
                    ${achievement.description}
                </div>
            `;
        }
    }
}

// Save game to localStorage
function saveGame() {
    const gameData = {
        cookies,
        cookiesPerSecond,
        totalCookiesClicked,
        upgrades: Object.fromEntries(
            Object.entries(upgrades).map(([id, { cost, owned }]) => [id, { cost, owned }])
        ),
        achievements
    };
    localStorage.setItem('cookieClickerSave', JSON.stringify(gameData));
}

// Load game from localStorage
function loadGame() {
    const savedData = localStorage.getItem('cookieClickerSave');
    if (savedData) {
        const gameData = JSON.parse(savedData);
        
        cookies = gameData.cookies || 0;
        cookiesPerSecond = gameData.cookiesPerSecond || 0;
        totalCookiesClicked = gameData.totalCookiesClicked || 0;
        
        // Merge upgrades
        for (const [id, upgrade] of Object.entries(gameData.upgrades || {})) {
            if (upgrades[id]) {
                upgrades[id].cost = upgrade.cost;
                upgrades[id].owned = upgrade.owned;
            }
        }
        
        // Merge achievements
        for (const savedAchievement of gameData.achievements || []) {
            const achievement = achievements.find(a => a.id === savedAchievement.id);
            if (achievement) {
                achievement.achieved = savedAchievement.achieved;
            }
        }
        
        // Recalculate cookiesPerSecond in case of version changes
        cookiesPerSecond = 0;
        for (const upgrade of Object.values(upgrades)) {
            cookiesPerSecond += upgrade.owned * upgrade.cps;
        }
        
        checkAchievements();
    }
}

// Start the game when the page loads
window.onload = init;
