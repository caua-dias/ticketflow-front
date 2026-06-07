import { getEventById, updateEvent, saveEvent } from "../../shared/eventService.js";

const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

const form = document.getElementById('form-edit-event');
const inputNome = document.getElementById('nome');
const inputTipo = document.getElementById('tipo');
const inputDescricao = document.getElementById('descricao');
const inputData = document.getElementById('data');
const inputHorario = document.getElementById('horario');
const inputCapacidade = document.getElementById('capacidade');
const inputPreco = document.getElementById('preco');
const inputLocal = document.getElementById('local');

async function carregarDadosEvento() {
    if (!eventId) {
        alert("Evento não encontrado!");
        window.location.href = '../home-admin/home-admin.html';
        return;
    }

    const evento = await getEventById(eventId);

    if (evento) {
        inputNome.value = evento.titulo || '';
        
        const optionExists = Array.from(inputTipo.options).some(opt => opt.value === evento.categoria);
        inputTipo.value = optionExists ? evento.categoria : "Música";
        inputDescricao.value = evento.descricao || '';
        inputData.value = evento.data || '';
        inputHorario.value = evento.horario || '';
        inputCapacidade.value = evento.capacidade || '';
        inputPreco.value = evento.preco || '';
        inputLocal.value = evento.local || '';
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Em vez de novoEvento, montamos o objeto de dadosAtualizados
    const dadosAtualizados = {
        titulo: document.getElementById('nome').value,
        categoria: document.getElementById('tipo').value,
        descricao: document.getElementById('descricao').value,
        data: document.getElementById('data').value,
        horario: document.getElementById('horario').value,
        capacidade: document.getElementById('capacidade').value,
        preco: document.getElementById('preco').value,
        local: document.getElementById('local').value
    };

    // Chama a função de atualizar passando o ID capturado da URL
    await updateEvent(eventId, dadosAtualizados);
    
    window.location.href = '../home-admin/home-admin.html';
});

carregarDadosEvento();