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
        if (event.target == authModal) {
            authModal.style.display = 'none';
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

    // APRIMORAMENTO DA BUSCA DO CLIENTE
    clienteNomeInput.addEventListener('blur', async () => {
        const clienteNomeDigitado = clienteNomeInput.value.trim(); // O nome como o usuário digitou
        const normalizedSearchName = clienteNomeDigitado.toLowerCase(); // Nome normalizado para busca

        if (!auth.currentUser) {
            alert('Por favor, faça login para buscar informações de clientes.');
            resetClientFields(true);
            return;
        }

        if (clienteNomeDigitado) {
            try {
                // Realiza a busca pelo campo 'normalizedName'
                const snapshot = await db.collection('clientes')
                                         .where('normalizedName', '==', normalizedSearchName)
                                         .limit(1) // Pega apenas o primeiro resultado, assumindo nomes únicos
                                         .get();

                if (!snapshot.empty) {
                    const doc = snapshot.docs[0]; // Pega o primeiro documento encontrado
                    const data = doc.data();
                    clienteCnpjInput.value = data.cnpj || '';
                    clienteContatoInput.value = data.contato || '';
                    clienteEnderecoInput.value = data.endereco || '';
                    resetClientFields(true);
                    console.log(`Cliente "${clienteNomeDigitado}" encontrado e dados preenchidos.`);
                } else {
                    resetClientFields(true); // Limpa e mantém como readonly
                    console.log(`Cliente "${clienteNomeDigitado}" não encontrado. Use "Adicionar Novo Cliente".`);
                    alert(`Cliente "${clienteNomeDigitado}" não encontrado. Por favor, adicione-o através do botão "Adicionar Novo Cliente".`);
                }
            } catch (error) {
                console.error("Erro ao buscar cliente:", error);
                resetClientFields(false); // Permite edição em caso de erro na busca
                alert("Erro ao buscar cliente. Verifique o console para mais detalhes. As regras de segurança podem estar impedindo o acesso.");
            }
        } else {
            resetClientFields(true);
        }
    });

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

    window.addEventListener('click', (event) => {
        if (event.target == addClientModal) {
            addClientModal.style.display = 'none';
        }
    });

    // APRIMORAMENTO DO SALVAMENTO DO CLIENTE (Adicionando normalizedName)
    saveClientModalBtn.addEventListener('click', async () => {
        if (!auth.currentUser) {
            alert('Você precisa estar logado para salvar um cliente.');
            return;
        }

        const nomeOriginal = modalClienteNome.value.trim(); // Nome como o usuário digitou no modal
        const normalizedNameForSave = nomeOriginal.toLowerCase(); // Nome normalizado para o campo de busca

        const cnpj = modalClienteCnpj.value.trim();
        const contato = modalClienteContato.value.trim();
        const endereco = modalClienteEndereco.value.trim();

        if (!nomeOriginal) {
            alert('O "Nome da Empresa" é obrigatório!');
            return;
        }

        try {
            // Usa o nome normalizado como ID do documento para manter a consistência ou pode ser um ID aleatório
            // Manter o nome normalizado como ID ainda ajuda em algumas operações, mas o campo 'normalizedName' é a chave para a busca.
            await db.collection('clientes').doc(normalizedNameForSave).set({
                nome: nomeOriginal, // Salva o nome original, com a capitalização do usuário
                normalizedName: normalizedNameForSave, // NOVO CAMPO para busca
                cnpj: cnpj,
                contato: contato,
                endereco: endereco,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                addedBy: auth.currentUser.email
            });
            alert(`Cliente "${nomeOriginal}" salvo com sucesso!`);
            addClientModal.style.display = 'none';
            clienteNomeInput.value = nomeOriginal; // Preenche o campo principal com o nome original
            clienteNomeInput.dispatchEvent(new Event('blur')); // Dispara o evento blur para autopreencher os outros campos
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            alert("Erro ao salvar cliente. Verifique o console para mais detalhes. Certifique-se de estar logado e com permissão.");
        }
    });
});
