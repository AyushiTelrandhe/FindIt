// Data Storage
let lostItems = JSON.parse(localStorage.getItem('lostItems')) || [];
let foundItems = JSON.parse(localStorage.getItem('foundItems')) || [];
let matches = JSON.parse(localStorage.getItem('matches')) || [];
let completedItems = JSON.parse(localStorage.getItem('completedItems')) || [];

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    if (pageId === 'matchesPage') {
        displayMatches();
    } else if (pageId === 'myReportsPage') {
        displayMyReports();
        setupSearchAndFilter();
    } else if (pageId === 'statsPage') {
        displayStatistics();
    } else if (pageId === 'chatPage') {
        setupChatPage();
    }
}

// Chat System
let chatMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];

function setupChatPage() {
    populateActiveUsers();
    displayChatMessages();
}

function populateActiveUsers() {
    const userSelect = document.getElementById('userSelect');
    const activeUsersList = document.getElementById('activeUsersList');
    
    // Get all unique users from lost and found items
    const allUsers = [...lostItems, ...foundItems];
    const uniqueUsers = [];
    const seenUsers = new Set();
    
    allUsers.forEach(item => {
        if (item.userName && !seenUsers.has(item.userName)) {
            seenUsers.add(item.userName);
            uniqueUsers.push({
                name: item.userName,
                type: item.type,
                itemName: item.name,
                contact: item.contact,
                mobile: item.mobile,
                timestamp: item.timestamp
            });
        }
    });
    
    // Populate dropdown
    userSelect.innerHTML = '<option value="">Select a user...</option>' + 
        uniqueUsers.map(user => `<option value="${user.name}">${user.name} (${user.type}: ${user.itemName})</option>`).join('');
    
    // Make dropdown functional
    userSelect.addEventListener('change', function() {
        const selectedUser = this.value;
        if (selectedUser) {
            showNotification(`Selected user: ${selectedUser}`, 'info');
        }
    });
    
    // Display active users
    activeUsersList.innerHTML = uniqueUsers.map(user => `
        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors" onclick="selectUser('${user.name}')">
            <div class="flex items-center gap-2">
                <div class="text-2xl">${user.type === 'lost' ? '🔍' : '✅'}</div>
                <div>
                    <div class="font-medium text-gray-800">${user.name}</div>
                    <div class="text-sm text-gray-600">${user.itemName} (${user.type})</div>
                    <div class="text-xs text-gray-500">📧 ${user.contact || 'No email'}</div>
                    ${user.mobile ? `<div class="text-xs text-gray-500">📱 ${user.mobile}</div>` : ''}
                </div>
            </div>
        </div>
    `).join('') || '<div class="text-center text-gray-500 py-8">No active users found</div>';
}

function selectUser(userName) {
    const userSelect = document.getElementById('userSelect');
    userSelect.value = userName;
    
    // Highlight selected user card
    const userCards = document.querySelectorAll('#activeUsersList > div');
    userCards.forEach(card => {
        if (card.onclick && card.onclick.toString().includes(userName)) {
            card.classList.add('ring-2', 'ring-teal-500', 'bg-teal-50');
        } else {
            card.classList.remove('ring-2', 'ring-teal-500', 'bg-teal-50');
        }
    });
    
    showNotification(`Selected: ${userName}`, 'info');
}

function sendMessage() {
    const userSelect = document.getElementById('userSelect');
    const messageInput = document.getElementById('chatMessage');
    
    const selectedUser = userSelect.value;
    const message = messageInput.value.trim();
    
    if (!selectedUser) {
        showNotification('Please select a user to chat with', 'error');
        return;
    }
    
    if (!message) {
        showNotification('Please enter a message', 'error');
        return;
    }
    
    const chatMessage = {
        id: Date.now(),
        recipient: selectedUser,
        message: message,
        timestamp: new Date().toISOString(),
        sender: 'Current User'
    };
    
    chatMessages.push(chatMessage);
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    
    messageInput.value = '';
    displayChatMessages();
    
    showNotification(`Message sent to ${selectedUser}`, 'success');
}

function displayChatMessages() {
    const chatContainer = document.getElementById('chatMessages');
    
    if (chatMessages.length === 0) {
        chatContainer.innerHTML = '<div class="text-center text-gray-500 py-8">No messages yet. Start a conversation!</div>';
        return;
    }
    
    chatContainer.innerHTML = chatMessages.map(msg => `
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div class="flex justify-between items-start mb-2">
                <div class="font-medium text-gray-800">To: ${msg.recipient}</div>
                <div class="text-xs text-gray-500">${new Date(msg.timestamp).toLocaleString()}</div>
            </div>
            <div class="text-gray-700">${msg.message}</div>
            <div class="text-xs text-gray-500 mt-2">From: ${msg.sender}</div>
        </div>
    `).join('');
}

function clearChat() {
    if (confirm('Are you sure you want to clear all chat messages?')) {
        chatMessages = [];
        localStorage.removeItem('chatMessages');
        displayChatMessages();
        showNotification('Chat cleared successfully', 'success');
    }
}

// Search and Filter Functions
function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchReports');
    const typeFilter = document.getElementById('filterType');
    const statusFilter = document.getElementById('filterStatus');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterReports);
    }
    if (typeFilter) {
        typeFilter.addEventListener('change', filterReports);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterReports);
    }
}

function filterReports() {
    const searchTerm = document.getElementById('searchReports')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('filterType')?.value || 'all';
    const statusFilter = document.getElementById('filterStatus')?.value || 'all';
    
    const allItems = [...lostItems, ...foundItems];
    const activeItems = allItems.filter(item => !completedItems.includes(item.id));
    const completedItemList = allItems.filter(item => completedItems.includes(item.id));
    
    // Filter active items
    let filteredActive = activeItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                           item.description.toLowerCase().includes(searchTerm) ||
                           item.category.toLowerCase().includes(searchTerm);
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && !matches.some(m => (m.lostItemId === item.id || m.foundItemId === item.id) && m.status !== 'dismissed')) ||
                           (statusFilter === 'matched' && matches.some(m => (m.lostItemId === item.id || m.foundItemId === item.id) && m.status !== 'dismissed'));
        
        return matchesSearch && matchesType && matchesStatus;
    });
    
    // Filter completed items
    let filteredCompleted = completedItemList.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                           item.description.toLowerCase().includes(searchTerm) ||
                           item.category.toLowerCase().includes(searchTerm);
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || statusFilter === 'completed';
        
        return matchesSearch && matchesType && matchesStatus;
    });
    
    // Update display
    displayFilteredReports(filteredActive, filteredCompleted);
}

function displayFilteredReports(activeItems, completedItems) {
    const activeContainer = document.getElementById('activeReportsContainer');
    const completedContainer = document.getElementById('completedReportsContainer');
    
    // Display active reports
    if (activeItems.length === 0) {
        activeContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6 text-center">
                <div class="text-gray-500 text-lg">No reports match your filters.</div>
                <div class="text-gray-400 text-sm mt-2">Try adjusting your search or filters.</div>
            </div>
        `;
    } else {
        activeContainer.innerHTML = activeItems.map(item => {
            const typeColor = item.type === 'lost' ? 'red' : 'green';
            const typeIcon = item.type === 'lost' ? '🔍' : '✅';
            const location = item.type === 'lost' ? 'Lost at' : 'Found at';
            
            return `
                <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-${typeColor}-500 hover:shadow-xl transition-shadow">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-2xl">${typeIcon}</span>
                                <h3 class="text-xl font-bold text-gray-800">${item.name}</h3>
                                ${getStatusBadge(item)}
                            </div>
                            <p class="text-gray-600">${item.category} • ${item.color}</p>
                            <div class="text-xs text-gray-500 mt-1">👤 Reported by: ${item.userName || 'Anonymous'}</div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="deleteReport(${item.id}, '${item.type}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                    
                    ${item.image ? `
                    <div class="mb-4">
                        <div class="text-sm text-gray-500 mb-2">📷 Uploaded Image</div>
                        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div class="flex items-center gap-3">
                                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg border-2 border-gray-300">
                                <div>
                                    <div class="text-sm font-medium text-gray-700">Image uploaded</div>
                                    <div class="text-xs text-gray-500">Available for AI matching</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <div class="text-sm text-gray-500">${location}</div>
                            <div class="font-medium">📍 ${item.location}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500">Reported</div>
                            <div class="font-medium">📅 ${new Date(item.timestamp).toLocaleDateString()}</div>
                        </div>
                    </div>
                    
                    ${item.pickupLocation ? `
                    <div class="mb-4 mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div class="flex items-center gap-2">
                            <div class="text-2xl">🏢</div>
                            <div>
                                <div class="text-sm font-medium text-yellow-700">${item.pickupLocation}</div>
                                <div class="text-xs text-yellow-600">Where owner can collect</div>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div>
                        <div class="text-sm text-gray-500 mb-1">Description</div>
                        <div class="text-gray-700">${item.description}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Display completed reports
    if (completedItems.length === 0) {
        completedContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6 text-center">
                <div class="text-gray-500 text-lg">No completed items match your filters.</div>
            </div>
        `;
    } else {
        completedContainer.innerHTML = completedItems.map(item => {
            const typeColor = item.type === 'lost' ? 'red' : 'green';
            const typeIcon = item.type === 'lost' ? '🔍' : '✅';
            const location = item.type === 'lost' ? 'Lost at' : 'Found at';
            
            return `
                <div class="bg-green-50 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-2xl">${typeIcon}</span>
                                <h3 class="text-xl font-bold text-gray-800">${item.name}</h3>
                                ${getStatusBadge(item)}
                            </div>
                            <p class="text-gray-600">${item.category} • ${item.color}</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <div class="text-sm text-gray-500">${location}</div>
                            <div class="font-medium">📍 ${item.location}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500">Completed</div>
                            <div class="font-medium">🎉 Successfully returned</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Statistics Dashboard
function displayStatistics() {
    // Calculate statistics
    const totalLost = lostItems.length;
    const totalFound = foundItems.length;
    const totalCompleted = completedItems.length;
    const activeMatches = matches.filter(m => 
        !completedItems.includes(m.lostItemId) && 
        !completedItems.includes(m.foundItemId) &&
        m.status !== 'dismissed'
    ).length;
    
    const totalItems = totalLost + totalFound;
    const matchRate = totalItems > 0 ? Math.round((activeMatches / totalItems) * 100) : 0;
    const completionRate = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
    const avgConfidence = matches.length > 0 ? 
        Math.round(matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length) : 0;
    
    // Update statistics display
    document.getElementById('totalLost').textContent = totalLost;
    document.getElementById('totalFound').textContent = totalFound;
    document.getElementById('totalMatches').textContent = activeMatches;
    document.getElementById('totalCompleted').textContent = totalCompleted;
    document.getElementById('matchRate').textContent = matchRate + '%';
    document.getElementById('completionRate').textContent = completionRate + '%';
    document.getElementById('avgConfidence').textContent = avgConfidence + '%';
    
    // Display recent activity
    const allItems = [...lostItems, ...foundItems].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    ).slice(0, 5);
    
    const recentActivityHtml = allItems.map(item => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
                <span class="text-2xl">${item.type === 'lost' ? '🔍' : '✅'}</span>
                <div>
                    <div class="font-medium text-gray-700">${item.name}</div>
                                            <div class="text-sm text-gray-500">${item.category} • ${item.color}</div>
                </div>
            </div>
            <div class="text-right">
                <div class="text-sm text-gray-500">${new Date(item.timestamp).toLocaleDateString()}</div>
                <div class="text-xs text-gray-400">${item.userName || 'Anonymous'}</div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('recentActivity').innerHTML = recentActivityHtml || 
        '<div class="text-center text-gray-500 py-4">No recent activity</div>';
}

// Notification System
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    
    const bgColor = type === 'success' ? 'bg-green-500' : 
                   type === 'error' ? 'bg-red-500' : 
                   type === 'match' ? 'bg-purple-500' : 'bg-blue-500';
    
    notification.className = `notification ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg max-w-sm`;
    notification.innerHTML = `
        <div class="font-semibold">${message}</div>
        ${type === 'match' ? '<div class="text-sm mt-1">AI Agent found a potential match!</div>' : ''}
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// AI Matching Logic (Simulated Gemini-inspired)
class MatchingAgent {
    static calculateMatchConfidence(lostItem, foundItem) {
        let score = 0;
        let maxScore = 100;
        
        // Category match (40 points)
        if (lostItem.category.toLowerCase() === foundItem.category.toLowerCase()) {
            score += 40;
        }
        
        // Color match (25 points)
        if (lostItem.color.toLowerCase() === foundItem.color.toLowerCase()) {
            score += 25;
        }
        
        // Name similarity (20 points)
        const nameSimilarity = this.textSimilarity(lostItem.name, foundItem.name);
        score += nameSimilarity * 20;
        
        // Description similarity (15 points)
        const descSimilarity = this.textSimilarity(lostItem.description, foundItem.description);
        score += descSimilarity * 15;
        
        return Math.round(score);
    }
    
    static textSimilarity(text1, text2) {
        const words1 = text1.toLowerCase().split(' ');
        const words2 = text2.toLowerCase().split(' ');
        
        let commonWords = 0;
        words1.forEach(word => {
            if (words2.includes(word)) {
                commonWords++;
            }
        });
        
        const totalWords = Math.max(words1.length, words2.length);
        return totalWords > 0 ? commonWords / totalWords : 0;
    }
    
    static findMatches() {
        const newMatches = [];
        
        lostItems.forEach(lostItem => {
            foundItems.forEach(foundItem => {
                const confidence = this.calculateMatchConfidence(lostItem, foundItem);
                
                if (confidence >= 50) { // Minimum threshold
                    const existingMatch = matches.find(m => 
                        m.lostItemId === lostItem.id && m.foundItemId === foundItem.id
                    );
                    
                    if (!existingMatch) {
                        newMatches.push({
                            id: Date.now() + Math.random(),
                            lostItemId: lostItem.id,
                            foundItemId: foundItem.id,
                            confidence: confidence,
                            status: 'pending',
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            });
        });
        
        return newMatches;
    }
}

// Notification Agent
class NotificationAgent {
    static notifyNewMatch(match) {
        const lostItem = lostItems.find(item => item.id === match.lostItemId);
        const foundItem = foundItems.find(item => item.id === match.foundItemId);
        
        showNotification(
            `🎯 ${match.confidence}% match: ${lostItem.name} found at ${foundItem.location}`,
            'match'
        );
    }
}

// Verification Agent
class VerificationAgent {
    static generateVerificationQuestion(lostItem, foundItem) {
        const questions = [
            `What brand is the ${lostItem.category}?`,
            `What specific features does your ${lostItem.name} have?`,
            `When and where did you last see your ${lostItem.category}?`,
            `What distinguishing marks does your ${lostItem.name} have?`
        ];
        
        return questions[Math.floor(Math.random() * questions.length)];
    }
    
    static initiateVerification(match) {
        const lostItem = lostItems.find(item => item.id === match.lostItemId);
        const foundItem = foundItems.find(item => item.id === match.foundItemId);
        
        const question = this.generateVerificationQuestion(lostItem, foundItem);
        
        // In a real app, this would send to the user
        showNotification(
            `🔐 Verification Required: ${question}`,
            'info'
        );
        
        return question;
    }
}

// Form Handlers
document.getElementById('lostForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const imageFile = document.getElementById('lostImage').files[0];
    let imageData = null;
    
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageData = e.target.result;
            saveLostItem(imageData);
        };
        reader.readAsDataURL(imageFile);
    } else {
        saveLostItem(null);
    }
});

function saveLostItem(imageData) {
    const userName = document.getElementById('lostUserName').value || 'Anonymous';
    const contactInfo = document.getElementById('lostContact').value;
    const mobileNumber = document.getElementById('lostMobile').value;
    const lostItem = {
        id: Date.now(),
        name: document.getElementById('lostItemName').value,
        color: document.getElementById('lostColor').value,
        category: document.getElementById('lostCategory').value,
        description: document.getElementById('lostDescription').value,
        location: document.getElementById('lostLocation').value,
        pickupLocation: document.getElementById('lostPickupLocation').value,
        image: imageData,
        type: 'lost',
        userName: userName,
        contact: contactInfo,
        mobile: mobileNumber,
        timestamp: new Date().toISOString()
    };
    
    lostItems.push(lostItem);
    localStorage.setItem('lostItems', JSON.stringify(lostItems));
    
    showNotification('✅ Lost item reported successfully!', 'success');
    
    // Run matching
    const newMatches = MatchingAgent.findMatches();
    if (newMatches.length > 0) {
        matches.push(...newMatches);
        localStorage.setItem('matches', JSON.stringify(matches));
        
        newMatches.forEach(match => {
            NotificationAgent.notifyNewMatch(match);
        });
    }
    
    document.getElementById('lostForm').reset();
    showPage('homePage');
}

document.getElementById('foundForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const imageFile = document.getElementById('foundImage').files[0];
    let imageData = null;
    
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageData = e.target.result;
            saveFoundItem(imageData);
        };
        reader.readAsDataURL(imageFile);
    } else {
        saveFoundItem(null);
    }
});

function saveFoundItem(imageData) {
    const userName = document.getElementById('foundUserName').value || 'Anonymous';
    const contactInfo = document.getElementById('foundContact').value;
    const mobileNumber = document.getElementById('foundMobile').value;
    const foundItem = {
        id: Date.now(),
        name: document.getElementById('foundItemName').value,
        color: document.getElementById('foundColor').value,
        category: document.getElementById('foundCategory').value,
        description: document.getElementById('foundDescription').value,
        location: document.getElementById('foundLocation').value,
        pickupLocation: document.getElementById('foundPickupLocation').value,
        image: imageData,
        type: 'found',
        userName: userName,
        contact: contactInfo,
        mobile: mobileNumber,
        timestamp: new Date().toISOString()
    };
    
    foundItems.push(foundItem);
    localStorage.setItem('foundItems', JSON.stringify(foundItems));
    
    showNotification('✅ Found item reported successfully!', 'success');
    
    // Run matching
    const newMatches = MatchingAgent.findMatches();
    if (newMatches.length > 0) {
        matches.push(...newMatches);
        localStorage.setItem('matches', JSON.stringify(matches));
        
        newMatches.forEach(match => {
            NotificationAgent.notifyNewMatch(match);
        });
    }
    
    document.getElementById('foundForm').reset();
    showPage('homePage');
}

// Status Badge Helper
function getStatusBadge(item) {
    const hasMatch = matches.some(m => 
        (m.lostItemId === item.id || m.foundItemId === item.id) && m.status !== 'dismissed'
    );
    const isCompleted = completedItems.includes(item.id);
    
    if (isCompleted) {
        return '<span class="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-semibold">✅ Completed</span>';
    } else if (hasMatch) {
        return '<span class="px-2 py-1 bg-purple-500 text-white text-xs rounded-full font-semibold">🎯 Matched</span>';
    } else {
        return '<span class="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-semibold">🔍 Open</span>';
    }
}

// Display My Reports
function displayMyReports() {
    const activeContainer = document.getElementById('activeReportsContainer');
    const completedContainer = document.getElementById('completedReportsContainer');
    
    const allItems = [...lostItems, ...foundItems];
    const activeItems = allItems.filter(item => !completedItems.includes(item.id));
    const completedItemList = allItems.filter(item => completedItems.includes(item.id));
    
    // Display active reports
    if (activeItems.length === 0) {
        activeContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6 text-center">
                <div class="text-gray-500 text-lg">No active reports.</div>
                <div class="text-gray-400 text-sm mt-2">Start by reporting a lost or found item!</div>
            </div>
        `;
    } else {
        activeContainer.innerHTML = activeItems.map(item => {
            const typeColor = item.type === 'lost' ? 'red' : 'green';
            const typeIcon = item.type === 'lost' ? '🔍' : '✅';
            const location = item.type === 'lost' ? 'Lost at' : 'Found at';
            
            return `
                <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-${typeColor}-500 hover:shadow-xl transition-shadow">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-2xl">${typeIcon}</span>
                                <h3 class="text-xl font-bold text-gray-800">${item.name}</h3>
                                ${getStatusBadge(item)}
                            </div>
                            <p class="text-gray-600">${item.category} • ${item.color}</p>
                            <div class="text-xs text-gray-500 mt-1">👤 Reported by: ${item.userName || 'Anonymous'}</div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="deleteReport(${item.id}, '${item.type}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                    
                    ${item.image ? `
                    <div class="mb-4">
                        <div class="text-sm text-gray-500 mb-2">📷 Uploaded Image</div>
                        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div class="flex items-center gap-3">
                                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg border-2 border-gray-300">
                                <div>
                                    <div class="text-sm font-medium text-gray-700">Image uploaded</div>
                                    <div class="text-xs text-gray-500">Available for AI matching</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <div class="text-sm text-gray-500">${location}</div>
                            <div class="font-medium">📍 ${item.location}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500">Reported</div>
                            <div class="font-medium">📅 ${new Date(item.timestamp).toLocaleDateString()}</div>
                        </div>
                    </div>
                    
                    ${item.pickupLocation ? `
                    <div class="mb-4 mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div class="flex items-center gap-2">
                            <div class="text-2xl">🏢</div>
                            <div>
                                <div class="text-sm font-medium text-yellow-700">${item.pickupLocation}</div>
                                <div class="text-xs text-yellow-600">Where owner can collect</div>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${item.pickupLocation ? `
                    <div class="mb-4 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div class="flex items-center gap-2">
                            <div class="text-2xl">ℹ️</div>
                            <div>
                                <div class="text-sm font-medium text-blue-700">Pickup Instructions:</div>
                                <div class="text-xs text-blue-600">Go to ${item.pickupLocation} to collect your item</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div>
                        <div class="text-sm text-gray-500 mb-1">Description</div>
                        <div class="text-gray-700">${item.description}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Display completed reports
    if (completedItemList.length === 0) {
        completedContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6 text-center">
                <div class="text-gray-500 text-lg">No completed items yet.</div>
                <div class="text-gray-400 text-sm mt-2">Completed items will appear here.</div>
            </div>
        `;
    } else {
        completedContainer.innerHTML = completedItemList.map(item => {
            const typeColor = item.type === 'lost' ? 'red' : 'green';
            const typeIcon = item.type === 'lost' ? '🔍' : '✅';
            const location = item.type === 'lost' ? 'Lost at' : 'Found at';
            
            return `
                <div class="bg-green-50 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-2xl">${typeIcon}</span>
                                <h3 class="text-xl font-bold text-gray-800">${item.name}</h3>
                                ${getStatusBadge(item)}
                            </div>
                            <p class="text-gray-600">${item.category} • ${item.color}</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <div class="text-sm text-gray-500">${location}</div>
                            <div class="font-medium">📍 ${item.location}</div>
                        </div>
                        <div>
                            <div class="text-sm text-gray-500">Completed</div>
                            <div class="font-medium">🎉 Successfully returned</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Delete Report Function
function deleteReport(itemId, itemType) {
    if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
        if (itemType === 'lost') {
            lostItems = lostItems.filter(item => item.id !== itemId);
            localStorage.setItem('lostItems', JSON.stringify(lostItems));
        } else {
            foundItems = foundItems.filter(item => item.id !== itemId);
            localStorage.setItem('foundItems', JSON.stringify(foundItems));
        }
        
        // Also remove related matches
        matches = matches.filter(match => 
            match.lostItemId !== itemId && match.foundItemId !== itemId
        );
        localStorage.setItem('matches', JSON.stringify(matches));
        
        // Remove from completed items if present
        completedItems = completedItems.filter(id => id !== itemId);
        localStorage.setItem('completedItems', JSON.stringify(completedItems));
        
        showNotification('🗑️ Report deleted successfully', 'success');
        displayMyReports();
    }
}

// Clear All Data Function
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This will remove all reports, matches, and completed items. This is for demo reset only.')) {
        localStorage.removeItem('lostItems');
        localStorage.removeItem('foundItems');
        localStorage.removeItem('matches');
        localStorage.removeItem('completedItems');
        
        lostItems = [];
        foundItems = [];
        matches = [];
        completedItems = [];
        
        showNotification('🗑️ All data cleared successfully', 'success');
        showPage('homePage');
    }
}

// Display Matches
function displayMatches() {
    const container = document.getElementById('matchesContainer');
    
    // Debug: Log current items to check image data
    console.log('Lost items:', lostItems.map(item => ({ id: item.id, name: item.name, hasImage: !!item.image, imageType: item.image ? (item.image.startsWith('data:') ? 'dataURL' : 'filename') : 'none' })));
    console.log('Found items:', foundItems.map(item => ({ id: item.id, name: item.name, hasImage: !!item.image, imageType: item.image ? (item.image.startsWith('data:') ? 'dataURL' : 'filename') : 'none' })));
    
    // Filter out matches involving completed items
    const activeMatches = matches.filter(match => 
        !completedItems.includes(match.lostItemId) && 
        !completedItems.includes(match.foundItemId) &&
        match.status !== 'dismissed'
    );
    
    if (activeMatches.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6 text-center">
                <div class="text-gray-500 text-lg">No active matches found.</div>
                <div class="text-gray-400 text-sm mt-2">Report more items to see AI matches!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activeMatches.map(match => {
        const lostItem = lostItems.find(item => item.id === match.lostItemId);
        const foundItem = foundItems.find(item => item.id === match.foundItemId);
        
        if (!lostItem || !foundItem) return '';
        
        const confidenceColor = match.confidence >= 80 ? 'bg-green-500' : 
                              match.confidence >= 60 ? 'bg-yellow-500' : 'bg-orange-500';
        
        return `
            <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 ${confidenceColor}">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${lostItem.name}</h3>
                        <p class="text-gray-600">${lostItem.category} • ${lostItem.color}</p>
                        <div class="text-xs text-gray-500 mt-1">👤 Reported by: ${lostItem.userName || 'Anonymous'}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold ${confidenceColor.replace('bg-', 'text-')}">${match.confidence}%</div>
                        <div class="text-sm text-gray-500">Match Confidence</div>
                    </div>
                </div>
                
                ${lostItem.image || foundItem.image ? `
                <div class="mb-6">
                    <div class="text-sm text-gray-500 mb-3 font-semibold">🖼️ Image Comparison</div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center">
                            <div class="text-xs text-gray-500 mb-2">Lost Item</div>
                            <div class="bg-gray-100 rounded-lg p-4 border-2 border-red-200">
                                ${lostItem.image && lostItem.image.startsWith('data:') ? `
                                    <img src="${lostItem.image}" alt="Lost Item" class="w-32 h-32 object-cover rounded-lg mb-2 mx-auto border-2 border-red-200" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                    <div style="display:none;" class="text-4xl mb-2 opacity-30">📷</div>
                                    <div class="text-xs text-red-500 mt-1">🔍 Lost Image</div>
                                ` : lostItem.image ? `
                                    <div class="text-4xl mb-2 opacity-30">📷</div>
                                    <div class="text-sm text-gray-600">Invalid image data</div>
                                    <div class="text-xs text-red-500 mt-1">🔍 Lost Image (Error)</div>
                                ` : `
                                    <div class="text-4xl mb-2 opacity-30">📷</div>
                                    <div class="text-sm text-gray-400">No image uploaded</div>
                                    <div class="text-xs text-gray-400 mt-1">No image</div>
                                `}
                            </div>
                        </div>
                        <div class="text-center">
                            <div class="text-xs text-gray-500 mb-2">Found Item</div>
                            <div class="bg-gray-100 rounded-lg p-4 border-2 border-green-200">
                                ${foundItem.image && foundItem.image.startsWith('data:') ? `
                                    <img src="${foundItem.image}" alt="Found Item" class="w-32 h-32 object-cover rounded-lg mb-2 mx-auto border-2 border-green-200" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                    <div style="display:none;" class="text-4xl mb-2 opacity-30">📸</div>
                                    <div class="text-xs text-green-500 mt-1">✅ Found Image</div>
                                ` : foundItem.image ? `
                                    <div class="text-4xl mb-2 opacity-30">📸</div>
                                    <div class="text-sm text-gray-600">Invalid image data</div>
                                    <div class="text-xs text-green-500 mt-1">✅ Found Image (Error)</div>
                                ` : `
                                    <div class="text-4xl mb-2 opacity-30">📸</div>
                                    <div class="text-sm text-gray-400">No image uploaded</div>
                                    <div class="text-xs text-gray-400 mt-1">No image</div>
                                `}
                            </div>
                        </div>
                    </div>
                    <div class="text-center mt-3">
                        <div class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            🔄 AI Vision Analysis: ${lostItem.image && foundItem.image ? 'Both images available' : 'Partial image data available'}
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <div class="text-sm text-gray-500">Lost Location</div>
                        <div class="font-medium">📍 ${lostItem.location}</div>
                    </div>
                    <div>
                        <div class="text-sm text-gray-500">Found Location</div>
                        <div class="font-medium">📍 ${foundItem.location}</div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="text-sm text-gray-500 mb-1">📍 Pickup Locations</div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <div class="font-medium text-gray-700">🔍 Lost Item Pickup:</div>
                            <div class="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                                <div class="font-medium text-yellow-700">${lostItem.pickupLocation || 'Not specified'}</div>
                                <div class="text-xs text-yellow-600">Where owner can collect</div>
                            </div>
                        </div>
                        <div>
                            <div class="font-medium text-gray-700">✅ Found Item Pickup:</div>
                            <div class="bg-green-50 rounded-lg p-3 border border-green-200">
                                <div class="font-medium text-green-700">${foundItem.pickupLocation || 'Not specified'}</div>
                                <div class="text-xs text-green-600">Where finder can handover</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="text-sm text-gray-500 mb-1">Lost Description</div>
                    <div class="text-gray-700">${lostItem.description}</div>
                </div>
                
                <div class="mb-4">
                    <div class="text-sm text-gray-500 mb-1">Found Description</div>
                    <div class="text-gray-700">${foundItem.description}</div>
                </div>
                
                <div class="mb-4">
                    <div class="text-sm text-gray-500 mb-1">👤 Reported By</div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <div class="font-medium text-gray-700">Lost Item:</div>
                            <div class="text-sm text-gray-600">${lostItem.userName || 'Anonymous'}</div>
                        </div>
                        <div>
                            <div class="font-medium text-gray-700">Found Item:</div>
                            <div class="text-sm text-gray-600">${foundItem.userName || 'Anonymous'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="text-sm text-gray-500 mb-1">👤 Contact Information</div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <div class="font-medium text-gray-700">Lost Item Contact:</div>
                            <div class="bg-red-50 rounded-lg p-3 border border-red-200">
                                <div class="text-sm text-red-700">${lostItem.contact || 'No email provided'}</div>
                                <div class="text-xs text-red-600">${lostItem.mobile || 'No mobile provided'}</div>
                                <div class="text-xs text-red-500 mt-1">Owner's contact</div>
                            </div>
                        </div>
                        <div>
                            <div class="font-medium text-gray-700">Found Item Contact:</div>
                            <div class="bg-green-50 rounded-lg p-3 border border-green-200">
                                <div class="text-sm text-green-700">${foundItem.contact || 'No email provided'}</div>
                                <div class="text-xs text-green-600">${foundItem.mobile || 'No mobile provided'}</div>
                                <div class="text-xs text-green-500 mt-1">Finder's contact</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-2">
                    <button onclick="verifyMatch('${match.id}')" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm">
                        🔐 Verify Match
                    </button>
                    <button onclick="confirmMatch('${match.id}')" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                        ✅ Confirm Handover
                    </button>
                    <button onclick="dismissMatch('${match.id}')" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">
                        ❌ Dismiss
                    </button>
                </div>
                
                <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div class="text-xs text-blue-700 font-semibold mb-1">🤖 AI Agent Analysis</div>
                    <div class="text-xs text-blue-600">
                        Matching Agent found ${match.confidence}% confidence based on category, color, and text similarity. 
                        Verification Agent will ask security questions before handover.
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Match Actions
function verifyMatch(matchId) {
    const match = matches.find(m => m.id == matchId);
    if (match) {
        VerificationAgent.initiateVerification(match);
    }
}

function confirmMatch(matchId) {
    const match = matches.find(m => m.id == matchId);
    if (match) {
        // Mark both items as completed
        completedItems.push(match.lostItemId, match.foundItemId);
        localStorage.setItem('completedItems', JSON.stringify(completedItems));
        
        // Update match status
        match.status = 'confirmed';
        localStorage.setItem('matches', JSON.stringify(matches));
        
        showNotification('🎉 Item successfully matched and marked as completed!', 'success');
        displayMatches();
    }
}

function dismissMatch(matchId) {
    const matchIndex = matches.findIndex(m => m.id == matchId);
    if (matchIndex !== -1) {
        matches.splice(matchIndex, 1);
        localStorage.setItem('matches', JSON.stringify(matches));
        showNotification('Match dismissed', 'info');
        displayMatches();
    }
}

// Debug Image Data Function
function debugImageData() {
    console.log('=== IMAGE DATA DEBUG ===');
    console.log('Lost Items:');
    lostItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}:`, {
            hasImage: !!item.image,
            imageLength: item.image ? item.image.length : 0,
            isDataURL: item.image ? item.image.startsWith('data:') : false,
            imagePreview: item.image ? (item.image.startsWith('data:') ? item.image.substring(0, 50) + '...' : item.image) : 'none'
        });
    });
    
    console.log('Found Items:');
    foundItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}:`, {
            hasImage: !!item.image,
            imageLength: item.image ? item.image.length : 0,
            isDataURL: item.image ? item.image.startsWith('data:') : false,
            imagePreview: item.image ? (item.image.startsWith('data:') ? item.image.substring(0, 50) + '...' : item.image) : 'none'
        });
    });
    
    alert('Debug info logged to console! Press F12 to view.');
}

// Initialize
showPage('homePage');
