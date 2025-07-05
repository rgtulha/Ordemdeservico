document.addEventListener('DOMContentLoaded', () => {
    const osNumberDisplay = document.getElementById('os-number-display');
    const printBtn = document.getElementById('printBtn');

    // Campos do cliente no formulário principal
    const clienteNomeInput = document.getElementById('cliente-nome');
    const clienteCnpjInput = document.getElementById('cliente-cnpj');
    const clienteContatoInput = document.getElementById('cliente-contato');
    const clienteEnderecoInput = document.getElementById('cliente-endereco');
    const addClientBtn = document.getElementById('addClientBtn');

    // Elementos do Modal de Adicionar Cliente
    const addClientModal = document.getElementById('addClientModal');
    const closeAddClientModalBtn = addClientModal.querySelector('.close-button');
    const modalClienteNome = document.getElementById('modal-cliente-nome');
    const modalClienteCnpj = document.getElementById('modal-cliente-cnpj');
    const modalClienteContato = document.getElementById('modal-cliente-contato');
    const modalClienteEndereco = document.getElementById('modal-cliente-endereco');
    const saveClientModalBtn = document.getElementById('saveClientModalBtn');

    // Elementos do Modal de Autenticação
    const authModal = document.getElementById('authModal');
    const closeAuthModalBtn = authModal.querySelector('.close-button');
    const authEmailInput = document.getElementById('auth-email');
    const authPasswordInput = document.getElementById('auth-password');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    // Botões de Acesso e Logout na página principal
    const accessAuthBtn = document.getElementById('accessAuthBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const authStatus = document.getElementById('auth-status');

    // Seções da O.S. que só aparecem para usuários logados
    const clientDataSection = document.getElementById('client-data-section');
    const aparelhoProblemaSection = document.getElementById('aparelho-problema-section');
    const garantiaSection = document.getElementById('garantia-section');
    const observacoesSection = document.getElementById('observacoes-section');
    const footerButtons = document.getElementById('footer-buttons');

    // Elementos para a sugestão de pesquisa
    const suggestionsContainer = document.getElementById('suggestions-container');
    const suggestionsList = document.getElementById('suggestions-list');

    // NOVO: Elementos do modal de listar/gerenciar clientes
    const listClientsBtn = document.getElementById('listClientsBtn');
    const listClientsModal = document.getElementById('listClientsModal');
    const closeListClientsModalBtn = listClientsModal.querySelector('.close-button');
    const clientsTable = document.getElementById('clients-table'); // ul para a lista de clientes
    const clientListSearchInput = document.getElementById('client-list-search');

    // Elementos da área de edição dentro do modal de lista de clientes
    const clientListArea = document.getElementById('client-list-area');
    const clientEditArea = document.getElementById('client-edit-area');
    const editModalClienteNome = document.getElementById('edit-modal-cliente-nome');
    const editModalClienteCnpj = document.getElementById('edit-modal-cliente-cnpj');
    const editModalClienteContato = document.getElementById('edit-modal-cliente-contato');
    const editModalClienteEndereco = document.getElementById('edit-modal-cliente-endereco');
    const updateClientModalBtn = document.getElementById('updateClientModalBtn');
    const cancelEditClientBtn = document.getElementById('cancelEditClientBtn');

    let searchTimeout; // Variável para o debounce da busca (do campo principal)
    let listSearchTimeout; // Variável para o debounce da busca (da lista de clientes)
    let currentClientBeingEdited = null; // Para armazenar o normalizedName do cliente sendo editado

    // --- Configuração Firebase ---
    const firebaseConfig = {
        apiKey: "AIzaSyCmUoU3I9VXjL7YbT95EfUSBnxX3ZzXTII",
        authDomain: "ordemservico-6ddca.firebaseapp.com",
        projectId: "ordemservico-6ddca",
        storageBucket: "ordemservico-6ddca.firebasestorage.app",
        messagingSenderId: "377095307784",
        appId: "1:377095307784:web:4ce3007e49657bf3a607bd"
    };

    // Inicializa o Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();

    // --- Funções de Geração de OS ---
    function formatDateAsDDMMYY(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}${month}${year}`;
    }

    function generateOsNumber() {
        const now = new Date();
        const formattedDate = formatDateAsDDMMYY(now);
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        return `${formattedDate}${randomSuffix}`;
    }

    // Geração automática do número da OS ao carregar a página
    const initialOsNumber = generateOsNumber();
    osNumberDisplay.textContent = initialOsNumber;
    document.title = `SUPPORTA O.S: ${initialOsNumber}`;

    // --- Lógica para o botão de Imprimir ---
    printBtn.addEventListener('click', () => {
        window.print();
    });

    // --- Lógica de Autenticação ---
    function updateUI(user) {
        if (user) {
            authStatus.textContent = `Logado como: ${user.email}`;
            accessAuthBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';

            clientDataSection.style.display = 'block';
            aparelhoProblemaSection.style.display = 'block';
            garantiaSection.style.display = 'block';
            observacoesSection.style.display = 'block';
            footerButtons.style.display = 'flex';
        } else {
            authStatus.textContent = 'Por favor, faça login para acessar a O.S.';
            accessAuthBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';

            clientDataSection.style.display = 'none';
            aparelhoProblemaSection.style.display = 'none';
            garantiaSection.style.display = 'none';
            observacoesSection.style.display = 'none';
            footerButtons.style.display = 'none';
        }
    }

    accessAuthBtn.addEventListener('click', () => {
        authModal.style.display = 'flex';
        authEmailInput.value = '';
        authPasswordInput.value = '';
    });

    closeAuthModalBtn.addEventListener('click', () => {
        authModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        // Fecha o modal de autenticação clicando fora dele
        if (event.target == authModal) {
            authModal.style.display = 'none';
        }
        // Fecha as sugestões de busca se clicar fora do input ou da lista
        if (!clienteNomeInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
            suggestionsContainer.style.display = 'none';
        }
        // Fecha o modal de listar clientes se clicar fora dele
        if (event.target == listClientsModal) {
            listClientsModal.style.display = 'none';
        }
    });

    registerBtn.addEventListener('click', async () => {
        const email = authEmailInput.value;
        const password = authPasswordInput.value;
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            alert('Usuário cadastrado e logado com sucesso!');
            authModal.style.display = 'none';
        } catch (error) {
            console.error("Erro ao cadastrar:", error.code, error.message);
            alert(`Erro ao cadastrar: ${error.message}`);
        }
    });

    loginBtn.addEventListener('click', async () => {
        const email = authEmailInput.value;
        const password = authPasswordInput.value;
        try {
            await auth.signInWithEmailAndPassword(email, password);
            alert('Login realizado com sucesso!');
            authModal.style.display = 'none';
        } catch (error) {
            console.error("Erro ao fazer login:", error.code, error.message);
            alert(`Erro ao fazer login: ${error.message}`);
        }
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            await auth.signOut();
            alert('Logout realizado com sucesso!');
            clienteNomeInput.value = '';
            resetClientFields(true);
            document.getElementById('aparelho-marca-modelo').value = '';
            document.getElementById('aparelho-imei').value = '';
            document.getElementById('observacoes-cliente').value = '';
            document.getElementById('problema-tecnico').value = '';
            document.getElementById('garantia-peca').value = '';
        } catch (error) {
            console.error("Erro ao fazer logout:", error.code, error.message);
            alert(`Erro ao fazer logout: ${error.message}`);
        }
    });

    auth.onAuthStateChanged(updateUI);

    // --- Lógica de Autopreenchimento de Cliente (Firebase) ---

    function resetClientFields(readonly = false) {
        clienteCnpjInput.value = '';
        clienteContatoInput.value = '';
        clienteEnderecoInput.value = '';
        clienteCnpjInput.readOnly = readonly;
        clienteContatoInput.readOnly = readonly;
        clienteEnderecoInput.readOnly = readonly;
    }

    // LÓGICA DE BUSCA COM DEBOUNCE E SUGESTÕES (CAMPO PRINCIPAL)
    clienteNomeInput.addEventListener('input', () => {
        clearTimeout(searchTimeout); // Limpa o timeout anterior, se houver
        const searchText = clienteNomeInput.value.trim();

        if (searchText.length > 0) {
            searchTimeout = setTimeout(() => {
                searchClients(searchText);
            }, 300); // Debounce de 300ms
        } else {
            suggestionsContainer.style.display = 'none'; // Esconde as sugestões se o campo estiver vazio
            resetClientFields(true); // Limpa os campos se o texto for removido
        }
    });

    async function searchClients(searchText) {
        if (!auth.currentUser) {
            console.log('Não há usuário logado para buscar clientes.');
            suggestionsContainer.style.display = 'none';
            return;
        }

        const normalizedSearchText = searchText.toLowerCase();
        try {
            // Busca por nomes que começam com o texto digitado
            const snapshot = await db.collection('clientes')
                                     .where('normalizedName', '>=', normalizedSearchText)
                                     .where('normalizedName', '<=', normalizedSearchText + '\uf8ff') // Truque para "starts with"
                                     .limit(5) // Limita o número de sugestões
                                     .get();

            displaySuggestions(snapshot.docs.map(doc => doc.data()));
        } catch (error) {
            console.error("Erro ao buscar clientes:", error);
            suggestionsContainer.style.display = 'none';
        }
    }

    function displaySuggestions(clients) {
        suggestionsList.innerHTML = ''; // Limpa as sugestões anteriores
        if (clients.length > 0) {
            clients.forEach(client => {
                const li = document.createElement('li');
                li.textContent = client.nome; // Exibe o nome original (com capitalização)
                li.addEventListener('click', () => {
                    clienteNomeInput.value = client.nome; // Preenche o input com o nome original
                    populateClientFields(client); // Preenche os outros campos
                    suggestionsContainer.style.display = 'none'; // Esconde as sugestões
                });
                suggestionsList.appendChild(li);
            });
            suggestionsContainer.style.display = 'block'; // Mostra o contêiner de sugestões
        } else {
            suggestionsContainer.style.display = 'none'; // Esconde se não houver resultados
        }
    }

    // Função para preencher os campos do cliente (reutilizável)
    function populateClientFields(clientData) {
        clienteCnpjInput.value = clientData.cnpj || '';
        clienteContatoInput.value = clientData.contato || '';
        clienteEnderecoInput.value = clientData.endereco || '';
        resetClientFields(true); // Deixa os campos como somente leitura
    }

    // --- Lógica do Modal "Adicionar Novo Cliente" ---

    addClientBtn.addEventListener('click', () => {
        if (!auth.currentUser) {
            alert('Por favor, faça login para adicionar um novo cliente.');
            return;
        }
        addClientModal.style.display = 'flex';
        modalClienteNome.value = '';
        modalClienteCnpj.value = '';
        modalClienteContato.value = '';
        modalClienteEndereco.value = '';
    });

    closeAddClientModalBtn.addEventListener('click', () => {
        addClientModal.style.display = 'none';
    });

    // APRIMORAMENTO DO SALVAMENTO DO CLIENTE (Mantendo normalizedName)
    saveClientModalBtn.addEventListener('click', async () => {
        if (!auth.currentUser) {
            alert('Você precisa estar logado para salvar um cliente.');
            return;
        }

        const nomeOriginal = modalClienteNome.value.trim();
        const normalizedNameForSave = nomeOriginal.toLowerCase();

        const cnpj = modalClienteCnpj.value.trim();
        const contato = modalClienteContato.value.trim();
        const endereco = modalClienteEndereco.value.trim();

        if (!nomeOriginal) {
            alert('O "Nome da Empresa" é obrigatório!');
            return;
        }

        try {
            await db.collection('clientes').doc(normalizedNameForSave).set({ // Usa normalizedName como ID
                nome: nomeOriginal,
                normalizedName: normalizedNameForSave, // Campo para busca
                cnpj: cnpj,
                contato: contato,
                endereco: endereco,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                addedBy: auth.currentUser.email
            });
            alert(`Cliente "${nomeOriginal}" salvo com sucesso!`);
            addClientModal.style.display = 'none';
            clienteNomeInput.value = nomeOriginal;
            populateClientFields({ nome: nomeOriginal, cnpj: cnpj, contato: contato, endereco: endereco }); // Preenche o principal
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            alert("Erro ao salvar cliente. Verifique o console para mais detalhes. Certifique-se de estar logado e com permissão.");
        }
    });

    // --- NOVO: Lógica do Modal "Gerenciar Clientes" (Listar/Editar/Excluir) ---

    // Abre o modal de listar clientes
    listClientsBtn.addEventListener('click', () => {
        if (!auth.currentUser) {
            alert('Por favor, faça login para gerenciar clientes.');
            return;
        }
        listClientsModal.style.display = 'flex';
        clientListArea.style.display = 'block'; // Garante que a lista esteja visível
        clientEditArea.style.display = 'none'; // Garante que a edição esteja oculta
        clientListSearchInput.value = ''; // Limpa a pesquisa ao abrir
        loadClientsList(); // Carrega a lista de clientes
    });

    // Fecha o modal de listar clientes pelo botão 'X'
    closeListClientsModalBtn.addEventListener('click', () => {
        listClientsModal.style.display = 'none';
    });

    // Função para carregar e exibir a lista de clientes
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
            clientsTable.innerHTML = ''; // Limpa antes de adicionar

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
                        <button class="edit-btn" data-id="${client.normalizedName}">Editar</button>
                        <button class="delete-btn" data-id="${client.normalizedName}">Excluir</button>
                    </div>
                `;
                clientsTable.appendChild(li);
            });

            // Adiciona event listeners para os botões de editar/excluir
            clientsTable.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (e) => editClient(e.target.dataset.id));
            });
            clientsTable.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => deleteClient(e.target.dataset.id));
            });

        } catch (error) {
            console.error("Erro ao carregar lista de clientes:", error);
            clientsTable.innerHTML = '<li>Erro ao carregar clientes.</li>';
            alert("Erro ao carregar clientes. Verifique o console.");
        }
    }

    // Lógica para editar um cliente
    async function editClient(clientId) {
        if (!auth.currentUser) {
            alert('Faça login para editar clientes.');
            return;
        }

        try {
            const docRef = db.collection('clientes').doc(clientId);
            const doc = await docRef.get();

            if (doc.exists) {
                const clientData = doc.data();
                currentClientBeingEdited = clientId; // Armazena o ID do cliente sendo editado

                editModalClienteNome.value = clientData.nome || '';
                editModalClienteCnpj.value = clientData.cnpj || '';
                editModalClienteContato.value = clientData.contato || '';
                editModalClienteEndereco.value = clientData.endereco || '';

                clientListArea.style.display = 'none'; // Esconde a lista
                clientEditArea.style.display = 'block'; // Mostra o formulário de edição
            } else {
                alert('Cliente não encontrado.');
            }
        } catch (error) {
            console.error("Erro ao carregar dados do cliente para edição:", error);
            alert("Erro ao carregar dados do cliente para edição.");
        }
    }

    // Lógica para salvar as alterações do cliente
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

        try {
            if (originalNormalizedName !== newNormalizedName) {
                // Se o nome (e, portanto, o normalizedName) foi alterado,
                // cria um novo documento com o novo ID e deleta o antigo.
                await db.collection('clientes').doc(newNormalizedName).set({
                    nome: newNome,
                    normalizedName: newNormalizedName,
                    cnpj: newCnpj,
                    contato: newContato,
                    endereco: newEndereco,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    addedBy: auth.currentUser.email
                });
                await db.collection('clientes').doc(originalNormalizedName).delete();
                alert(`Cliente "${newNome}" atualizado e movido com sucesso!`);
            } else {
                // Se o nome não foi alterado, apenas atualiza o documento existente
                await db.collection('clientes').doc(originalNormalizedName).update({
                    nome: newNome,
                    cnpj: newCnpj,
                    contato: newContato,
                    endereco: newEndereco,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp() // Atualiza o timestamp de modificação
                });
                alert(`Cliente "${newNome}" atualizado com sucesso!`);
            }

            // Volta para a lista e recarrega
            clientEditArea.style.display = 'none';
            clientListArea.style.display = 'block';
            currentClientBeingEdited = null; // Reseta a variável de controle
            loadClientsList();

        } catch (error) {
            console.error("Erro ao atualizar cliente:", error);
            alert("Erro ao atualizar cliente. Verifique o console para mais detalhes.");
        }
    });

    // Lógica para cancelar a edição
    cancelEditClientBtn.addEventListener('click', () => {
        clientEditArea.style.display = 'none';
        clientListArea.style.display = 'block';
        currentClientBeingEdited = null; // Reseta a variável de controle
    });

    // Lógica para excluir um cliente
    async function deleteClient(clientId) {
        if (!auth.currentUser) {
            alert('Faça login para excluir clientes.');
            return;
        }

        if (confirm(`Tem certeza que deseja excluir o cliente "${clientId}"? Esta ação não pode ser desfeita.`)) {
            try {
                await db.collection('clientes').doc(clientId).delete();
                alert('Cliente excluído com sucesso!');
                loadClientsList(); // Recarrega a lista após a exclusão
            } catch (error) {
                console.error("Erro ao excluir cliente:", error);
                alert("Erro ao excluir cliente. Verifique o console para mais detalhes.");
            }
        }
    }

    // Busca na lista de clientes (debounce)
    clientListSearchInput.addEventListener('input', () => {
        clearTimeout(listSearchTimeout);
        const searchTerm = clientListSearchInput.value.trim();
        listSearchTimeout = setTimeout(() => {
            loadClientsList(searchTerm);
        }, 300); // Debounce de 300ms
    });

});
