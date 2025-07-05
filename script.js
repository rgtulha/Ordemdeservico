document.addEventListener('DOMContentLoaded', () => {
    const osNumberDisplay = document.getElementById('os-number-display');

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
});
