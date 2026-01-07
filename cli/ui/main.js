let selectedType = null;
let selectedConnection = null;

// Mock sample data for table previews
const mockTableData = {
    users: {
        columns: ['id', 'name', 'email', 'created_at'],
        rows: [
            [1, 'John Doe', 'john@example.com', '2024-01-15'],
            [2, 'Jane Smith', 'jane@example.com', '2024-01-16'],
            [3, 'Bob Wilson', 'bob@example.com', '2024-01-17'],
            [4, 'Alice Brown', 'alice@example.com', '2024-01-18'],
            [5, 'Charlie Davis', 'charlie@example.com', '2024-01-19']
        ]
    },
    orders: {
        columns: ['order_id', 'customer', 'total', 'status', 'date'],
        rows: [
            ['ORD-001', 'John Doe', '$129.99', 'Completed', '2024-01-20'],
            ['ORD-002', 'Jane Smith', '$89.50', 'Shipped', '2024-01-21'],
            ['ORD-003', 'Bob Wilson', '$245.00', 'Processing', '2024-01-22'],
            ['ORD-004', 'Alice Brown', '$67.25', 'Completed', '2024-01-23'],
            ['ORD-005', 'Charlie Davis', '$199.99', 'Pending', '2024-01-24']
        ]
    },
    products: {
        columns: ['sku', 'name', 'price', 'stock', 'category'],
        rows: [
            ['SKU-001', 'Wireless Headphones', '$79.99', 150, 'Electronics'],
            ['SKU-002', 'USB-C Cable', '$12.99', 500, 'Accessories'],
            ['SKU-003', 'Laptop Stand', '$49.99', 75, 'Office'],
            ['SKU-004', 'Bluetooth Mouse', '$29.99', 200, 'Electronics'],
            ['SKU-005', 'Webcam HD', '$89.99', 80, 'Electronics']
        ]
    },
    customers: {
        columns: ['id', 'company', 'contact', 'country', 'orders'],
        rows: [
            [1, 'Acme Corp', 'John Smith', 'USA', 45],
            [2, 'Tech Inc', 'Sarah Johnson', 'Canada', 32],
            [3, 'Global Ltd', 'Mike Brown', 'UK', 28],
            [4, 'StartupXYZ', 'Lisa Davis', 'Germany', 15],
            [5, 'Enterprise Co', 'Tom Wilson', 'Australia', 52]
        ]
    },
    data: {
        columns: ['id', 'value', 'category', 'timestamp'],
        rows: [
            [1, 'Sample A', 'Type 1', '2024-01-20 10:30'],
            [2, 'Sample B', 'Type 2', '2024-01-20 11:45'],
            [3, 'Sample C', 'Type 1', '2024-01-20 14:20'],
            [4, 'Sample D', 'Type 3', '2024-01-21 09:15'],
            [5, 'Sample E', 'Type 2', '2024-01-21 16:30']
        ]
    }
};

// Default data for unknown tables
const defaultTableData = {
    columns: ['id', 'name', 'value', 'updated_at'],
    rows: [
        [1, 'Record 1', 'Value A', '2024-01-20'],
        [2, 'Record 2', 'Value B', '2024-01-21'],
        [3, 'Record 3', 'Value C', '2024-01-22']
    ]
};

// Help instructions for each data source
const helpInstructions = {
    mysql: {
        title: 'How to Connect to MySQL',
        steps: [
            '<b>1. Get your MySQL credentials</b><br>You need: host, port (default 3306), username, password, and database name.',
            '<b>2. Ensure remote access is enabled</b><br>If connecting to a remote server, make sure MySQL is configured to accept remote connections.',
            '<b>3. Check firewall settings</b><br>Port 3306 (or your custom port) must be open.',
            '<b>4. Test with a MySQL client</b><br>Try connecting with MySQL Workbench or command line first to verify credentials work.'
        ]
    },
    postgresql: {
        title: 'How to Connect to PostgreSQL',
        steps: [
            '<b>1. Get your PostgreSQL credentials</b><br>You need: host, port (default 5432), username, password, and database name.',
            '<b>2. Check pg_hba.conf</b><br>For remote connections, ensure your IP is allowed in pg_hba.conf.',
            '<b>3. Verify SSL requirements</b><br>Some PostgreSQL servers require SSL connections.',
            '<b>4. Test with psql</b><br>Try connecting with psql command line tool to verify credentials.'
        ]
    },
    bigquery: {
        title: 'How to Connect to BigQuery',
        steps: [
            '<b>1. Create a service account</b><br>Go to Google Cloud Console → IAM & Admin → Service Accounts.',
            '<b>2. Download JSON key</b><br>Create a key for your service account and download the JSON file.',
            '<b>3. Grant BigQuery permissions</b><br>Give the service account "BigQuery Data Viewer" and "BigQuery Job User" roles.',
            '<b>4. Save the key file path</b><br>Store the JSON file securely and enter its path here.'
        ]
    },
    snowflake: {
        title: 'How to Connect to Snowflake',
        steps: [
            '<b>1. Get your account identifier</b><br>Format: your_account.region (e.g., xy12345.us-east-1)',
            '<b>2. Get your credentials</b><br>You need: username, password, warehouse name, and database.',
            '<b>3. Ensure warehouse is running</b><br>Make sure your compute warehouse is started and you have access.',
            '<b>4. Check network access</b><br>If using Snowflake network policies, ensure your IP is allowed.'
        ]
    },
    shopify: {
        title: 'How to Connect to Shopify',
        steps: [
            '<b>1. Create a private app</b><br>Go to Shopify Admin → Apps → Develop apps → Create an app.',
            '<b>2. Configure API scopes</b><br>Enable read access for: Orders, Products, Customers, Analytics.',
            '<b>3. Get API credentials</b><br>Copy the API key and API secret from the app settings.',
            '<b>4. Find your store URL</b><br>Your store URL is: yourstore.myshopify.com'
        ]
    },
    csv: {
        title: 'How to Use CSV Files',
        steps: [
            '<b>1. Prepare your CSV file</b><br>Ensure your CSV has headers in the first row.',
            '<b>2. Get the absolute file path</b><br>Right-click the file and copy its full path.',
            '<b>3. Check file encoding</b><br>UTF-8 encoding works best. Save as UTF-8 if needed.',
            '<b>4. Verify file access</b><br>Make sure the file is not open in Excel when connecting.'
        ]
    }
};

// Mock tables for demo
const mockTables = {
    mysql: ['users', 'orders', 'products', 'customers', 'sessions', 'analytics'],
    postgresql: ['accounts', 'transactions', 'logs', 'events', 'metrics'],
    bigquery: ['pageviews', 'conversions', 'user_events', 'revenue'],
    snowflake: ['sales', 'inventory', 'customers', 'suppliers'],
    shopify: ['orders', 'products', 'customers', 'collections'],
    csv: ['data']
};

// Load connections
async function loadConnections() {
    try {
        const res = await fetch('/api/connections');
        const data = await res.json();
        const list = document.getElementById('connection-list');

        if (data.connections.length === 0) {
            list.innerHTML = '';
            showNoSelection();
            return;
        }

        list.innerHTML = data.connections.map(conn => `
          <li class="connection-item ${selectedConnection?.name === conn.name ? 'active' : ''}" 
              data-name="${conn.name}" data-type="${conn.type}">
            <span class="icon">${getIcon(conn.type)}</span>
            <div class="info">
              <div class="name">${conn.name}</div>
              <div class="type">${conn.type}</div>
            </div>
            <span class="status"></span>
          </li>
        `).join('');

        // Add click handlers
        document.querySelectorAll('.connection-item').forEach(item => {
            item.addEventListener('click', () => selectConnection(item.dataset.name, item.dataset.type));
        });

    } catch (e) {
        console.error('Failed to load connections', e);
    }
}

function getIcon(type) {
    const icons = { mysql: '🐬', postgresql: '🐘', bigquery: '📊', snowflake: '❄️', shopify: '🛒', csv: '📄' };
    return icons[type] || '📁';
}

function showNoSelection() {
    document.getElementById('no-selection').classList.remove('hidden');
    document.getElementById('connection-details').classList.add('hidden');
}

async function selectConnection(name, type) {
    selectedConnection = { name, type };

    // Update sidebar active state
    document.querySelectorAll('.connection-item').forEach(item => {
        item.classList.toggle('active', item.dataset.name === name);
    });

    // Show connection details
    document.getElementById('no-selection').classList.add('hidden');
    document.getElementById('connection-details').classList.remove('hidden');
    document.getElementById('table-data-panel').classList.add('hidden');
    document.getElementById('tables-panel').classList.remove('hidden');
    document.getElementById('connection-panel').classList.remove('hidden');

    // Update header
    document.getElementById('selected-name').textContent = name;
    document.getElementById('selected-info').textContent = `${type} • Connected`;

    // Fetch real tables from API
    try {
        const res = await fetch(`/api/connections/${encodeURIComponent(name)}/tables`);
        const data = await res.json();

        let tables = [];
        if (data.success && data.tables && data.tables.length > 0) {
            tables = data.tables;
        } else {
            // Fallback to mock tables for non-CSV types
            tables = (mockTables[type] || []).map(t => ({ name: t, type: 'mock', rowCount: Math.floor(Math.random() * 100000) }));
        }

        document.getElementById('table-count').textContent = `${tables.length} table${tables.length !== 1 ? 's' : ''}`;

        document.getElementById('tables-grid').innerHTML = tables.map(table => {
            const tableName = typeof table === 'string' ? table : table.name;
            const rowCount = table.rowCount || '?';
            return `
            <div class="table-card" onclick="openTablePreview('${tableName}')" style="cursor: pointer;">
              <div class="table-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
              </div>
              <div class="table-name">${tableName}</div>
              <div class="table-rows">${typeof rowCount === 'number' ? '~' + rowCount.toLocaleString() + ' rows' : 'Click to load'}</div>
            </div>
          `;
        }).join('');
    } catch (err) {
        console.error('Failed to fetch tables', err);
        document.getElementById('tables-grid').innerHTML = '<p style="color: var(--error);">Failed to load tables</p>';
    }

    // Connection info
    document.getElementById('connection-info-panel').innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
          <div><label>Type</label><p style="margin-top: 0.25rem;">${type}</p></div>
          <div><label>Status</label><p style="margin-top: 0.25rem; color: var(--success);">● Connected</p></div>
          <div><label>Created</label><p style="margin-top: 0.25rem;">Just now</p></div>
          <div><label>Last Used</label><p style="margin-top: 0.25rem;">Never</p></div>
        </div>
      `;
}

// Modal
function openModal() {
    document.getElementById('modal-overlay').classList.add('active');
    selectedType = null;
    document.getElementById('form-fields').classList.add('hidden');
    document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('selected'));
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.getElementById('connection-form').reset();
    document.getElementById('message').innerHTML = '';
}

document.getElementById('add-connection-btn').addEventListener('click', openModal);
document.getElementById('add-first-btn').addEventListener('click', openModal);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
});

// Inline Table View with Pagination
let currentTableName = '';
let currentColumns = [];
let currentTotalRows = 0;
let currentPage = 1;
let rowsPerPage = 25;

async function openTablePreview(tableName) {
    currentTableName = tableName;
    currentPage = 1;

    // Hide tables panel, show table data panel
    document.getElementById('tables-panel').classList.add('hidden');
    document.getElementById('connection-panel').classList.add('hidden');
    document.getElementById('table-data-panel').classList.remove('hidden');

    document.getElementById('viewing-table-name').textContent = tableName;
    document.getElementById('viewing-table-rows').textContent = 'Loading...';
    document.getElementById('inline-table').innerHTML = '<tbody><tr><td style="padding: 2rem; text-align: center; color: var(--text-muted);">Loading data...</td></tr></tbody>';
    document.getElementById('pagination-controls').innerHTML = '';

    await loadTableData();
}

async function loadTableData() {
    if (!selectedConnection) return;

    try {
        const url = `/api/connections/${encodeURIComponent(selectedConnection.name)}/tables/${encodeURIComponent(currentTableName)}/data?page=${currentPage}&limit=${rowsPerPage}`;
        console.log('Fetching table data:', url);

        const res = await fetch(url);

        // Check for 404 or other HTTP errors
        if (!res.ok) {
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error(`Server API not found (404 HTML response). Please restart the server.`);
            }
            const text = await res.text();
            throw new Error(`Server returned ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to load data');
        }

        currentColumns = data.columns || [];
        currentTotalRows = data.pagination?.totalRows || 0;
        const rows = data.rows || [];
        const pagination = data.pagination || {};

        document.getElementById('viewing-table-rows').textContent = `${currentTotalRows.toLocaleString()} rows`;

        // Render table
        if (rows.length === 0) {
            document.getElementById('inline-table').innerHTML = '<tbody><tr><td style="padding: 2rem; text-align: center; color: var(--text-muted);">No data found</td></tr></tbody>';
        } else {
            const tableHtml = `
            <thead>
              <tr>${currentColumns.map(col => `<th>${col}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>${currentColumns.map(col => `<td>${row[col] !== null && row[col] !== undefined ? row[col] : ''}</td>`).join('')}</tr>
              `).join('')}
            </tbody>
          `;
            document.getElementById('inline-table').innerHTML = tableHtml;
        }

        // Render pagination
        const totalPages = pagination.totalPages || 1;
        const startIdx = pagination.startIdx || 1;
        const endIdx = pagination.endIdx || rows.length;

        const paginationHtml = `
          <div class="rows-per-page">
            Show 
            <select onchange="changeRowsPerPage(this.value)">
              <option value="10" ${rowsPerPage === 10 ? 'selected' : ''}>10</option>
              <option value="25" ${rowsPerPage === 25 ? 'selected' : ''}>25</option>
              <option value="50" ${rowsPerPage === 50 ? 'selected' : ''}>50</option>
              <option value="100" ${rowsPerPage === 100 ? 'selected' : ''}>100</option>
            </select>
            rows
          </div>
          <div class="pagination">
            <button class="page-btn" onclick="goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>First</button>
            <button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>
            <span class="page-info">Page ${currentPage} of ${totalPages} (${startIdx}-${endIdx} of ${currentTotalRows})</span>
            <button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>Next</button>
            <button class="page-btn" onclick="goToPage(${totalPages})" ${currentPage >= totalPages ? 'disabled' : ''}>Last</button>
          </div>
        `;
        document.getElementById('pagination-controls').innerHTML = paginationHtml;

    } catch (err) {
        console.error('Failed to load table data', err);
        document.getElementById('inline-table').innerHTML = `<tbody><tr><td style="padding: 2rem; text-align: center; color: var(--error);">Error: ${err.message}</td></tr></tbody>`;
        document.getElementById('viewing-table-rows').textContent = 'Error';
    }
}

function goToPage(page) {
    currentPage = page;
    loadTableData();
}

function changeRowsPerPage(value) {
    rowsPerPage = parseInt(value);
    currentPage = 1;
    loadTableData();
}

function closeTablePreview() {
    document.getElementById('table-data-panel').classList.add('hidden');
    document.getElementById('tables-panel').classList.remove('hidden');
    document.getElementById('connection-panel').classList.remove('hidden');
}

document.getElementById('back-to-tables').addEventListener('click', closeTablePreview);

// Help Modal
function openHelpModal(type) {
    const help = helpInstructions[type];
    if (!help) return;

    document.getElementById('help-title').textContent = help.title;
    document.getElementById('help-content').innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${help.steps.map(step => `
            <div style="background: var(--border-light); padding: 0.875rem 1rem; border-radius: 8px; font-size: 0.875rem; line-height: 1.5;">
              ${step}
            </div>
          `).join('')}
        </div>
      `;
    document.getElementById('help-modal-overlay').classList.add('active');
}

function closeHelpModal() {
    document.getElementById('help-modal-overlay').classList.remove('active');
}

document.getElementById('help-modal-close').addEventListener('click', closeHelpModal);
document.getElementById('help-modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'help-modal-overlay') closeHelpModal();
});

// Help button clicks
document.querySelectorAll('.help-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openHelpModal(btn.dataset.type);
    });
});

// Source selection
document.querySelectorAll('.source-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedType = btn.dataset.type;

        document.getElementById('form-fields').classList.remove('hidden');

        // Hide all type-specific fields
        ['db-fields', 'shopify-fields', 'bigquery-fields', 'snowflake-fields', 'csv-fields'].forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });

        // Show relevant fields
        if (['mysql', 'postgresql'].includes(selectedType)) {
            document.getElementById('db-fields').classList.remove('hidden');
            document.getElementById('conn-port').value = selectedType === 'mysql' ? '3306' : '5432';
        } else if (selectedType === 'shopify') {
            document.getElementById('shopify-fields').classList.remove('hidden');
        } else if (selectedType === 'bigquery') {
            document.getElementById('bigquery-fields').classList.remove('hidden');
        } else if (selectedType === 'snowflake') {
            document.getElementById('snowflake-fields').classList.remove('hidden');
        } else if (selectedType === 'csv') {
            document.getElementById('csv-fields').classList.remove('hidden');
        }
    });
});

// Test connection
document.getElementById('test-btn').addEventListener('click', async () => {
    const msg = document.getElementById('message');
    msg.className = 'message';
    msg.innerHTML = 'Testing...';

    const res = await fetch('/api/connections/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getFormData())
    });
    const data = await res.json();
    msg.className = data.success ? 'message success' : 'message error';
    msg.innerHTML = data.success ? '✓ ' + data.message : '✗ ' + data.error;
});

// Save connection
document.getElementById('connection-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getFormData())
    });
    const data = await res.json();

    if (data.success) {
        closeModal();
        loadConnections();
    } else {
        const msg = document.getElementById('message');
        msg.className = 'message error';
        msg.innerHTML = '✗ ' + data.error;
    }
});

// Delete connection
document.getElementById('delete-btn').addEventListener('click', async () => {
    if (!selectedConnection || !confirm(`Delete "${selectedConnection.name}"?`)) return;

    await fetch(`/api/connections/${selectedConnection.name}`, { method: 'DELETE' });
    selectedConnection = null;
    showNoSelection();
    loadConnections();
});

// Get form data
function getFormData() {
    const data = { name: document.getElementById('conn-name').value, type: selectedType };

    if (['mysql', 'postgresql'].includes(selectedType)) {
        Object.assign(data, {
            host: document.getElementById('conn-host').value,
            port: parseInt(document.getElementById('conn-port').value) || undefined,
            user: document.getElementById('conn-user').value,
            password: document.getElementById('conn-password').value,
            database: document.getElementById('conn-database').value
        });
    } else if (selectedType === 'shopify') {
        Object.assign(data, {
            store: document.getElementById('conn-store').value,
            apiKey: document.getElementById('conn-apikey').value,
            apiSecret: document.getElementById('conn-apisecret').value
        });
    } else if (selectedType === 'bigquery') {
        Object.assign(data, {
            projectId: document.getElementById('conn-project').value,
            keyFile: document.getElementById('conn-keyfile').value
        });
    } else if (selectedType === 'snowflake') {
        Object.assign(data, {
            account: document.getElementById('conn-account').value,
            warehouse: document.getElementById('conn-warehouse').value,
            user: document.getElementById('conn-sf-user').value,
            password: document.getElementById('conn-sf-password').value
        });
    } else if (selectedType === 'csv') {
        data.filePath = document.getElementById('conn-filepath').value;
    }

    return data;
}

// Initial load
loadConnections();
