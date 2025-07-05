document.addEventListener('DOMContentLoaded', () => {
    const osNumberDisplay = document.getElementById('os-number-display');
    const printBtn = document.getElementById('printBtn');

    // Campos do cliente no formulário principal
    const clienteNomeInput = document.getElementById('cliente-nome');
    const clienteCnpjInput = document.getElementById('cliente-cnpj');
    const clienteContatoInput = document.getElementById('cliente-contato');
    const clienteEnderecoInput = document.getElementById('cliente-endereco');
    const addClientBtn = document.getElementById('addClientBtn');

    // Elementos do Modal
    const addClientModal = document.getElementById('addClientModal');
    const closeButton = addClientModal.querySelector('.close-button');
    const modalClienteNome = document.getElementById('modal-cliente-nome');
    const modalClienteCnpj = document.getElementById('modal-cliente-cnpj');
    const modalClienteContato = document.getElementById('modal-cliente-contato');
    const modalClienteEndereco = document.getElementById('modal-cliente-endereco');
    const saveClientModalBtn = document.getElementById('saveClientModalBtn');

    // Elementos da Seção de Autenticação
    const authEmailInput = document.getElementById('auth-email');
    const authPasswordInput = document.getElementById('auth-password');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const authStatus = document.getElementById('auth-status');

    // Seções da O.S. que só aparecem para usuários logados
    const clientDataSection = document.getElementById('client-data-section');
    const aparelhoProblemaSection = document.getElementById('aparelho-problema-section');
    const garantiaSection = document.getElementById('garantia-section');
    const observacoesSection = document.getElementById('observacoes-section');
    const footerButtons = document.getElementById('footer-buttons');

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
    const auth = firebase.auth(); // Inicializa o Firebase Authentication

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

    // Função para atualizar a visibilidade da interface
    function updateUI(user) {
        if (user) {
            // Usuário logado
            authStatus.textContent = `Logado como: ${user.email}`;
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block'; // Mostra o botão de sair

            // Mostra as seções da O.S.
            clientDataSection.style.display = 'block';
            aparelhoProblemaSection.style.display = 'block';
            garantiaSection.style.display = 'block';
            observacoesSection.style.display = 'block';
            footerButtons.style.display = 'flex'; // Exibe o footer com os botões
        } else {
            // Usuário deslogado
            authStatus.textContent = 'Por favor, faça login para acessar a O.S.';
            loginBtn.style.display = 'inline-block';
            registerBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';

            // Esconde as seções da O.S.
            clientDataSection.style.display = 'none';
            aparelhoProblemaSection.style.display = 'none';
            garantiaSection.style.display = 'none';
            observacoesSection.style.display = 'none';
            footerButtons.style.display = 'none'; // Esconde o footer
        }
    }

    // Evento de registro
    registerBtn.addEventListener('click', async () => {
        const email = authEmailInput.value;
        const password = authPasswordInput.value;
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            alert('Usuário cadastrado e logado com sucesso!');
        } catch (error) {
            console.error("Erro ao cadastrar:", error.code, error.message);
            alert(`Erro ao cadastrar: ${error.message}`);
        }
    });

    // Evento de login
    loginBtn.addEventListener('click', async () => {
        const email = authEmailInput.value;
        const password = authPasswordInput.value;
        try {
            await auth.signInWithEmailAndPassword(email, password);
            alert('Login realizado com sucesso!');
        } catch (error) {
            console.error("Erro ao fazer login:", error.code, error.message);
            alert(`Erro ao fazer login: ${error.message}`);
        }
    });

    // Evento de logout
    logoutBtn.addEventListener('click', async () => {
        try {
            await auth.signOut();
            alert('Logout realizado com sucesso!');
            // Limpa os campos da O.S. após o logout
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

    // Listener para mudanças no estado da autenticação
    auth.onAuthStateChanged(updateUI); // Chama updateUI sempre que o estado de login mudar

    // --- Lógica de Autopreenchimento de Cliente (Firebase) ---

    // Função para limpar e (re)habilitar/desabilitar campos do cliente no formulário principal
    function resetClientFields(readonly = false) {
        clienteCnpjInput.value = '';
        clienteContatoInput.value = '';
        clienteEnderecoInput.value = '';
        clienteCnpjInput.readOnly = readonly;
        clienteContatoInput.readOnly = readonly;
        clienteEnderecoInput.readOnly = readonly;
    }

    // Evento para buscar cliente ao sair do campo "Nome da Empresa"
    clienteNomeInput.addEventListener('blur', async () => {
        const clienteNome = clienteNomeInput.value.trim();
        if (!auth.currentUser) { // Verifica se há usuário logado
            alert('Por favor, faça login para buscar informações de clientes.');
            resetClientFields(true);
            return;
        }

        if (clienteNome) {
            try {
                const docRef = db.collection('clientes').doc(clienteNome.toLowerCase());
                const doc = await docRef.get();

                if (doc.exists) {
                    const data = doc.data();
                    clienteCnpjInput.value = data.cnpj || '';
                    clienteContatoInput.value = data.contato || '';
                    clienteEnderecoInput.value = data.endereco || '';
                    resetClientFields(true); // Deixa os campos como somente leitura
                    console.log(`Cliente "${clienteNome}" encontrado e dados preenchidos.`);
                } else {
                    resetClientFields(true); // Limpa e mantém como readonly
                    console.log(`Cliente "${clienteNome}" não encontrado. Use "Adicionar Novo Cliente".`);
                    alert(`Cliente "${clienteNome}" não encontrado. Por favor, adicione-o através do botão "Adicionar Novo Cliente".`);
                }
            } catch (error) {
                console.error("Erro ao buscar cliente:", error);
                // Permite ao usuário editar se o erro for por outro motivo que não a autenticação
                resetClientFields(false);
                alert("Erro ao buscar cliente. Verifique o console para mais detalhes. As regras de segurança podem estar impedindo o acesso.");
            }
        } else {
            resetClientFields(true); // Se o campo de nome estiver vazio, limpa e deixa readonly
        }
    });

    // --- Lógica do Modal "Adicionar Novo Cliente" ---

    // Abre o modal
    addClientBtn.addEventListener('click', () => {
        if (!auth.currentUser) { // Verifica se há usuário logado
            alert('Por favor, faça login para adicionar um novo cliente.');
            return;
        }
        addClientModal.style.display = 'flex'; // Usa flex para centralizar
        // Limpa os campos do modal ao abrir
        modalClienteNome.value = '';
        modalClienteCnpj.value = '';
        modalClienteContato.value = '';
        modalClienteEndereco.value = '';
    });

    // Fecha o modal pelo botão 'X'
    closeButton.addEventListener('click', () => {
        addClientModal.style.display = 'none';
    });

    // Fecha o modal clicando fora dele
    window.addEventListener('click', (event) => {
        if (event.target == addClientModal) {
            addClientModal.style.display = 'none';
        }
    });

    // Salva o novo cliente no Firebase e fecha o modal
    saveClientModalBtn.addEventListener('click', async () => {
        if (!auth.currentUser) { // Verifica se há usuário logado
            alert('Você precisa estar logado para salvar um cliente.');
            return;
        }

        const nome = modalClienteNome.value.trim();
        const cnpj = modalClienteCnpj.value.trim();
        const contato = modalClienteContato.value.trim();
        const endereco = modalClienteEndereco.value.trim();

        if (!nome) {
            alert('O "Nome da Empresa" é obrigatório!');
            return;
        }

        try {
            await db.collection('clientes').doc(nome.toLowerCase()).set({
                nome: nome,
                cnpj: cnpj,
                contato: contato,
                endereco: endereco,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                addedBy: auth.currentUser.email // Opcional: Registra quem adicionou o cliente
            });
            alert(`Cliente "${nome}" salvo com sucesso!`);
            addClientModal.style.display = 'none'; // Fecha o modal
            clienteNomeInput.value = nome; // Preenche o campo principal com o nome
            clienteNomeInput.dispatchEvent(new Event('blur')); // Dispara o evento blur para autopreencher os outros campos
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            alert("Erro ao salvar cliente. Verifique o console para mais detalhes. Certifique-se de estar logado e com permissão.");
        }
    });
});
