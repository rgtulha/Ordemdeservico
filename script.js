document.addEventListener('DOMContentLoaded', () => {
    const osNumberDisplay = document.getElementById('os-number-display');
    // const generateOsBtn = document.getElementById('generateOsBtn'); // Removido

    // Função para formatar a data e hora
    function formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês de 0 a 11
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }

    // Função para gerar um número de OS
    function generateOsNumber() {
        const now = new Date();
        const dateTimeFormatted = formatDateTime(now);
        // Gera um número de 4 dígitos aleatório
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);

        return `OS-${dateTimeFormatted}-${randomSuffix}`;
    }

    // Geração automática do número da OS ao carregar a página
    const initialOsNumber = generateOsNumber();
    osNumberDisplay.textContent = initialOsNumber;

    // Removido: Event listener para o botão
    // generateOsBtn.addEventListener('click', () => {
    //     const newOsNumber = generateOsNumber();
    //     osNumberDisplay.textContent = newOsNumber;
    //     alert(`Novo número de OS gerado: ${newOsNumber}`);
    // });
});
