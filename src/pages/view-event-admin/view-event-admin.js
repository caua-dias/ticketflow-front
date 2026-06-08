// Onde antes estava apenas protegerRota, mude para:
import { protegerRota, limparSessao } from "../../shared/authService.js";
// Exige que a pessoa esteja logada E seja um 'Manager'
protegerRota('Manager');

import { getEventById, deleteEvent } from "../../shared/eventService.js";

const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

async function carregarEvento() {
    if (!eventId) {
        alert("Evento não encontrado!");
        window.location.href = '../home-admin/home-admin.html';
        return;
    }

    const evento = await getEventById(eventId);

    if (evento) {
        // Preenchendo as imagens e textos básicos
        document.getElementById('event-image').src = evento.imagem || 'https://via.placeholder.com/1200x600?text=Sem+Imagem';
        document.getElementById('event-category').textContent = evento.categoria || 'Categoria não informada';
        document.getElementById('event-title').textContent = evento.titulo || 'Sem título';
        document.getElementById('event-description').textContent = evento.descricao || 'Sem descrição cadastrada para este evento.';
        
        // Formatando a data de 'AAAA-MM-DD' para 'DD Out 2024' (ou apenas 'DD/MM/AAAA' se preferir algo simples)
        let dataFormatada = 'Data não informada';
        if (evento.data) {
            const partes = evento.data.split('-');
            dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`; // Fica DD/MM/AAAA
        }

        // Injetando dados nos grids
        document.getElementById('event-date').textContent = dataFormatada;
        document.getElementById('event-time').textContent = evento.horario || '--:--';
        document.getElementById('event-capacity').textContent = evento.capacidade ? `${evento.capacidade} pessoas` : 'N/A';
        document.getElementById('event-local').textContent = evento.local || 'Local não informado';
        
        // Injetando preço no painel lateral
        const precoDisplay = evento.preco ? `R$ ${evento.preco}` : 'Grátis';
        document.getElementById('event-price').textContent = precoDisplay;

    } else {
        alert("Evento não encontrado no banco de dados.");
        window.location.href = '../home-admin/home-admin.html';
    }
}

// Ações dos botões laterais
document.getElementById('btn-edit').addEventListener('click', () => {
    window.location.href = `../edit-event-admin/edit-event-admin.html?id=${eventId}`;
});

document.getElementById('btn-delete').addEventListener('click', async () => {
    const confirmacao = confirm("Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.");
    
    if (confirmacao) {
        await deleteEvent(eventId);
        window.location.href = '../home-admin/home-admin.html';
    }
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