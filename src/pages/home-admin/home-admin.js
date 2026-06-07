import { getEvents, deleteEvent } from "../../shared/eventService.js";

function renderEvents(events) {
    const container = document.getElementById("events");

    if (events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>Nenhum evento por aqui ainda</h2>
                <p>Crie seu primeiro evento para começar.</p>
                <button class="btn-create">Criar primeiro evento</button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="events-grid">
            ${events.map(event => `
                <div class="event-card">
                    <div class="card-image-container">
                        <span class="badge">PUBLICADO</span>
                        <img src="${event.imagem}" alt="${event.titulo}" class="card-image">
                    </div>
                    <div class="card-content">
                        <span class="card-category">${event.categoria || 'CATEGORIA'}</span>
                        <h3 class="card-title">${event.titulo}</h3>
                        
                        <p class="card-details">${event.data ? event.data.split('-').reverse().join('/') : 'Sem data'} • ${event.horario || '--:--'} • ${event.capacidade || '0'} lugares</p>

                        <div class="card-actions">
                            <button class="btn-action btn-view" data-id="${event.id}">Ver</button>
                            <button class="btn-action btn-edit" data-id="${event.id}">Editar</button>
                            <button class="btn-action btn-delete" data-id="${event.id}">Excluir</button>
                        </div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

document.getElementById("events").addEventListener("click", async (e) => {
    // Se clicou no botão de Editar
    if (e.target.classList.contains("btn-edit")) {
        const id = e.target.getAttribute("data-id");
        // Redireciona passando o ID na URL
        window.location.href = `../edit-event-admin/edit-event-admin.html?id=${id}`;
    }

    // Se clicou no botão de Excluir
    if (e.target.classList.contains("btn-delete")) {
        const id = e.target.getAttribute("data-id");
        const confirmacao = confirm("Tem certeza que deseja excluir este evento?");
        
        if (confirmacao) {
            await deleteEvent(id);
            init(); // Recarrega a lista atualizada
        }
    }

    //Click botão Ver
    if (e.target.classList.contains("btn-view")) {
        const id = e.target.parentElement.querySelector('.btn-edit').getAttribute("data-id");
        window.location.href = `../view-event-admin/view-event-admin.html?id=${id}`;
    }
});

async function init() {
    const events = await getEvents();
    renderEvents(events);
}

init();