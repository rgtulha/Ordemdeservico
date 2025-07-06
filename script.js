document.addEventListener('DOMContentLoaded', () => {
    const osNumberDisplay = document.getElementById('os-number-display');
    const printBtn = document.getElementById('printBtn');

    const clienteNomeInput = document.getElementById('cliente-nome');
    const clienteCnpjInput = document.getElementById('cliente-cnpj');
    const clienteContatoInput = document.getElementById('cliente-contato');
    const clienteEnderecoInput = document.getElementById('cliente-endereco');
    const addClientBtn = document.getElementById('addClientBtn');

    const addClientModal = document.getElementById('addClientModal');
    const closeAddClientModalBtn = addClientModal.querySelector('.close-button');
    const modalClienteNome = document.getElementById('modal-cliente-nome');
    const modalClienteCnpj = document.getElementById('modal-cliente-cnpj');
    const modalClienteContato = document.getElementById('modal-cliente-contato');
    const modalClienteEndereco = document.getElementById('modal-cliente-endereco');
    const saveClientModalBtn = document.getElementById('saveClientModalBtn');

    const authModal = document.getElementById('authModal');
    const closeAuthModalBtn = authModal.querySelector('.close-button');
    const authEmailInput = document.getElementById('auth-email');
    const authPasswordInput = document.getElementById('auth-password');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    const accessAuthBtn = document.getElementById('accessAuthBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const authStatus = document.getElementById('auth-status');

    const clientDataSection = document.getElementById('client-data-section');
    const aparelhoProblemaSection = document.getElementById('aparelho-problema-section');
    const garantiaSection = document.getElementById('garantia-section');
    const observacoesSection = document.getElementById('observacoes-section');
    const footerButtons = document.getElementById('footer-buttons');

    const suggestionsContainer = document.getElementById('suggestions-container');
    const suggestionsList = document.getElementById('suggestions-list');

    const listClientsBtn = document.getElementById('listClientsBtn');
    const listClientsModal = document.getElementById('listClientsModal');
    const closeListClientsModalBtn = listClientsModal.querySelector('.close-button');
    const clientsTable = document.getElementById('clients-table');
    const clientListSearchInput = document.getElementById('client-list-search');

    const clientListArea = document.getElementById('client-list-area');
    const clientEditArea = document.getElementById('client-edit-area');
    const editModalClienteNome = document.getElementById('edit-modal-cliente-nome');
    const editModalClienteCnpj = document.getElementById('edit-modal-cliente-cnpj');
    const editModalClienteContato = document.getElementById('edit-modal-cliente-contato');
    const editModalClienteEndereco = document.getElementById('edit-modal-cliente-endereco');
    const updateClientModalBtn = document.getElementById('updateClientModalBtn');
    const cancelEditClientBtn = document.getElementById('cancelEditClientBtn');

    let searchTimeout;
    let listSearchTimeout;
    let currentClientBeingEdited = null;

    const firebaseConfig = {
        apiKey: "AIzaSyCmUoU3I9VXjL7YbT95EfUSBnxX3ZzXTII",
        authDomain: "ordemservico-6ddca.firebaseapp.com",
        projectId: "ordemservico-6ddca",
        storageBucket: "ordemservico-6ddca.appspot.com",
        messagingSenderId: "377095307784",
        appId: "1:377095307784:web:4ce3007e49657bf3a607bd"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();

    function populateClientFields(clientData) {
        clienteNomeInput.value = clientData.nome || '';
        clienteCnpjInput.value = clientData.cnpj || '';
        clienteContatoInput.value = clientData.contato || '';
        clienteEnderecoInput.value = clientData.endereco || '';
        clienteCnpjInput.readOnly = true;
        clienteContatoInput.readOnly = true;
        clienteEnderecoInput.readOnly = true;
    }

    async function loadClientsList(searchTerm = '') {
        if (!auth.currentUser) {
            clientsTable.innerHTML = '<li>Faça login para ver a lista de clientes.</li>';
            return;
        }

        clientsTable.innerHTML = '<li>Carregando clientes...</li>';
        try {
            let query = db.collection('clientes').orderBy('normalizedName');

            if (searchTerm) {
                const normalizedSearchTerm = searchTerm.toLowerCase();
                query = query.where('normalizedName', '>=', normalizedSearchTerm)
                             .where('normalizedName', '<=', normalizedSearchTerm + '\uf8ff');
            }

            const snapshot = await query.get();
            clientsTable.innerHTML = '';

            if (snapshot.empty) {
                clientsTable.innerHTML = '<li>Nenhum cliente encontrado.</li>';
                return;
            }

            snapshot.forEach(doc => {
                const client = doc.data();
                const li = document.createElement('li');
                li.className = 'clients-table-row';
                li.innerHTML = `
                    <span class="client-name-display">${client.nome}</span>
                    <div class="client-actions">
                        <button class="use-btn" data-id="${client.normalizedName}">Usar</button>
                        <button class="edit-btn" data-id="${client.normalizedName}">Editar</button>
                        <button class="delete-btn" data-id="${client.normalizedName}">Excluir</button>
                    </div>
                `;
                clientsTable.appendChild(li);
            });

            clientsTable.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (e) => editClient(e.target.dataset.id));
            });
            clientsTable.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => deleteClient(e.target.dataset.id));
            });
            clientsTable.querySelectorAll('.use-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const clientId = e.target.dataset.id;
                    try {
                        const docRef = db.collection('clientes').doc(clientId);
                        const doc = await docRef.get();
                        if (doc.exists) {
                            const clientData = doc.data();
                            populateClientFields(clientData);
                            listClientsModal.style.display = 'none';
                        }
                    } catch (error) {
                        console.error('Erro ao selecionar cliente:', error);
                        alert('Erro ao selecionar cliente.');
                    }
                });
            });

        } catch (error) {
            console.error("Erro ao carregar lista de clientes:", error);
            clientsTable.innerHTML = '<li>Erro ao carregar clientes.</li>';
        }
    }

    listClientsBtn.addEventListener('click', () => {
        if (!auth.currentUser) {
            alert('Por favor, faça login para gerenciar clientes.');
            return;
        }
        listClientsModal.style.display = 'flex';
        clientListArea.style.display = 'block';
        clientEditArea.style.display = 'none';
        clientListSearchInput.value = '';
        loadClientsList();
    });

    closeListClientsModalBtn.addEventListener('click', () => {
        listClientsModal.style.display = 'none';
    });

    clientListSearchInput.addEventListener('input', () => {
        clearTimeout(listSearchTimeout);
        const searchTerm = clientListSearchInput.value.trim();
        listSearchTimeout = setTimeout(() => {
            loadClientsList(searchTerm);
        }, 300);
    });
});
