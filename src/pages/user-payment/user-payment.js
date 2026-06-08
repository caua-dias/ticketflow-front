import { protegerRota, limparSessao, getLoggedUserId } from "../../shared/authService.js";
import { getEventById } from "../../shared/eventService.js";

// Exige que a pessoa esteja logada e seja um cliente comum
protegerRota('Custumer'); // Se a role do BD for Customer, ajuste aqui!

const API_BASE_URL = 'https://localhost:7200/api/v1';

const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

// Função auxiliar para os headers das requisições de vendas
function getAuthHeaders() {
    const token = localStorage.getItem('ticketflow_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function formatarData(dataString) {
    if (!dataString) return '--/--/----';
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const partes = dataString.split('-');
    if (partes.length === 3) {
        return `${partes[2]} ${meses[parseInt(partes[1]) - 1]} ${partes[0]}`;
    }
    return dataString;
}

// 1. Carregar dados do evento (Reaproveitando o eventService já refatorado)
async function carregarResumo() {
    if (!eventId) {
        alert("Nenhum evento selecionado!");
        window.location.href = '../user-home/user-home.html';
        return;
    }

    const evento = await getEventById(eventId);

    if (evento) {
        document.getElementById('sum-event').textContent = evento.titulo || 'Evento indefinido';
        const dataFormatada = formatarData(evento.data);
        const horario = evento.horario ? ` • ${evento.horario}` : '';
        document.getElementById('sum-date').textContent = `${dataFormatada}${horario}`;
        document.getElementById('sum-total').textContent = (evento.preco && evento.preco !== "0,00") ? `R$ ${evento.preco}` : 'Grátis';
    }
}

// 2. Lógica do Cronômetro Visual (15 minutos)
let tempoRestante = 5 * 60; // 5 minutos em segundos para testes
const timerElement = document.getElementById('timer');

const countdown = setInterval(() => {
    tempoRestante--;
    let minutos = Math.floor(tempoRestante / 60);
    let segundos = tempoRestante % 60;
    
    minutos = minutos < 10 ? '0' + minutos : minutos;
    segundos = segundos < 10 ? '0' + segundos : segundos;
    timerElement.textContent = `${minutos}:${segundos}`;

    if (tempoRestante <= 0) {
        clearInterval(countdown);
        alert("O tempo para pagamento expirou. Você será redirecionado.");
        window.location.href = `../view-event-user/view-event-user.html?id=${eventId}`;
    }
}, 1000);

// 3. Ação: Copiar Código Pix (Apenas visual)
document.getElementById('btn-copy').addEventListener('click', () => {
    const pixCode = document.getElementById('pix-code').textContent;
    navigator.clipboard.writeText(pixCode).then(() => {
        const btn = document.getElementById('btn-copy');
        btn.textContent = "Código copiado!";
        btn.style.backgroundColor = "#28a745";
        
        setTimeout(() => {
            btn.textContent = "Copiar código Pix";
            btn.style.backgroundColor = "var(--button-color)";
        }, 2000);
    });
});

// 4. Ação Principal: Integração com o Backend para Simular Pagamento
document.getElementById('btn-simulate').addEventListener('click', async () => {
    const btnSimulate = document.getElementById('btn-simulate');
    btnSimulate.disabled = true;
    btnSimulate.textContent = "Processando compra...";
    clearInterval(countdown); // Para o cronômetro

    try {
        const clienteId = getLoggedUserId();
        if (!clienteId) throw new Error("Sessão inválida. Faça login novamente.");

        // ETAPA A: Criar um pedido pendente
        const orderRes = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ clienteId: clienteId })
        });
        if (!orderRes.ok) {
            const err = await orderRes.json();
            throw new Error(err.Erro || "Falha ao criar o pedido.");
        }
        const orderData = await orderRes.json();
        const pedidoId = orderData.id;

        // ETAPA B: Adicionar o ingresso ao pedido (Usando Quantidade 1 por padrão)
        const itemRes = await fetch(`${API_BASE_URL}/orders/${pedidoId}/items`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ eventoId: eventId, quantidade: 1 })
        });
        if (!itemRes.ok) {
            const err = await itemRes.json();
            throw new Error(err.Erro || "Falha ao adicionar o ingresso. Pode estar esgotado.");
        }

        // ETAPA C: Processar o Pagamento no Gateway Simulado
        const paymentRes = await fetch(`${API_BASE_URL}/payments/simulate`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ pedidoId: pedidoId, tokenPagamento: "aprovado" }) // Mude para testar sucessos ou falhas
        });

        if (!paymentRes.ok) {
            const err = await paymentRes.json();
            throw new Error(err.Erro || "Falha na transação financeira.");
        }

        // Lê a resposta enviada pelo backend
        const paymentData = await paymentRes.json();
        
        // Pega o status (O ASP.NET Core costuma retornar em camelCase por padrão)
        const statusDoPagamento = paymentData.statusPagamento || paymentData.StatusPagamento;

        // Verifica se a transação foi realmente aprovada nas regras de negócio
        if (statusDoPagamento !== 'Aprovado') {
            throw new Error(`Pagamento ${statusDoPagamento}. Transação não autorizada pelo gateway.`);
        }

        // --- SUCESSO: Atualizar Interface ---
        const statusContainer = document.getElementById('payment-status');
        const statusText = document.getElementById('status-text');
        
        statusContainer.classList.remove('waiting');
        statusContainer.classList.add('success');
        statusText.textContent = "Pagamento confirmado! Seu ingresso foi gerado.";
        
        btnSimulate.textContent = "Pagamento Aprovado";
        document.getElementById('btn-copy').disabled = true;

        setTimeout(() => {
            alert("Compra finalizada com sucesso! Verifique seus ingressos no perfil.");
            window.location.href = '../user-home/user-home.html';
        }, 2500);

    } catch (error) {
        console.error("Erro no checkout:", error);
        alert(error.message);
        
        // Reativa a tela caso tenha dado erro
        btnSimulate.disabled = false;
        btnSimulate.textContent = "Simular pagamento";
    }
});

// Lógica de Logout
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        limparSessao();
        window.location.href = "../login/login.html";
    });
}

// Inicia
carregarResumo();