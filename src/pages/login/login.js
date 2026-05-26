document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault(); 

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("https://localhost:5001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        const data = await response.json();

        localStorage.setItem("token", data.token);

        // Redireciona para a página principal
        window.location.href = "../home/home.html";
    } else {
        alert("E-mail ou senha inválidos!");
    }
});
