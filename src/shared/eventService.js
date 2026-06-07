// Chave para identificar nossos dados no navegador
const STORAGE_KEY = '@TicketFlow:events_v2';

// Dados iniciais caso o usuário nunca tenha entrado
const mockInicial = [
    {
        id: 1,
        titulo: "Neon Pulse 2024",
        categoria: "Festival de Música",
        descricao: "O maior festival de música eletrônica do ano, com luzes neon e os melhores DJs.",
        data: "2024-10-12", 
        horario: "21:00",   
        capacidade: 5000,
        preco: "150,00",
        local: "Arena Dunas, São Paulo",
        imagem: "https://picsum.photos/300/200?1"
    },
    {
        id: 2,
        titulo: "Future of Flow",
        categoria: "Tecnologia",
        descricao: "Uma conferência sobre o futuro do desenvolvimento de software e IA.",
        data: "2024-11-05",
        horario: "09:00",
        capacidade: 800,
        preco: "89,90",
        local: "Centro de Convenções, Rio de Janeiro",
        imagem: "https://picsum.photos/300/200?2"
    }
];

export async function getEvents() {
    // Tenta buscar os dados salvos no navegador
    const dadosSalvos = localStorage.getItem(STORAGE_KEY);

    if (dadosSalvos) {
        // Se achou, transforma de texto (JSON) de volta para Array do JS
        return JSON.parse(dadosSalvos);
    }

    // Se não achou nada (primeiro acesso), salva o mock inicial e retorna ele
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockInicial));
    return mockInicial;
}

export async function saveEvent(novoEvento) {
    // 1. Busca a lista atual de eventos
    const eventos = await getEvents();

    // 2. Cria um ID único para o novo evento e adiciona uma imagem aleatória
    const novoId = Date.now(); 
    novoEvento.id = novoId;
    
    // Gera uma imagem aleatória usando o site Picsum se não houver imagem
    if (!novoEvento.imagem) {
        novoEvento.imagem = `https://picsum.photos/300/200?${novoId}`;
    }

    // 3. Adiciona o novo evento na lista
    eventos.push(novoEvento);

    // 4. Salva a lista atualizada de volta no navegador (como texto)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventos));
}

//Lógica do edit-event-admin

export async function getEventById(id) {
    const eventos = await getEvents();
    // Garante que a comparação seja feita com números
    return eventos.find(evento => evento.id === Number(id));
}

export async function updateEvent(id, dadosAtualizados) {
    const eventos = await getEvents();
    const index = eventos.findIndex(evento => evento.id === Number(id));
    
    if (index !== -1) {
        // Atualiza apenas as propriedades enviadas, mantendo o id e a imagem
        eventos[index] = { ...eventos[index], ...dadosAtualizados };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(eventos));
    }
}

export async function deleteEvent(id) {
    let eventos = await getEvents();
    // Filtra removendo o evento com o ID passado
    eventos = eventos.filter(evento => evento.id !== Number(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventos));
}