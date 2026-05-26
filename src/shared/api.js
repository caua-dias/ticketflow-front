async function fetchAutenticado(url, opcoes = {}) {
    const token = localStorage.getItem("token");

    const response = await fetch(url, {
        ...opcoes,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, 
            ...opcoes.headers
        }
    });

    if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "../login/login.html";
    }

    return response;
}
