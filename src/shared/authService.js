const API_BASE_URL = 'https://localhost:7200'; 

// Função login
export async function loginUser(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        // O backend C# espera os dados exatos definidos no seu DTO
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        // Captura a mensagem de erro que vem da sua API para mostrarmos na tela
        const errorData = await response.json().catch(() => ({})); 
        throw new Error(errorData.message || 'E-mail ou senha incorretos.');
    }

    // A API deve retornar algo como { token: "eyJhb...", role: 0 }
    return await response.json(); 
}

/**
 * Função para realizar o Cadastro (Register)
 */
export async function registerUser(name, email, cpf, password, role) {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            name, 
            email, 
            cpf, 
            password, 
            role: Number(role) // Garantindo que o role vá como número (0 ou 1)
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao realizar o cadastro. Verifique os dados.');
    }

    // Geralmente o endpoint de registro retorna o próprio usuário criado ou já devolve um token
    return await response.json(); 
}

/**
 * Funções auxiliares para gerenciar a sessão localmente
 */
export function salvarSessao(token, role) {
    localStorage.setItem('ticketflow_token', token);
    localStorage.setItem('ticketflow_role', role);
}

export function limparSessao() {
    localStorage.removeItem('ticketflow_token');
    localStorage.removeItem('ticketflow_role');
}

export function isAuthenticated() {
    return !!localStorage.getItem('ticketflow_token');
}