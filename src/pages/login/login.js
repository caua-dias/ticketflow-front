import { loginUser, salvarSessao } from "../../shared/authService.js";

// Pegamos o formulário da página de login
const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
    // ESSENCIAL: Impede que a página recarregue e coloque aquele "#" na URL
    e.preventDefault();

    // No seu login.html, garanta que os inputs tenham os IDs "email" e "password"
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // Envia para a API validar
        const responseData = await loginUser(email, password);

        // A API retorna o token e os dados do usuário (incluindo o role)
        // Vamos usar a função que criamos para salvar no localStorage
        salvarSessao(responseData.token, responseData.role);

        alert("Login efetuado com sucesso!");

        // ---------------------------------------------------------
        // O ROTEAMENTO INTELIGENTE:
        // Role 0 = Cliente -> Vai para user-home
        // Role 1 = Admin   -> Vai para home-admin
        // ---------------------------------------------------------
        if (responseData.role === "Manager") {
            window.location.href = "../home-admin/home-admin.html";
        } else {
            window.location.href = "../user-home/user-home.html";
        }

    } catch (error) {
        // Se a API retornar erro (senha errada, usuário não existe)
        alert(error.message);
    }
});