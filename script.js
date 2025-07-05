import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById("osForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const dados = {
    nome: document.getElementById("nome").value,
    telefone: document.getElementById("telefone").value,
    email: document.getElementById("email").value,
    equipamento: document.getElementById("equipamento").value,
    defeito: document.getElementById("defeito").value,
    laudo: document.getElementById("laudo").value,
    valor: document.getElementById("valor").value,
    data: document.getElementById("data").value
  };

  try {
    await addDoc(collection(db, "ordensDeServico"), dados);
    gerarPDF(dados);
  } catch (err) {
    alert("Erro ao salvar no Firebase: " + err);
  }
});

function gerarPDF(dados) {
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text("Ordem de Serviço", 20, 20);
  doc.text(`Cliente: ${dados.nome}`, 20, 30);
  doc.text(`Telefone: ${dados.telefone}`, 20, 40);
  doc.text(`Email: ${dados.email}`, 20, 50);
  doc.text(`Equipamento: ${dados.equipamento}`, 20, 60);
  doc.text(`Defeito: ${dados.defeito}`, 20, 70);
  doc.text(`Laudo Técnico: ${dados.laudo}`, 20, 80);
  doc.text(`Valor: R$ ${dados.valor}`, 20, 90);
  doc.text(`Data: ${dados.data}`, 20, 100);
  doc.save(`OS_${dados.nome}.pdf`);
}
