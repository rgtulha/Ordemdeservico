// Configuração do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializar Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para salvar no Firebase e gerar PDF
document.querySelector("#osForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Coleta de dados
  const nome = document.querySelector("#nomeCliente").value;
  const email = document.querySelector("#emailCliente").value;
  const telefone = document.querySelector("#telefoneCliente").value;
  const descricao = document.querySelector("#descricaoServico").value;
  const valor = document.querySelector("#valorServico").value;

  // Salvando no Firestore
  try {
    const docRef = await addDoc(collection(db, "clientes"), {
      nome,
      email,
      telefone,
      descricao,
      valor,
      data: new Date()
    });

    alert("Dados salvos com sucesso! Gerando PDF...");
    gerarPDF({ nome, email, telefone, descricao, valor }); // Função para gerar PDF
  } catch (error) {
    alert("Erro ao salvar no Firebase: " + error.message);
  }
});

// Função para gerar PDF
function gerarPDF(dados) {
  const { nome, email, telefone, descricao, valor } = dados;

  // Criação do conteúdo do PDF
  const pdfConteudo = `
    Ordem de Serviço

    Nome: ${nome}
    E-mail: ${email}
    Telefone: ${telefone}

    Serviço:
    ${descricao}

    Valor: R$ ${valor}
  `;

  // Usando a biblioteca jsPDF
  const pdf = new jsPDF();  // Certifique-se de adicionar jsPDF ao projeto
  pdf.text(pdfConteudo, 10, 10);
  pdf.save(`OS_${nome}.pdf`);
}
