// Onde antes estava apenas protegerRota, mude para:
import { protegerRota, limparSessao } from "../../shared/authService.js";
// Exige que a pessoa esteja logada (Coloque a string exata que o C# devolve para usuários comuns, ex: 'Custumer' ou 'User')
protegerRota('Custumer');
import { getEventById } from "../../shared/eventService.js";

const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

// Função auxiliar para deixar a data no formato "12 Out 2024"
function formatarDataExtensa(dataString) {
    if (!dataString) return 'Data indefinida';

    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const partes = dataString.split('-');

    if (partes.length === 3) {
        const dia = partes[2];
        const mes = meses[parseInt(partes[1]) - 1];
        const ano = partes[0];
        return `${dia} ${mes} ${ano}`;
    }
    return dataString;
}

async function carregarEvento() {
    if (!eventId) {
        alert("Evento não encontrado!");
        window.location.href = '../user-home/user-home.html';
        return;
    }

    const evento = await getEventById(eventId);

    if (evento) {
        // Textos e Imagens
        document.getElementById('event-image').src = evento.imagem || 'https://via.placeholder.com/1200x600?text=Sem+Imagem';
        document.getElementById('event-category').textContent = evento.categoria || 'Categoria';
        document.getElementById('event-title').textContent = evento.titulo || 'Sem título';
        document.getElementById('event-description').textContent = evento.descricao || 'Nenhuma descrição informada para este evento.';

        // Grid de Informações
        document.getElementById('event-date').textContent = formatarDataExtensa(evento.data);
        document.getElementById('event-time').textContent = evento.horario || '--:--';
        document.getElementById('event-capacity').textContent = evento.capacidade ? `${evento.capacidade} pessoas` : 'Lotação não informada';
        document.getElementById('event-local').textContent = evento.local || 'Local a definir';

        // Painel de Ingressos
        const precoDisplay = (!evento.preco || evento.preco === "0" || evento.preco === "0,00" || evento.preco === "Grátis")
            ? 'GRATUITO'
            : `R$ ${evento.preco}`;

        document.getElementById('event-price').textContent = precoDisplay;

    } else {
        alert("Evento não encontrado no sistema.");
        window.location.href = '../user-home/user-home.html';
    }
}

document.getElementById('btn-buy').addEventListener('click', () => {
    window.location.href = `../user-payment/user-payment.html?id=${eventId}`;
});

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        limparSessao();
        window.location.href = "../login/login.html";
    });
}

carregarEvento();