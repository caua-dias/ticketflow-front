import { getEvents } from "../../shared/eventService.js";

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
                        
                        <p class="card-details">12 Out 2024 • 21:00 • 5.000 lugares</p>

                        <div class="card-actions">
                            <button class="btn-action">Ver</button>
                            <button class="btn-action">Editar</button>
                            <button class="btn-action btn-delete">Excluir</button>
                        </div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

async function init() {
    const events = await getEvents();
    renderEvents(events);
}

init();