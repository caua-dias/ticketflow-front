import { getEvents } from "../../shared/eventService.js";

function renderEvents(events) {

    const container = document.getElementById("events");

    if (events.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <h2>Nenhum evento por aqui ainda</h2>
                <p>Crie seu primeiro evento para começar.</p>
                <button>Criar primeiro evento</button>
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div class="events-grid">
            ${events.map(event => `
                <div class="event-card">
                    <img src="${event.imagem}">
                    <h3>${event.titulo}</h3>
                    <p>${event.categoria}</p>

                    <button>Ver</button>
                    <button>Editar</button>
                    <button>Excluir</button>
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