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

    // --- Lógica para os botões ---

    // Botão Imprimir
    printBtn.addEventListener('click', () => {
        window.print();
    });

    // Botão WhatsApp com geração de PDF
    whatsappBtn.addEventListener('click', () => {
        const osNumber = osNumberDisplay.textContent;
        const phoneNumber = '5562981795686';
        const message = encodeURIComponent(`Olá! Estou enviando a Ordem de Serviço de número ${osNumber}.`);

        // Elemento a ser convertido para PDF (o container principal)
        const element = document.querySelector('.container');
        const footer = document.querySelector('.action-buttons-footer');

        // Configurações para o PDF
        const options = {
            margin: [10, 10, 10, 10], // Margens: top, left, bottom, right em mm
            filename: `OS_${osNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, logging: false, dpi: 192, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // 1. Temporariamente aplicar estilos de impressão e esconder footer para a geração do PDF
        //    (html2pdf.js renderiza o que está visível na tela e estilizado, então usamos os estilos de @media print)
        //    Este é um truque para 'simular' o modo de impressão para o html2pdf.js
        document.body.classList.add('is-generating-pdf'); // Adiciona classe para ativar estilos print-like
        if (footer) footer.style.display = 'none'; // Esconde o footer na versão PDF

        html2pdf().set(options).from(element).save().then(() => {
            // 2. Após a geração e download do PDF:
            //    Remover a classe e mostrar o footer novamente
            document.body.classList.remove('is-generating-pdf');
            if (footer) footer.style.display = 'flex';

            // 3. Informar o usuário e abrir o WhatsApp
            alert('A Ordem de Serviço foi baixada como PDF. Agora, você precisará anexá-la manualmente na conversa do WhatsApp. A janela do WhatsApp será aberta.');
            window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
        }).catch(error => {
            // Em caso de erro, remover a classe e mostrar o footer
            console.error('Erro ao gerar PDF:', error);
            document.body.classList.remove('is-generating-pdf');
            if (footer) footer.style.display = 'flex';
            alert('Não foi possível gerar o PDF da O.S. Por favor, tente novamente.');
        });
    });


    // Botão Email
    emailBtn.addEventListener('click', () => {
        const osNumber = osNumberDisplay.textContent;
        const subject = encodeURIComponent(`Ordem de Serviço ${osNumber} - Supporta Tecnologia`);
        const body = encodeURIComponent(`Prezado(a) cliente,\n\nSegue em anexo a Ordem de Serviço de número ${osNumber} referente ao seu atendimento. Por favor, revise os detalhes.\n\nAtenciosamente,\nEquipe Supporta Tecnologia`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    });
});
