import {
    getFilmes,
    getFilmeById,
    criarFilme,
    atualizarFilme,
    deletarFilme,
    pesquisarFilmes
} from "./api.js";

const form = document.getElementById("filme-form");
const tbody = document.getElementById("filmes-table-body");
const searchInput = document.getElementById("search");

const idInput = document.getElementById("filme-id");
const tituloInput = document.getElementById("titulo");
const diretorInput = document.getElementById("diretor");
const estudioInput = document.getElementById("estudio");
const anoInput = document.getElementById("ano");
const precoInput = document.getElementById("preco");

const btnCancelar =
    document.getElementById("btn-cancelar");

let editando = false;

async function carregarFilmes() {

    const filmes = await getFilmes();

    tbody.innerHTML = "";

    filmes.forEach(filme => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${filme.id}</td>
            <td>${filme.titulo}</td>
            <td>${filme.diretor}</td>
            <td>${filme.estudio || "-"}</td>
            <td>${filme.ano || "-"}</td>
            <td>R$ ${filme.preco || 0}</td>

            <td>
                <button onclick="editarFilme(${filme.id})">
                    Editar
                </button>

                <button onclick="removerFilme(${filme.id})">
                    Excluir
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function limparFormulario() {

    form.reset();

    idInput.value = "";

    editando = false;

    btnCancelar.style.display = "none";
}

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const filme = {
        titulo: tituloInput.value.trim(),
        diretor: diretorInput.value.trim(),
        estudio: estudioInput.value.trim(),
        ano: Number(anoInput.value),
        preco: Number(precoInput.value)
    };

    if (!filme.titulo) {
        alert("Título obrigatório");
        return;
    }

    if (!filme.diretor) {
        alert("Diretor obrigatório");
        return;
    }

    try {

        if (editando) {

            await atualizarFilme(
                idInput.value,
                filme
            );

            alert("Filme atualizado!");
        } else {

            await criarFilme(filme);

            alert("Filme cadastrado!");
        }

        limparFormulario();

        carregarFilmes();

    } catch (error) {

        console.error(error);

        alert("Erro ao salvar filme");
    }
});

window.editarFilme = async function(id) {

    const filme = await getFilmeById(id);

    if (!filme) return;

    idInput.value = filme.id;

    tituloInput.value = filme.titulo;
    diretorInput.value = filme.diretor;
    estudioInput.value = filme.estudio;
    anoInput.value = filme.ano;
    precoInput.value = filme.preco;

    editando = true;

    btnCancelar.style.display = "inline-block";
};

window.removerFilme = async function(id) {

    const confirmar = confirm(
        "Deseja realmente excluir?"
    );

    if (!confirmar) return;

    await deletarFilme(id);

    carregarFilmes();
};

btnCancelar.addEventListener("click", () => {

    limparFormulario();
});

searchInput.addEventListener("input", async () => {

    const texto = searchInput.value;

    if (!texto) {
        carregarFilmes();
        return;
    }

    const filmes =
        await pesquisarFilmes(texto);

    tbody.innerHTML = "";

    filmes.forEach(filme => {

        tbody.innerHTML += `
            <tr>
                <td>${filme.id}</td>
                <td>${filme.titulo}</td>
                <td>${filme.diretor}</td>
                <td>${filme.estudio || "-"}</td>
                <td>${filme.ano || "-"}</td>
                <td>R$ ${filme.preco || 0}</td>

                <td>
                    <button onclick="editarFilme(${filme.id})">
                        Editar
                    </button>

                    <button onclick="removerFilme(${filme.id})">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    });
});

carregarFilmes();