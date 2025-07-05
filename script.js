document.addEventListener('DOMContentLoaded', () => {
    const osNumberDisplay = document.getElementById('os-number-display');
    const printBtn = document.getElementById('printBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const emailBtn = document.getElementById('emailBtn');

    // Função para formatar a data como DDMMYY
    function formatDateAsDDMMYY(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês de 0 a 11
        const year = String(date.getFullYear()).slice(-2); // Pega os últimos 2 dígitos do ano
        return `${day}${month}${year}`;
    }

    // Função para gerar um número de OS no novo formato
    function generateOsNumber() {
        const now = new Date();
        const formattedDate = formatDateAsDDMMYY(now);
        // Gera um número de 3 dígitos (entre 100 e 999)
        const randomSuffix = Math.floor(100 + Math.random() * 900);

        return `${formattedDate}${randomSuffix}`;
    }

    // Geração automática do número da OS ao carregar a página
    const initialOsNumber = generateOsNumber();
    osNumberDisplay.textContent = initialOsNumber;

    // Atualiza o título da aba do navegador
    document.title = `SUPPORTA O.S: ${initialOsNumber}`;

    // --- Lógica para os novos botões ---

    // Botão Imprimir
    printBtn.addEventListener('click', () => {
        window.print();
    });

    // Botão WhatsApp
    whatsappBtn.addEventListener('click', () => {
        const osNumber = osNumberDisplay.textContent;
        const phoneNumber = '5562981795686'; // Adicionado o código do país (55)
        const message = encodeURIComponent(`Olá! Estou enviando a Ordem de Serviço de número ${osNumber}.`);
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    });

    // Botão Email
    emailBtn.addEventListener('click', () => {
        const osNumber = osNumberDisplay.textContent;
        const subject = encodeURIComponent(`Ordem de Serviço ${osNumber} - Supporta Tecnologia`);
        const body = encodeURIComponent(`Prezado(a) cliente,\n\nSegue em anexo a Ordem de Serviço de número ${osNumber} referente ao seu atendimento. Por favor, revise os detalhes.\n\nAtenciosamente,\nEquipe Supporta Tecnologia`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    });
});
