import { protegerRota, limparSessao, getLoggedUserId } from "../../shared/authService.js";
import { getEventById } from "../../shared/eventService.js";

protegerRota('Custumer');

const API_BASE_URL = 'https://localhost:7200/api/v1';

function getAuthHeaders() {
    const token = localStorage.getItem('ticketflow_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function carregarDadosUsuario() {
    const token = localStorage.getItem('ticketflow_token');
    if (!token) return;

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payloadInfo = JSON.parse(jsonPayload);

        const nome = payloadInfo['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        const email = payloadInfo['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];

        document.getElementById('name').value = nome || '';
        document.getElementById('email').value = email || '';
    } catch (error) {
        console.error("Erro ao ler dados do usuário no token:", error);
    }
}

// Auxiliar para formatar a data no padrão brasileiro
function formatarDataBr(dataString) {
    if (!dataString) return 'Data não informada';
    const partes = dataString.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataString;
}

async function carregarIngressos() {
    const container = document.getElementById('tickets-container');
    const clienteId = getLoggedUserId();

    try {
        const response = await fetch(`${API_BASE_URL}/orders/history?clienteId=${clienteId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error("Falha ao buscar histórico");

        const pedidos = await response.json();
        const todosIngressos = [];

        pedidos.forEach(pedido => {
            if (pedido.ingressos && pedido.ingressos.length > 0) {
                pedido.ingressos.forEach(ing => {
                    todosIngressos.push({
                        ...ing,
                        valorTotal: pedido.valorTotal,
                        dataCompra: pedido.criadoEm
                    });
                });
            }
        });

        if (todosIngressos.length === 0) {
            container.innerHTML = `<p style="color: var(--gray-text);">Você ainda não possui ingressos.</p>`;
            return;
        }

        container.innerHTML = `<p style="color: #00D2DF;">Carregando detalhes dos eventos...</p>`;

        // Busca os detalhes de cada evento sequencialmente
        for (let ing of todosIngressos) {
            try {
                const eventoDetalhes = await getEventById(ing.eventoId);
                
                if (eventoDetalhes) {
                    ing.nomeEvento = eventoDetalhes.titulo;
                    ing.dataEvento = formatarDataBr(eventoDetalhes.data);
                    ing.horarioEvento = eventoDetalhes.horario;
                    ing.localEvento = eventoDetalhes.local;
                } else {
                    throw new Error("Evento não encontrado (Excluído)");
                }
            } catch {
                // Cai aqui se a API der erro 404 ou se o evento não existir mais
                ing.nomeEvento = 'Evento Cancelado / Indisponível';
                ing.dataEvento = '--/--/----';
                ing.horarioEvento = '--:--';
                ing.localEvento = 'Não informado';
                
                // Força o status para Cancelado para evitar que o usuário tente usar
                ing.status = 'Cancelado'; 
            }
        }

        // Renderiza separando as informações fixas do cabeçalho das informações expansíveis
        container.innerHTML = todosIngressos.map(ing => `
            <div class="ticket-card ${ing.status === 'Cancelado' ? 'cancelled' : ''}">
                <div class="ticket-main-info">
                    <div class="ticket-info">
                        <h3>${ing.nomeEvento}</h3>
                        <p>Tipo: Ingresso Padrão • <span style="color: var(--gray-text); font-size: 0.8rem;">Clique para ver detalhes</span></p>
                        <span class="ticket-hash">#${ing.hash}</span>
                    </div>
                    <div class="ticket-status status-${ing.status}">
                        ${ing.status}
                    </div>
                </div>
                
                <div class="ticket-expanded-info">
                    <div class="info-line">
                        <span class="material-symbols-outlined">calendar_month</span>
                        <p><strong>Data:</strong> ${ing.dataEvento}</p>
                    </div>
                    <div class="info-line">
                        <span class="material-symbols-outlined">schedule</span>
                        <p><strong>Horário:</strong> ${ing.horarioEvento}</p>
                    </div>
                    <div class="info-line">
                        <span class="material-symbols-outlined">location_on</span>
                        <p><strong>Local:</strong> ${ing.localEvento}</p>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Erro:", error);
        container.innerHTML = `<p style="color: #FF4D4D;">Erro ao carregar ingressos.</p>`;
    }
}

// 🚀 EVENT DELEGATION: Gerencia o clique em qualquer card de ingresso para abrir/fechar
document.getElementById('tickets-container').addEventListener('click', (e) => {
    const card = e.target.closest('.ticket-card');
    if (card) {
        card.classList.toggle('expanded');
    }
});

document.getElementById('btn-logout').addEventListener('click', (e) => {
    e.preventDefault();
    limparSessao();
    window.location.href = "../login/login.html";
});

carregarDadosUsuario();
carregarIngressos();