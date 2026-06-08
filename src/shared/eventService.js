import { getLoggedUserId } from './authService.js';

const API_BASE_URL = 'https://localhost:7200/api/v1';

// Função auxiliar para pegar os headers com o Token de Autenticação
function getAuthHeaders() {
    const token = localStorage.getItem('ticketflow_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

export async function getEvents() {
    try {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error('Erro ao buscar eventos');

        const data = await response.json();

        // Mapeamento: Transforma o formato do Backend (EventSummaryResponse) no formato que o seu Frontend já espera
        return data.map(e => ({
            id: e.id,
            titulo: e.name,
            categoria: e.categoryName || 'Geral', 
            descricao: e.description || 'Sem descrição', // O endpoint GetSummary pode não trazer, mas deixamos um fallback
            data: e.date.split('T')[0], // Pega só a parte da data "YYYY-MM-DD"
            horario: e.startTime,
            capacidade: e.availableTickets, 
            preco: e.currentPrice.toString().replace('.', ','), // Formata para o frontend
            local: e.venueName || 'Local não informado',
            imagem: e.imageUrl || `https://picsum.photos/300/200?random=${e.id}`
        }));
    } catch (error) {
        console.error("Falha ao buscar eventos:", error);
        return [];
    }
}

export async function getEventById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error('Evento não encontrado');

        const e = await response.json();

        // Mapeamento do EventResponse do backend para o frontend
        return {
            id: e.id,
            titulo: e.name,
            categoria: e.categoryName || 'Geral',
            descricao: e.description,
            data: e.date.split('T')[0],
            horario: e.startTime,
            capacidade: e.capacity,
            preco: e.basePrice.toString().replace('.', ','),
            local: e.venueName || 'Local a definir',
            imagem: e.imageUrl || 'https://picsum.photos/1200/600'
        };
    } catch (error) {
        console.error("Falha ao buscar detalhes do evento:", error);
        return null;
    }
}

export async function saveEvent(novoEvento) {
    // ATENÇÃO: O Backend exige IDs de Venue, Organizer e Category.
    // Como o seu formulário HTML não tem esses campos ainda, você precisará 
    // colocar GUIDs VÁLIDOS do seu banco de dados aqui para testar a criação,
    // ou tratar isso no frontend futuramente.
    
    const defaultVenueId = "e0077454-fc97-4b4d-858c-7521e4dc3468";
    const defaultOrganizerId = getLoggedUserId(); 
    const defaultCategoryId = "ce7631d0-6460-4205-8c60-dc5d2b8890a9";

    const payload = {
        name: novoEvento.titulo,
        eventType: 0, // 0 = Show (do enum EventType do C#)
        description: novoEvento.descricao,
        date: novoEvento.data, // YYYY-MM-DD
        startTime: novoEvento.horario + ":00", // C# TimeSpan espera "HH:MM:SS"
        capacity: Number(novoEvento.capacidade),
        basePrice: Number(novoEvento.preco.replace(',', '.')),
        venueId: defaultVenueId,
        organizerId: defaultOrganizerId,
        categoryId: defaultCategoryId,
        imageUrl: novoEvento.imagem || `https://picsum.photos/1200/600?random=${Date.now()}`
    };

    const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.Erro || 'Erro ao criar evento.');
    }
}

export async function updateEvent(id, dadosAtualizados) {
    // Para atualizar, precisamos manter os GUIDs originais. 
    // Em um cenário real, você faria um GET primeiro ou enviaria do formulário.
    // Vamos simplificar para o escopo atual:
    
    // 1. Busca o evento original para não perder as chaves estrangeiras
    const responseOriginal = await fetch(`${API_BASE_URL}/events/${id}`, {
        headers: getAuthHeaders()
    });
    const eventoOriginal = await responseOriginal.json();

    const payload = {
        name: dadosAtualizados.titulo,
        eventType: eventoOriginal.eventType, 
        description: dadosAtualizados.descricao,
        date: dadosAtualizados.data,
        startTime: dadosAtualizados.horario.length === 5 ? dadosAtualizados.horario + ":00" : dadosAtualizados.horario,
        capacity: Number(dadosAtualizados.capacidade),
        basePrice: Number(dadosAtualizados.preco.replace(',', '.')),
        venueId: eventoOriginal.venueId,
        organizerId: eventoOriginal.organizerId,
        categoryId: eventoOriginal.categoryId,
        imageUrl: eventoOriginal.imageUrl
    };

    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error('Erro ao atualizar evento.');
    }
}

export async function deleteEvent(id) {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.Erro || 'Erro ao deletar evento. Verifique se ele já tem ingressos vendidos.');
    }
}