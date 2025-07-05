document.addEventListener('DOMContentLoaded', () => {
    const osNumberDisplay = document.getElementById('os-number-display');
    const printBtn = document.getElementById('printBtn');

    // Campos do cliente
    const clienteNomeInput = document.getElementById('cliente-nome');
    const clienteCnpjInput = document.getElementById('cliente-cnpj');
    const clienteContatoInput = document.getElementById('cliente-contato');
    const clienteEnderecoInput = document.getElementById('cliente-endereco');
    const addClientBtn = document.getElementById('addClientBtn');

    // --- Configuração Firebase ---
    // Substitua PELAS SUAS CREDENCIAIS DO FIREBASE
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.appspot.com",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
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

    // --- Lógica de Autopreenchimento e Adição de Cliente (Firebase) ---

    // Evento para buscar cliente ao sair do campo "Nome da Empresa"
    clienteNomeInput.addEventListener('blur', async () => {
        const clienteNome = clienteNomeInput.value.trim();
        if (clienteNome) {
            try {
                // Normaliza o nome para busca (ex: tudo minúsculas)
                const docRef = db.collection('clientes').doc(clienteNome.toLowerCase());
                const doc = await docRef.get();

                if (doc.exists) {
                    const data = doc.data();
                    clienteCnpjInput.value = data.cnpj || '';
                    clienteContatoInput.value = data.contato || '';
                    clienteEnderecoInput.value = data.endereco || '';
                    alert(`Cliente "${clienteNome}" encontrado e dados preenchidos!`);
                } else {
                    // Se não encontrou, limpa os campos para indicar que é um novo cliente
                    clienteCnpjInput.value = '';
                    clienteContatoInput.value = '';
                    clienteEnderecoInput.value = '';
                    alert(`Cliente "${clienteNome}" não encontrado. Preencha os dados e adicione-o.`);
                }
            } catch (error) {
                console.error("Erro ao buscar cliente:", error);
                alert("Erro ao buscar cliente. Verifique o console para mais detalhes.");
            }
        } else {
            // Se o campo de nome estiver vazio, limpa os outros campos
            clienteCnpjInput.value = '';
            clienteContatoInput.value = '';
            clienteEnderecoInput.value = '';
        }
    });

    // Evento para o botão "Adicionar Novo Cliente"
    addClientBtn.addEventListener('click', async () => {
        const clienteNome = clienteNomeInput.value.trim();
        const clienteCnpj = clienteCnpjInput.value.trim();
        const clienteContato = clienteContatoInput.value.trim();
        const clienteEndereco = clienteEnderecoInput.value.trim();

        if (!clienteNome) {
            alert('Por favor, preencha o "Nome da Empresa" para adicionar o cliente.');
            return;
        }

        try {
            // Salva os dados do cliente no Firestore
            // Usa o nome da empresa (em minúsculas) como ID do documento para facilitar a busca
            await db.collection('clientes').doc(clienteNome.toLowerCase()).set({
                nome: clienteNome,
                cnpj: clienteCnpj,
                contato: clienteContato,
                endereco: clienteEndereco,
                timestamp: firebase.firestore.FieldValue.serverTimestamp() // Adiciona um timestamp
            });
            alert(`Cliente "${clienteNome}" adicionado com sucesso ao banco de dados!`);
        } catch (error) {
            console.error("Erro ao adicionar cliente:", error);
            alert("Erro ao adicionar cliente. Verifique o console para mais detalhes.");
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
