import { registerUser } from "../../shared/authService.js";

document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const cpf = document.getElementById("cpf").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const role = document.querySelector('input[name="role"]:checked').value;

    if (password !== confirmPassword) {
        alert("As senhas não coincidem!");
        return;
    }

    try {
        // Chamamos a função do nosso serviço, passando os dados estruturados
        await registerUser(name, email, cpf, password, role);

        alert("Conta criada com sucesso! Faça login para continuar.");
        
        // Após o registro, o fluxo ideal é mandar para a tela de login
        window.location.href = "../login/login.html"; 
    } catch (error) {
        // Se a API estourar algum erro (ex: E-mail já cadastrado, CPF inválido)
        alert(`Falha no cadastro: ${error.message}`);
    }
});