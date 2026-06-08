// Onde antes estava apenas protegerRota, mude para:
import { protegerRota, limparSessao } from "../../shared/authService.js";
// Exige que a pessoa esteja logada (Coloque a string exata que o C# devolve para usuários comuns, ex: 'Custumer' ou 'User')
protegerRota('Custumer');

import { getEvents } from "../../shared/eventService.js";

function formatarDataCurta(dataString) {
    if (!dataString) return 'Data indefinida';
    
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const partes = dataString.split('-');
    
    if(partes.length === 3) {
        const dia = partes[2];
        const mes = meses[parseInt(partes[1]) - 1];
        const ano = partes[0];
        return `${dia} ${mes} ${ano}`;
    }
    return dataString;
}

function renderizarEventosUsuario(events) {
    const container = document.getElementById("user-events");

    if (events.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: var(--gray-text);">
                <h2>Nenhum evento disponível no momento</h2>
                <p>Volte mais tarde para conferir as novidades.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = events.map(event => {
        let precoTexto = "A partir de R$ " + event.preco;
        let badgeClass = "price-badge";
        
        if (!event.preco || event.preco === "0" || event.preco === "0,00" || event.preco === "Grátis") {
            precoTexto = "GRATUITO";
            badgeClass += " free"; 
        }

        const dataFormatada = formatarDataCurta(event.data);
        const horario = event.horario || '--:--';
        const localCurto = event.local ? event.local.split(',')[0] : 'Local a definir';

        return `
            <div class="event-card" onclick="window.location.href='../view-event-user/view-event-user.html?id=${event.id}'">
                
                <div class="card-image-container">
                    <span class="${badgeClass}">${precoTexto}</span>
                    <img src="${event.imagem}" alt="${event.titulo}" class="card-image">
                </div>
                
                <div class="card-content">
                    <span class="card-category">${event.categoria || 'Categoria'}</span>
                    <h3 class="card-title">${event.titulo}</h3>
                    <p class="card-description">${event.descricao || 'Sem descrição.'}</p>
                    
                    <div class="card-footer-info">
                        ${dataFormatada} • ${horario} • ${localCurto}
                    </div>
                </div>

            </div>
        `;
    }).join("");
}

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        limparSessao();
        window.location.href = "../login/login.html";
    });
}

async function initUserHome() {
    const events = await getEvents();
    renderizarEventosUsuario(events);
}

initUserHome();