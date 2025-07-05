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
                resetClientFields(false); // Em caso de erro, permite edição para o usuário tentar novamente ou adicionar
                alert("Erro ao buscar cliente. Verifique o console para mais detalhes.");
            }
        } else {
            resetClientFields(true); // Se o campo de nome estiver vazio, limpa e deixa readonly
        }
    });

    // --- Lógica do Modal "Adicionar Novo Cliente" ---

    // Abre o modal
    addClientBtn.addEventListener('click', () => {
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
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert(`Cliente "${nome}" salvo com sucesso!`);
            addClientModal.style.display = 'none'; // Fecha o modal
            clienteNomeInput.value = nome; // Preenche o campo principal com o nome
            clienteNomeInput.dispatchEvent(new Event('blur')); // Dispara o evento blur para autopreencher os outros campos
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            alert("Erro ao salvar cliente. Verifique o console para mais detalhes.");
        }
    });

    // **IMPORTANTE SOBRE REGRAS DE SEGURANÇA DO FIRESTORE:**
    // Para que a busca e adição de clientes funcionem, você precisa configurar as regras de segurança do Firestore.
    // Exemplo de regras (para desenvolvimento - **NÃO USE EM PRODUÇÃO SEM REVISÃO CUIDADOSA!**):
    // service cloud.firestore {
    //   match /databases/{database}/documents {
    //     match /clientes/{clientId} {
    //       allow read, write: if true; // Permite leitura e escrita para qualquer um (inseguro para produção)
    //     }
    //   }
    // }
    // Para um ambiente de produção, você precisaria de regras mais restritivas,
    // por exemplo, permitindo escrita apenas para usuários autenticados.
});
