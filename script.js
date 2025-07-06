document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores de Elementos do DOM ---

    // Cabeçalho e OS
    const osNumberDisplay = document.getElementById('os-number-display');
    const printBtn = document.getElementById('printBtn');

    // Seções principais
    const clientDataSection = document.getElementById('client-data-section');
    const aparelhoProblemaSection = document.getElementById('aparelho-problema-section');
    const garantiaSection = document.getElementById('garantia-section');
    const observacoesSection = document.getElementById('observacoes-section');
    const footerButtons = document.getElementById('footer-buttons');

    // Autenticação
    const accessAuthBtn = document.getElementById('accessAuthBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const authStatus = document.getElementById('auth-status');
    const authModal = document.getElementById('authModal');
    const closeAuthModalBtn = authModal.querySelector('.close-button');
    const authEmailInput = document.getElementById('auth-email');
    const authPasswordInput = document.getElementById('auth-password');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    // Dados do Cliente (Formulário Principal)
    const clienteNomeInput = document.getElementById('cliente-nome');
    const clienteCnpjInput = document.getElementById('cliente-cnpj');
    const clienteContatoInput = document.getElementById('cliente-contato');
    const clienteEnderecoInput = document.getElementById('cliente-endereco');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const suggestionsList = document.getElementById('suggestions-list');

    // Modal Adicionar Cliente
    const addClientBtn = document.getElementById('addClientBtn');
    const addClientModal = document.getElementById('addClientModal');
    const closeAddClientModalBtn = addClientModal.querySelector('.close-button');
    const modalClienteNome = document.getElementById('modal-cliente-nome');
    const modalClienteCnpj = document.getElementById('modal-cliente-cnpj');
    const modalClienteContato = document.getElementById('modal-cliente-contato');
    const modalClienteEndereco = document.getElementById('modal-cliente-endereco');
    const saveClientModalBtn = document.getElementById('saveClientModalBtn');

    // Modal Listar/Gerenciar Clientes
    const listClientsBtn = document.getElementById('listClientsBtn');
    const listClientsModal = document.getElementById('listClientsModal');
    const closeListClientsModalBtn = listClientsModal.querySelector('.close-button');
    const clientListSearchInput = document.getElementById('client-list-search');
    const clientsTable = document.getElementById('clients-table');
    const clientListArea = document.getElementById('client-list-area');

    // Área de Edição (dentro do Modal Listar)
    const clientEditArea = document.getElementById('client-edit-area');
    const editModalClienteNome = document.getElementById('edit-modal-cliente-nome');
    const editModalClienteCnpj = document.getElementById('edit-modal-cliente-cnpj');
    const editModalClienteContato = document.getElementById('edit-modal-cliente-contato');
    const editModalClienteEndereco = document.getElementById('edit-modal-cliente-endereco');
    const updateClientModalBtn = document.getElementById('updateClientModalBtn');
    const cancelEditClientBtn = document.getElementById('cancelEditClientBtn');

    // Variáveis de controle
    let searchTimeout;
    let listSearchTimeout;
    let currentClientBeingEdited = null;

    // --- Configuração e Inicialização do Firebase ---
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

    // --- Funções Auxiliares ---
    const formatDateAsDDMMYY = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}${month}${year}`;
    };

    const generateOsNumber = () => {
        const formattedDate = formatDateAsDDMMYY(new Date());
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        return `${formattedDate}${randomSuffix}`;
    };

    const resetClientFields = (readonly = false) => {
        clienteCnpjInput.value = '';
        clienteContatoInput.value = '';
        clienteEnderecoInput.value = '';
        clienteCnpjInput.readOnly = readonly;
        clienteContatoInput.readOnly = readonly;
        clienteEnderecoInput.readOnly = readonly;
    };

    const populateClientFields = (clientData) => {
        clienteCnpjInput.value = clientData.cnpj || '';
        clienteContatoInput.value = clientData.contato || '';
        clienteEnderecoInput.value = clientData.endereco || '';
        resetClientFields(true);
    };

    // --- Lógica Principal da Aplicação ---

    // Geração da O.S. ao carregar
    const initialOsNumber = generateOsNumber();
    osNumberDisplay.textContent = initialOsNumber;
    document.title = `SUPPORTA O.S: ${initialOsNumber}`;

    printBtn.addEventListener('click', () => window.print());

    // --- Lógica de Autenticação ---
    const updateUI = (user) => {
        const sections = [
            clientDataSection,
            aparelhoProblemaSection,
            garantiaSection,
            observacoesSection,
            footerButtons,
        ];
        if (user) {
            authStatus.textContent = `Logado como: ${user.email}`;
            accessAuthBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            sections.forEach(s => s.style.display = s.id === 'footer-buttons' ? 'flex' : 'block');
        } else {
            authStatus.textContent = 'Por favor, faça login para acessar a O.S.';
            accessAuthBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            sections.forEach(s => s.style.display = 'none');
        }
    };

    auth.onAuthStateChanged(updateUI);

    // FUNÇÃO PARA ABRIR QUALQUER MODAL
    const openModal = (modalElement) => {
        modalElement.classList.add('active');
        // Opcional: focar no primeiro input do modal
        modalElement.querySelector('input, select, textarea')?.focus();
    };

    // FUNÇÃO PARA FECHAR QUALQUER MODAL
    const closeAllModals = () => {
        authModal.classList.remove('active');
        addClientModal.classList.remove('active');
        listClientsModal.classList.remove('active');
    };

    // Event Listeners para abrir modais
    accessAuthBtn.addEventListener('click', () => {
        openModal(authModal);
        authEmailInput.value = '';
        authPasswordInput.value = '';
    });

    addClientBtn.addEventListener('click', () => {
        if (!auth.currentUser) return alert('Faça login para adicionar um cliente.');
        openModal(addClientModal);
        modalClienteNome.value = '';
        modalClienteCnpj.value = '';
        modalClienteContato.value = '';
        modalClienteEndereco.value = '';
    });

    listClientsBtn.addEventListener('click', () => {
        if (!auth.currentUser) return alert('Faça login para gerenciar clientes.');
        openModal(listClientsModal);
        clientListArea.style.display = 'block';
        clientEditArea.style.display = 'none';
        clientListSearchInput.value = '';
        loadClientsList();
    });

    // Event Listeners para fechar modais
    [closeAddClientModalBtn, closeAuthModalBtn, closeListClientsModalBtn].forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    window.addEventListener('click', (event) => {
        // Fechar modais ao clicar fora
        if (event.target === addClientModal || event.target === authModal || event.target === listClientsModal) {
            closeAllModals();
        }
        // Esconder sugestões de busca de cliente
        if (!clienteNomeInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });


    logoutBtn.addEventListener('click', async () => {
        try {
            await auth.signOut();
            alert('Logout realizado com sucesso!');
            // Limpa formulário (se houver um form com reset() nativo)
            document.querySelector('form')?.reset(); 
            clienteNomeInput.value = '';
            resetClientFields(true);
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
            alert(`Erro ao fazer logout: ${error.message}`);
        }
    });

    registerBtn.addEventListener('click', async () => {
        const email = authEmailInput.value;
        const password = authPasswordInput.value;
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            alert('Usuário cadastrado e logado com sucesso!');
            closeAllModals(); // Fecha o modal após o cadastro
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            alert(`Erro ao cadastrar: ${error.message}`);
        }
    });

    loginBtn.addEventListener('click', async () => {
        const email = authEmailInput.value;
        const password = authPasswordInput.value;
        try {
            await auth.signInWithEmailAndPassword(email, password);
            alert('Login realizado com sucesso!');
            closeAllModals(); // Fecha o modal após o login
        } catch (error) {
            console.error("Erro ao fazer login:", error);
            alert(`Erro ao fazer login: ${error.message}`);
        }
    });


    // --- Lógica de Busca de Cliente (Campo Principal) ---
    const searchClients = async (searchText) => {
        if (!auth.currentUser) return;
        const normalizedSearchText = searchText.toLowerCase();
        try {
            const snapshot = await db.collection('clientes')
                .where('normalizedName', '>=', normalizedSearchText)
                .where('normalizedName', '<=', normalizedSearchText + '\uf8ff')
                .limit(5)
                .get();
            displaySuggestions(snapshot.docs.map(doc => doc.data()));
        } catch (error) {
            console.error("Erro ao buscar clientes:", error);
        }
    };

    const displaySuggestions = (clients) => {
        suggestionsList.innerHTML = '';
        if (clients.length > 0) {
            clients.forEach(client => {
                const li = document.createElement('li');
                li.textContent = client.nome;
                li.addEventListener('click', () => {
                    clienteNomeInput.value = client.nome;
                    populateClientFields(client);
                    suggestionsContainer.style.display = 'none';
                });
                suggestionsList.appendChild(li);
            });
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    };

    clienteNomeInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const searchText = clienteNomeInput.value.trim();
        if (searchText.length > 0) {
            searchTimeout = setTimeout(() => searchClients(searchText), 300);
        } else {
            suggestionsContainer.style.display = 'none';
            resetClientFields(true);
        }
    });

    // --- Lógica do Modal "Adicionar Novo Cliente" ---
    saveClientModalBtn.addEventListener('click', async () => {
        if (!auth.currentUser) return alert('Você precisa estar logado.');
        const nomeOriginal = modalClienteNome.value.trim();
        if (!nomeOriginal) return alert('O "Nome da Empresa" é obrigatório!');
        
        const normalizedName = nomeOriginal.toLowerCase();
        const clientData = {
            nome: nomeOriginal,
            normalizedName: normalizedName,
            cnpj: modalClienteCnpj.value.trim(),
            contato: modalClienteContato.value.trim(),
            endereco: modalClienteEndereco.value.trim(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            addedBy: auth.currentUser.email
        };

        try {
            await db.collection('clientes').doc(normalizedName).set(clientData);
            alert(`Cliente "${nomeOriginal}" salvo com sucesso!`);
            closeAllModals(); // Fecha o modal após salvar
            clienteNomeInput.value = nomeOriginal;
            populateClientFields(clientData);
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            alert("Erro ao salvar cliente.");
        }
    });

    // --- LÓGICA CORRIGIDA: Modal "Gerenciar Clientes" ---
    clientListSearchInput.addEventListener('input', () => {
        clearTimeout(listSearchTimeout);
        const searchTerm = clientListSearchInput.value.trim();
        listSearchTimeout = setTimeout(() => loadClientsList(searchTerm), 300);
    });

    const loadClientsList = async (searchTerm = '') => {
        if (!auth.currentUser) {
            clientsTable.innerHTML = '<li>Faça login para ver os clientes.</li>';
            return;
        }

        clientsTable.innerHTML = '<li>Carregando...</li>';
        try {
            let query = db.collection('clientes').orderBy('normalizedName');
            if (searchTerm) {
                const normalizedTerm = searchTerm.toLowerCase();
                query = query.where('normalizedName', '>=', normalizedTerm)
                             .where('normalizedName', '<=', normalizedTerm + '\uf8ff');
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
                // Armazena todos os dados no dataset para fácil acesso
                li.dataset.id = doc.id;
                li.dataset.nome = client.nome;
                li.dataset.cnpj = client.cnpj || '';
                li.dataset.contato = client.contato || '';
                li.dataset.endereco = client.endereco || '';

                li.innerHTML = `
                    <span class="client-name-display">${client.nome}</span>
                    <div class="client-actions">
                        <button class="select-btn">Selecionar</button>
                        <button class="edit-btn">Editar</button>
                        <button class="delete-btn">Excluir</button>
                    </div>`;
                clientsTable.appendChild(li);
            });

            // Adiciona os event listeners após a criação dos elementos
            addEventListenersToClientList();

        } catch (error) {
            console.error("Erro ao carregar lista de clientes:", error);
            clientsTable.innerHTML = '<li>Erro ao carregar clientes.</li>';
        }
    };

    const addEventListenersToClientList = () => {
        clientsTable.querySelectorAll('.clients-table-row').forEach(row => {
            const clientId = row.dataset.id;
            
            // AÇÃO DE SELECIONAR (NOVO)
            row.querySelector('.select-btn').addEventListener('click', () => {
                selectClientAndFillForm(row.dataset);
            });
            // AÇÃO DE EDITAR
            row.querySelector('.edit-btn').addEventListener('click', () => {
                editClient(clientId, row.dataset);
            });
            // AÇÃO DE EXCLUIR
            row.querySelector('.delete-btn').addEventListener('click', () => {
                deleteClient(clientId);
            });
        });
    };

    // FUNÇÃO PARA SELECIONAR CLIENTE E PREENCHER FORMULÁRIO PRINCIPAL
    const selectClientAndFillForm = (clientData) => {
        clienteNomeInput.value = clientData.nome;
        populateClientFields(clientData);
        closeAllModals(); // Fecha o modal após a seleção
    };

    const editClient = (clientId, clientData) => {
        currentClientBeingEdited = clientId;
        editModalClienteNome.value = clientData.nome;
        editModalClienteCnpj.value = clientData.cnpj;
        editModalClienteContato.value = clientData.contato;
        editModalClienteEndereco.value = clientData.endereco;
        clientListArea.style.display = 'none';
        clientEditArea.style.display = 'block';
    };

    const deleteClient = async (clientId) => {
        if (!confirm(`Tem certeza que deseja excluir o cliente "${clientId}"? Esta ação não pode ser desfeita.`)) return;
        try {
            await db.collection('clientes').doc(clientId).delete();
            alert('Cliente excluído com sucesso!');
            loadClientsList(); // Recarrega a lista
        } catch (error) {
            console.error("Erro ao excluir cliente:", error);
            alert("Erro ao excluir cliente.");
        }
    };

    updateClientModalBtn.addEventListener('click', async () => {
        if (!currentClientBeingEdited) return;

        const newNome = editModalClienteNome.value.trim();
        if (!newNome) return alert('O nome é obrigatório.');

        const newNormalizedName = newNome.toLowerCase();
        const clientUpdateData = {
            nome: newNome,
            normalizedName: newNormalizedName,
            cnpj: editModalClienteCnpj.value.trim(),
            contato: editModalClienteContato.value.trim(),
            endereco: editModalClienteEndereco.value.trim(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        };

        try {
            // Se o nome (e normalizedName) mudou, precisamos apagar o antigo e criar um novo.
            if (currentClientBeingEdited !== newNormalizedName) {
                const batch = db.batch();
                const newDocRef = db.collection('clientes').doc(newNormalizedName);
                batch.set(newDocRef, clientUpdateData);
                const oldDocRef = db.collection('clientes').doc(currentClientBeingEdited);
                batch.delete(oldDocRef);
                await batch.commit();
            } else {
                await db.collection('clientes').doc(currentClientBeingEdited).update(clientUpdateData);
            }
            alert('Cliente atualizado com sucesso!');
            clientEditArea.style.display = 'none';
            clientListArea.style.display = 'block';
            loadClientsList();
        } catch (error) {
            console.error("Erro ao atualizar cliente:", error);
            alert("Erro ao atualizar cliente.");
        }
    });

    cancelEditClientBtn.addEventListener('click', () => {
        clientEditArea.style.display = 'none';
        clientListArea.style.display = 'block';
        currentClientBeingEdited = null;
    });

});
