import { protegerRota } from "../../shared/authService.js";

// Exige que a pessoa esteja logada (Coloque a string exata que o C# devolve para usuários comuns, ex: 'Customer' ou 'User')
protegerRota('Customer');

import { getEventById } from "../../shared/eventService.js";

const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

// Formatação da Data (Ex: 12 Out 2024)
function formatarData(dataString) {
    if (!dataString) return '--/--/----';
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const partes = dataString.split('-');
    if(partes.length === 3) {
        return `${partes[2]} ${meses[parseInt(partes[1]) - 1]} ${partes[0]}`;
    }
    return dataString;
}

// 1. Carregar dados do evento
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
        
        document.getElementById('sum-total').textContent = (evento.preco && evento.preco !== "0") ? `R$ ${evento.preco}` : 'Grátis';
    }
}

// 2. Lógica do Cronômetro (15 minutos)
let tempoRestante = 5 * 60; // 15 minutos em segundos
const timerElement = document.getElementById('timer');

const countdown = setInterval(() => {
    tempoRestante--;
    
    let minutos = Math.floor(tempoRestante / 60);
    let segundos = tempoRestante % 60;
    
    // Formata para manter 2 dígitos (ex: 09:05)
    minutos = minutos < 10 ? '0' + minutos : minutos;
    segundos = segundos < 10 ? '0' + segundos : segundos;
    
    timerElement.textContent = `${minutos}:${segundos}`;

    if (tempoRestante <= 0) {
        clearInterval(countdown);
        alert("O tempo para pagamento expirou. Você será redirecionado.");
        window.location.href = `../view-event-user/view-event-user.html?id=${eventId}`;
    }
}, 1000);

// 3. Ação: Copiar Código Pix
document.getElementById('btn-copy').addEventListener('click', () => {
    const pixCode = document.getElementById('pix-code').textContent;
    navigator.clipboard.writeText(pixCode).then(() => {
        const btn = document.getElementById('btn-copy');
        btn.textContent = "Código copiado!";
        btn.style.backgroundColor = "#28a745"; // Fica verde rapidamente
        
        setTimeout(() => {
            btn.textContent = "Copiar código Pix";
            btn.style.backgroundColor = "var(--button-color)";
        }, 2000);
    });
});

// 4. Ação: Simular Pagamento
document.getElementById('btn-simulate').addEventListener('click', () => {
    // Para o cronômetro
    clearInterval(countdown);
    
    // Muda visual do status
    const statusContainer = document.getElementById('payment-status');
    const statusText = document.getElementById('status-text');
    
    statusContainer.classList.remove('waiting');
    statusContainer.classList.add('success');
    statusText.textContent = "Pagamento confirmado com sucesso!";
    
    // Desabilita botões
    document.getElementById('btn-simulate').disabled = true;
    document.getElementById('btn-simulate').textContent = "Aprovado";
    document.getElementById('btn-copy').disabled = true;

    // Aguarda 2,5 segundos e joga o usuário de volta para a Home
    setTimeout(() => {
        alert("Ingresso garantido! Voltando para a tela inicial.");
        window.location.href = '../user-home/user-home.html';
    }, 2500);
});

// Inicia
carregarResumo();