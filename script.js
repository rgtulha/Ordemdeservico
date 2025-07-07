document.addEventListener('DOMContentLoaded', () => {
    console.log('SCRIPT: DOMContentLoaded event fired. Starting script execution.');

    // --- Seletores de Elementos do DOM ---

    // Cabeçalho e OS
    const osNumberDisplay = document.getElementById('os-number-display');
    const printBtn = document.getElementById('printBtn');

    // Seções principais
    const clientDataSection = document.getElementById('client-data-section');
    const aparelhoProblemaSection = document.getElementById('aparelho-problema-section');
    const totalValueSection = document.getElementById('total-value-section');
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

    // NOVO: Valor Total do Serviço
    const valorTotalInput = document.getElementById('valor-total');

    // Modal Listar/Gerenciar Clientes (Unificado)
    const listClientsBtn = document.getElementById('listClientsBtn');
    const listClientsModal = document.getElementById('listClientsModal');
    const closeListClientsModalBtn = listClientsModal.querySelector('.close-button');
    const clientListSearchInput = document.getElementById('client-list-search');
    const clientsTable = document.getElementById('clients-table');
    const clientListArea = document.getElementById('client-list-area');

    // Área para ADICIONAR NOVO Cliente (dentro do Modal Listar/Gerenciar)
    const addNewClientFromListBtn = document.getElementById('addNewClientFromListBtn');
    const clientAddArea = document.getElementById('client-add-area');
    const addModalClienteNome = document.getElementById('add-modal-cliente-nome');
    const addModalClienteCnpj = document.getElementById('add-modal-cliente-cnpj');
    const addModalClienteContato = document.getElementById('add-modal-cliente-contato');
    const addModalClienteEndereco = document.getElementById('add-modal-cliente-endereco');
    const saveNewClientBtn = document.getElementById('saveNewClientBtn');
    const cancelAddClientBtn = document.getElementById('cancelAddClientBtn');

    // Área de Edição (dentro do Modal Listar/Gerenciar)
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
    let currentClientBeingEdited = null; // Para armazenar o normalizedName do cliente sendo editado

    console.log('SCRIPT: All DOM elements selected.');

    // --- Configuração e Inicialização do Firebase ---
    // ATENÇÃO: SUBSTITUA ESSAS CHAVES PELAS DO SEU PROJETO FIREBASE!
    const firebaseConfig = {
        apiKey: "AIzaSyCmUoU3I9VXjL7YbT95EfUSBnxX3ZzXTII", // SEU API KEY
        authDomain: "ordemservico-6ddca.firebaseapp.com", // SEU AUTH DOMAIN
        projectId: "ordemservico-6ddca", // SEU PROJECT ID
        storageBucket: "ordemservico-6ddca.appspot.com", // SEU STORAGE BUCKET
        messagingSenderId: "377095307784", // SEU MESSAGING SENDER ID
        appId: "1:377095307784:web:4ce3007e49657bf3a607bd" // SEU APP ID
    };

    try {
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const auth = firebase.auth();
        console.log('SCRIPT: Firebase initialized successfully.');
    } catch (error) {
        console.error('SCRIPT ERROR: Failed to initialize Firebase.', error);
        alert('Erro crítico: Falha ao inicializar o Firebase. Verifique suas credenciais no script.js e o console para detalhes.');
        return; // Impede que o restante do script seja executado se o Firebase não inicializar
    }
    
    // As variáveis db e auth agora precisam ser declaradas globalmente ou passadas.
    // Para simplificar, vou redeclarar as que usam 'const' acima e remover o 'const' aqui.
    // Ou, uma abordagem mais limpa seria:
    const db = firebase.firestore(); // Garantir que são const fora do try-catch
    const auth = firebase.auth();    // se o try-catch for só para o initializeApp.

    // Isso é uma medida de segurança caso o try-catch acima não retorne.
    // Se o initializeApp falhar e não der return, as variáveis db e auth não existirão.
    // Assumindo que o `return` acima funciona, o código continua.
    // Para garantir, o melhor seria:
    // let db;
    // let auth;
    // try { firebase.initializeApp(...) db = firebase.firestore(); auth = firebase.auth(); } catch(...)

    // Por simplicidade, vou manter como está e contar com o `return`.


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

    // Função para limpar os campos do cliente no formulário principal
    const clearClientFields = () => {
        clienteNomeInput.value = '';
        clienteCnpjInput.value = '';
        clienteContatoInput.value = '';
        clienteEnderecoInput.value = '';
    };

    // Função para definir o estado somente leitura dos campos do cliente (CNPJ, Contato, Endereço)
    const setClientFieldsReadonly = (readonly = false) => {
        clienteCnpjInput.readOnly = readonly;
        clienteContatoInput.readOnly = readonly;
        clienteEnderecoInput.readOnly = readonly;
    };
    
    // Função para preencher os campos do cliente (reutilizável)
    const populateClientFields = (clientData) => {
        console.log('TRACE: Dados recebidos em populateClientFields:', clientData);
        clienteCnpjInput.value = clientData.cnpj || '';
        clienteContatoInput.value = clientData.contato || '';
        clienteEnderecoInput.value = clientData.endereco || '';
        setClientFieldsReadonly(true); // Define como somente leitura APÓS o preenchimento
    };

    // --- Lógica Principal da Aplicação ---
    console.log('SCRIPT: Generating OS number and setting print button listener.');
    // Geração da O.S. ao carregar
    const initialOsNumber = generateOsNumber();
    if (osNumberDisplay) {
        osNumberDisplay.textContent = initialOsNumber;
        document.title = `SUPPORTA O.S: ${initialOsNumber}`;
        console.log(`SCRIPT: OS number generated: ${initialOsNumber}`);
    } else {
        console.error('SCRIPT ERROR: osNumberDisplay element not found!');
    }

    if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
        console.log('SCRIPT: Print button listener attached.');
    } else {
        console.error('SCRIPT ERROR: printBtn element not found!');
    }


    // --- Lógica de Autenticação ---
    const updateUI = (user) => {
        console.log('SCRIPT: updateUI called. User:', user ? user.email : 'null');
        const sections = [
            clientDataSection,
            aparelhoProblemaSection,
            totalValueSection,
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

    // Este listener só deve ser anexado após a inicialização bem-sucedida do Firebase
    auth.onAuthStateChanged(updateUI);
    console.log('SCRIPT: Firebase auth state listener attached.');

    // FUNÇÃO PARA ABRIR QUALQUER MODAL
    const openModal = (modalElement) => {
        if (modalElement) {
            modalElement.classList.add('active');
            modalElement.querySelector('input, select, textarea')?.focus();
            console.log(`SCRIPT: Modal '${modalElement.id}' opened.`);
        } else {
            console.error('SCRIPT ERROR: Attempted to open a null modal element.');
        }
    };

    // FUNÇÃO PARA FECHAR QUALQUER MODAL
    const closeAllModals = () => {
        if (authModal) authModal.classList.remove('active');
        if (listClientsModal) listClientsModal.classList.remove('active');
        console.log('SCRIPT: All modals closed.');
    };

    // Event Listeners para abrir modais
    if (accessAuthBtn) {
        accessAuthBtn.addEventListener('click', () => {
            console.log('SCRIPT: Access Auth Button clicked.');
            openModal(authModal);
            if (authEmailInput) authEmailInput.value = '';
            if (authPasswordInput) authPasswordInput.value = '';
        });
    } else {
        console.error('SCRIPT ERROR: accessAuthBtn element not found!');
    }

    if (listClientsBtn) {
        listClientsBtn.addEventListener('click', () => {
            if (!auth.currentUser) return alert('Faça login para gerenciar clientes.');
            console.log('SCRIPT: List Clients Button clicked.');
            openModal(listClientsModal);
            if (clientListArea) clientListArea.style.display = 'block';
            if (clientAddArea) clientAddArea.style.display = 'none';
            if (clientEditArea) clientEditArea.style.display = 'none';
            if (clientListSearchInput) clientListSearchInput.value = '';
            loadClientsList();
        });
    } else {
        console.error('SCRIPT ERROR: listClientsBtn element not found!');
    }

    // Event Listeners para fechar modais
    if (closeAuthModalBtn) {
        closeAuthModalBtn.addEventListener('click', closeAllModals);
    } else {
        console.error('SCRIPT ERROR: closeAuthModalBtn element not found!');
    }
    if (closeListClientsModalBtn) {
        closeListClientsModalBtn.addEventListener('click', closeAllModals);
    } else {
        console.error('SCRIPT ERROR: closeListClientsModalBtn element not found!');
    }

    window.addEventListener('click', (event) => {
        if (authModal && event.target === authModal || listClientsModal && event.target === listClientsModal) {
            closeAllModals();
        }
        if (clienteNomeInput && suggestionsContainer && !clienteNomeInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await auth.signOut();
                alert('Logout realizado com sucesso!');
                clearClientFields();
                setClientFieldsReadonly(true);
                document.getElementById('aparelho-marca-modelo').value = '';
                document.getElementById('aparelho-imei').value = '';
                document.getElementById('observacoes-cliente').value = '';
                document.getElementById('problema-tecnico').value = '';
                document.getElementById('garantia-peca').value = '';
                valorTotalInput.value = '';
                console.log('SCRIPT: Logout successful.');
            } catch (error) {
                console.error("SCRIPT ERROR: Erro ao fazer logout:", error);
                alert(`Erro ao fazer logout: ${error.message}`);
            }
        });
    } else {
        console.error('SCRIPT ERROR: logoutBtn element not found!');
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', async () => {
            const email = authEmailInput.value;
            const password = authPasswordInput.value;
            try {
                await auth.createUserWithEmailAndPassword(email, password);
                alert('Usuário cadastrado e logado com sucesso!');
                closeAllModals();
                console.log('SCRIPT: User registered and logged in.');
            } catch (error) {
                console.error("SCRIPT ERROR: Erro ao cadastrar:", error);
                alert(`Erro ao cadastrar: ${error.message}`);
            }
        });
    } else {
        console.error('SCRIPT ERROR: registerBtn element not found!');
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const email = authEmailInput.value;
            const password = authPasswordInput.value;
            try {
                await auth.signInWithEmailAndPassword(email, password);
                alert('Login realizado com sucesso!');
                closeAllModals();
                console.log('SCRIPT: User logged in.');
            } catch (error) {
                console.error("SCRIPT ERROR: Erro ao fazer login:", error);
                alert(`Erro ao fazer login: ${error.message}`);
            }
        });
    } else {
        console.error('SCRIPT ERROR: loginBtn element not found!');
    }

    // --- Lógica de Busca de Cliente (Campo Principal) ---
    const searchClients = async (searchText) => {
        if (!auth.currentUser) return;
        const normalizedSearchText = searchText.toLowerCase();
        try {
            const snapshot = await db.collection('clientes')
                .where('normalizedName', '>=', normalizedSearchText)
                .where('normalizedName', '<=', normalizedSearchText + '\uF8FF')
                .limit(5)
                .get();
            displaySuggestions(snapshot.docs.map(doc => doc.data()));
        } catch (error) {
            console.error("SCRIPT ERROR: Erro ao buscar clientes:", error);
        }
    };

    const displaySuggestions = (clients) => {
        if (suggestionsList) {
            suggestionsList.innerHTML = '';
            if (clients.length > 0) {
                clients.forEach(client => {
                    const li = document.createElement('li');
                    li.textContent = client.nome;
                    li.addEventListener('click', () => {
                        if (clienteNomeInput) clienteNomeInput.value = client.nome;
                        populateClientFields(client);
                        if (suggestionsContainer) suggestionsContainer.style.display = 'none';
                    });
                    suggestionsList.appendChild(li);
                });
                if (suggestionsContainer) suggestionsContainer.style.display = 'block';
            } else {
                if (suggestionsContainer) suggestionsContainer.style.display = 'none';
            }
        } else {
            console.error('SCRIPT ERROR: suggestionsList element not found in displaySuggestions!');
        }
    };

    if (clienteNomeInput) {
        clienteNomeInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const searchText = clienteNomeInput.value.trim();
            if (searchText.length > 0) {
                searchTimeout = setTimeout(() => searchClients(searchText), 300);
                setClientFieldsReadonly(false);
            } else {
                if (suggestionsContainer) suggestionsContainer.style.display = 'none';
                clearClientFields();
                setClientFieldsReadonly(true);
            }
        });
    } else {
        console.error('SCRIPT ERROR: clienteNomeInput element not found!');
    }

    // --- Lógica do Modal "Gerenciar Clientes" (Listar, Adicionar, Editar) ---
    if (clientListSearchInput) {
        clientListSearchInput.addEventListener('input', () => {
            clearTimeout(listSearchTimeout);
            const searchTerm = clientListSearchInput.value.trim();
            listSearchTimeout = setTimeout(() => loadClientsList(searchTerm), 300);
        });
    } else {
        console.error('SCRIPT ERROR: clientListSearchInput element not found!');
    }

    const loadClientsList = async (searchTerm = '') => {
        if (!auth.currentUser) {
            if (clientsTable) clientsTable.innerHTML = '<li>Faça login para ver os clientes.</li>';
            return;
        }

        if (clientsTable) clientsTable.innerHTML = '<li>Carregando...</li>';
        try {
            let query = db.collection('clientes').orderBy('normalizedName');
            if (searchTerm) {
                const normalizedTerm = searchTerm.toLowerCase();
                query = query.where('normalizedName', '>=', normalizedTerm)
                             .where('normalizedName', '<=', normalizedTerm + '\uF8FF');
            }
            const snapshot = await query.get();
            if (clientsTable) clientsTable.innerHTML = '';

            if (snapshot.empty) {
                if (clientsTable) clientsTable.innerHTML = '<li>Nenhum cliente encontrado.</li>';
                return;
            }

            snapshot.forEach(doc => {
                const client = doc.data();
                console.log('TRACE: Cliente carregado do Firebase:', client);
                const li = document.createElement('li');
                li.className = 'clients-table-row';
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
                if (clientsTable) clientsTable.appendChild(li);
            });

            addEventListenersToClientList();

        } catch (error) {
            console.error("SCRIPT ERROR: Erro ao carregar lista de clientes:", error);
            if (clientsTable) clientsTable.innerHTML = '<li>Erro ao carregar clientes.</li>';
        }
    };

    const addEventListenersToClientList = () => {
        if (clientsTable) {
            clientsTable.querySelectorAll('.clients-table-row').forEach(row => {
                const clientId = row.dataset.id;
                
                row.querySelector('.select-btn')?.addEventListener('click', () => {
                    selectClientAndFillForm(row.dataset);
                });
                row.querySelector('.edit-btn')?.addEventListener('click', () => {
                    editClient(clientId, row.dataset);
                });
                row.querySelector('.delete-btn')?.addEventListener('click', () => {
                    deleteClient(clientId);
                });
            });
        } else {
            console.error('SCRIPT ERROR: clientsTable element not found in addEventListenersToClientList!');
        }
    };

    // FUNÇÃO PARA SELECIONAR CLIENTE E PREENCHER FORMULÁRIO PRINCIPAL
    const selectClientAndFillForm = (clientData) => {
        console.log('TRACE: Dados do cliente recebidos para seleção:', clientData);
        if (clienteNomeInput) clienteNomeInput.value = clientData.nome;
        populateClientFields(clientData);
        closeAllModals();
    };

    // --- Lógica para ADICIONAR NOVO Cliente (dentro do Modal Gerenciar) ---
    if (addNewClientFromListBtn) {
        addNewClientFromListBtn.addEventListener('click', () => {
            if (clientListArea) clientListArea.style.display = 'none';
            if (clientEditArea) clientEditArea.style.display = 'none';
            if (clientAddArea) clientAddArea.style.display = 'block';
            if (addModalClienteNome) addModalClienteNome.value = '';
            if (addModalClienteCnpj) addModalClienteCnpj.value = '';
            if (addModalClienteContato) addModalClienteContato.value = '';
            if (addModalClienteEndereco) addModalClienteEndereco.value = '';
            if (addModalClienteNome) addModalClienteNome.focus();
        });
    } else {
        console.error('SCRIPT ERROR: addNewClientFromListBtn element not found!');
    }

    if (saveNewClientBtn) {
        saveNewClientBtn.addEventListener('click', async () => {
            if (!auth.currentUser) return alert('Você precisa estar logado para salvar um cliente.');
            
            const nomeOriginal = addModalClienteNome.value.trim();
            if (!nomeOriginal) return alert('O "Nome da Empresa" é obrigatório!');
            
            const normalizedName = nomeOriginal.toLowerCase();
            const clientData = {
                nome: nomeOriginal,
                normalizedName: normalizedName,
                cnpj: addModalClienteCnpj.value.trim(),
                contato: addModalClienteContato.value.trim(),
                endereco: addModalClienteEndereco.value.trim(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                addedBy: auth.currentUser.email
            };

            try {
                await db.collection('clientes').doc(normalizedName).set(clientData);
                alert(`Cliente "${nomeOriginal}" salvo com sucesso!`);
                
                if (clientAddArea) clientAddArea.style.display = 'none';
                if (clientListArea) clientListArea.style.display = 'block';
                loadClientsList();
            } catch (error) {
                console.error("SCRIPT ERROR: Erro ao salvar cliente:", error);
                alert("Erro ao salvar cliente. Verifique o console para mais detalhes. Certifique-se de estar logado e com permissão.");
            }
        });
    } else {
        console.error('SCRIPT ERROR: saveNewClientBtn element not found!');
    }

    if (cancelAddClientBtn) {
        cancelAddClientBtn.addEventListener('click', () => {
            if (clientAddArea) clientAddArea.style.display = 'none';
            if (clientListArea) clientListArea.style.display = 'block';
        });
    } else {
        console.error('SCRIPT ERROR: cancelAddClientBtn element not found!');
    }


    // --- Lógica para EDITAR Cliente (dentro do Modal Gerenciar) ---
    const editClient = (clientId, clientData) => {
        currentClientBeingEdited = clientId;
        if (editModalClienteNome) editModalClienteNome.value = clientData.nome;
        if (editModalClienteCnpj) editModalClienteCnpj.value = clientData.cnpj;
        if (editModalClienteContato) editModalClienteContato.value = clientData.contato;
        if (editModalClienteEndereco) editModalClienteEndereco.value = clientData.endereco;
        
        if (clientListArea) clientListArea.style.display = 'none';
        if (clientAddArea) clientAddArea.style.display = 'none';
        if (clientEditArea) clientEditArea.style.display = 'block';
        if (editModalClienteNome) editModalClienteNome.focus();
    };

    if (updateClientModalBtn) {
        updateClientModalBtn.addEventListener('click', async () => {
            if (!auth.currentUser || !currentClientBeingEdited) {
                alert('Erro: Nenhum cliente selecionado para atualização ou você não está logado.');
                return;
            }

            const originalNormalizedName = currentClientBeingEdited;
            const newNome = editModalClienteNome.value.trim();
            const newNormalizedName = newNome.toLowerCase();
            const newCnpj = editModalClienteCnpj.value.trim();
            const newContato = editModalClienteContato.value.trim();
            const newEndereco = editModalClienteEndereco.value.trim();

            if (!newNome) {
                alert('O "Nome da Empresa" é obrigatório!');
                return;
            }

            const clientUpdateData = {
                nome: newNome,
                normalizedName: newNormalizedName,
                cnpj: newCnpj,
                contato: newContato,
                endereco: newEndereco,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                addedBy: auth.currentUser.email
            };

            try {
                if (originalNormalizedName !== newNormalizedName) {
                    const batch = db.batch();
                    batch.set(db.collection('clientes').doc(newNormalizedName), clientUpdateData);
                    batch.delete(db.collection('clientes').doc(originalNormalizedName));
                    await batch.commit();
                    alert(`Cliente "${newNome}" atualizado e movido com sucesso!`);
                } else {
                    await db.collection('clientes').doc(originalNormalizedName).update(clientUpdateData);
                    alert(`Cliente "${newNome}" atualizado com sucesso!`);
                }

                if (clientEditArea) clientEditArea.style.display = 'none';
                if (clientListArea) clientListArea.style.display = 'block';
                currentClientBeingEdited = null;
                loadClientsList();

            } catch (error) {
                console.error("SCRIPT ERROR: Erro ao atualizar cliente:", error);
                alert("Erro ao atualizar cliente. Verifique o console para mais detalhes.");
            }
        });
    } else {
        console.error('SCRIPT ERROR: updateClientModalBtn element not found!');
    }

    if (cancelEditClientBtn) {
        cancelEditClientBtn.addEventListener('click', () => {
            if (clientEditArea) clientEditArea.style.display = 'none';
            if (clientListArea) clientListArea.style.display = 'block';
            currentClientBeingEdited = null;
        });
    } else {
        console.error('SCRIPT ERROR: cancelEditClientBtn element not found!');
    }

    // --- Lógica para EXCLUIR Cliente (dentro do Modal Gerenciar) ---
    const deleteClient = async (clientId) => {
        if (!auth.currentUser) {
            alert('Faça login para excluir clientes.');
            return;
        }

        if (confirm(`Tem certeza que deseja excluir o cliente "${clientId}"? Esta ação não pode ser desfeita.`)) {
            try {
                await db.collection('clientes').doc(clientId).delete();
                alert('Cliente excluído com sucesso!');
                loadClientsList();
            } catch (error) {
                console.error("SCRIPT ERROR: Erro ao excluir cliente:", error);
                alert("Erro ao excluir cliente. Verifique o console para mais detalhes.");
            }
        }
    };

    console.log('SCRIPT: All event listeners attached.');
});
