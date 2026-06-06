// Chave para identificar nossos dados no navegador
const STORAGE_KEY = '@TicketFlow:events';

// Dados iniciais caso o usuário nunca tenha entrado
const mockInicial = [
    {
        id: 1,
        titulo: "Neon Pulse 2024",
        categoria: "Festival de Música",
        imagem: "https://picsum.photos/300/200?1"
    },
    {
        id: 2,
        titulo: "Future of Flow",
        categoria: "Tecnologia",
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