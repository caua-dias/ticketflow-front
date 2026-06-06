import { saveEvent } from "../../shared/eventService.js";

const form = document.getElementById('form-create-event');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const novoEvento = {
        titulo: document.getElementById('nome').value,
        categoria: document.getElementById('tipo').value,
        imagem: null 
    };

    // Salva o evento
    await saveEvent(novoEvento);

    window.location.href = '../home-admin/home-admin.html';
});