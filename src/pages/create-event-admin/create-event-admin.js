import { protegerRota } from "../../shared/authService.js";

// Exige que a pessoa esteja logada E seja um 'Manager'
protegerRota('Manager');
import { saveEvent } from "../../shared/eventService.js";

const form = document.getElementById('form-create-event');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const novoEvento = {
        titulo: document.getElementById('nome').value,
        categoria: document.getElementById('tipo').value,
        descricao: document.getElementById('descricao').value,
        data: document.getElementById('data').value,
        horario: document.getElementById('horario').value,
        capacidade: document.getElementById('capacidade').value,
        preco: document.getElementById('preco').value,
        local: document.getElementById('local').value,
        imagem: null
    };

    // Salva o evento
    await saveEvent(novoEvento);

    window.location.href = '../home-admin/home-admin.html';
});