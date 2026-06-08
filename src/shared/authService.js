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

/**
 * Função para proteger páginas privadas
 * @param {string} roleNecessaria - Ex: 'Manager' ou 'Custumer' (opcional)
 */
export function protegerRota(roleNecessaria = null) {
    const token = localStorage.getItem('ticketflow_token');
    const role = localStorage.getItem('ticketflow_role');

    // 1. Se não tem token ou role, limpa qualquer lixo do cache e chuta pro login
    if (!token || !role) {
        localStorage.removeItem('ticketflow_token');
        localStorage.removeItem('ticketflow_role');
        window.location.href = "../login/login.html";

        // O throw Error para a execução do resto do JS da página imediatamente
        throw new Error("Redirecionando para o login. Sessão ausente.");
    }

    // 2. Se a página exige uma role específica e o usuário tem uma diferente
    if (roleNecessaria && role !== roleNecessaria) {
        alert("Acesso negado: Você não tem permissão para acessar esta página.");

        if (role === 'Manager') {
            window.location.href = "../home-admin/home-admin.html";
        } else if (role === 'Custumer') { // Ajuste para a string exata que sua API C# devolve para o cliente
            window.location.href = "../user-home/user-home.html";
        } else {
            // Se a role estiver completamente bugada no cache, expulsa pro login
            localStorage.removeItem('ticketflow_token');
            localStorage.removeItem('ticketflow_role');
            window.location.href = "../login/login.html";
        }

        throw new Error("Redirecionando. Permissão negada.");
    }
}

/**
 * Decodifica o Token JWT para pegar as informações embutidas (Claims)
 */
export function getLoggedUserId() {
    const token = localStorage.getItem('ticketflow_token');
    if (!token) return null;

    try {
        // O token JWT tem 3 partes separadas por ponto. A 2ª parte é o Payload (onde estão os dados)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payloadInfo = JSON.parse(jsonPayload);
        
        // O .NET salva o NameIdentifier usando essa chave longa de schema XML
        return payloadInfo['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    } catch (error) {
        console.error("Erro ao decodificar o token:", error);
        return null;
    }
}