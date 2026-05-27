const API_URL = 'http://localhost:8080/seu-projeto/filmeserv';

const filmeForm = document.getElementById('filme-form');
const filmeId = document.getElementById('filme-id');
const titulo = document.getElementById('titulo');
const diretor = document.getElementById('diretor');
const estudio = document.getElementById('estudio');
const ano = document.getElementById('ano');
const preco = document.getElementById('preco');
const btnCancelar = document.getElementById('btn-cancelar');
const formTitle = document.getElementById('form-title');
const searchInput = document.getElementById('search');
const tableBody = document.getElementById('filmes-table-body');
const noData = document.getElementById('no-data');

document.addEventListener('DOMContentLoaded', carregarFilmes);
filmeForm.addEventListener('submit', salvarFilme);
btnCancelar.addEventListener('click', resetForm);
searchInput.addEventListener('input', filtrarFilmes);

async function carregarFilmes() {
    try {
        const response = await fetch(`${API_URL}?acao=listar`);
        const filmes = await response.json();
        exibirFilmes(filmes);
    } catch (error) {
        mostrarToast('Erro ao carregar filmes: ' + error.message, 'error');
    }
}

function exibirFilmes(filmes) {
    tableBody.innerHTML = '';
    
    if (filmes.length === 0) {
        noData.style.display = 'block';
        return;
    }
    
    noData.style.display = 'none';
    
    filmes.forEach(filme => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${filme.id}</td>
            <td>${filme.titulo}</td>
            <td>${filme.diretor}</td>
            <td>${filme.estudio}</td>
            <td>${filme.ano}</td>
            <td>R$ ${parseFloat(filme.preco).toFixed(2)}</td>
            <td class="actions">
                <button class="btn-edit" onclick="editarFilme(${filme.id})">Editar</button>
                <button class="btn-danger" onclick="deletarFilme(${filme.id})">Excluir</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

async function salvarFilme(e) {
    e.preventDefault();
    
    const filme = {
        titulo: titulo.value,
        diretor: diretor.value,
        estudio: estudio.value,
        ano: parseInt(ano.value),
        preco: parseFloat(preco.value)
    };
    
    const id = filmeId.value;
    const url = id ? `${API_URL}?acao=atualizar&id=${id}` : `${API_URL}?acao=criar`;
    const method = id ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filme)
        });
        
        if (response.ok) {
            mostrarToast(id ? '🎬 Filme atualizado!' : '🎬 Filme adicionado!', 'success');
            resetForm();
            carregarFilmes();
        }
    } catch (error) {
        mostrarToast('Erro: ' + error.message, 'error');
    }
}

async function editarFilme(id) {
    try {
        const response = await fetch(`${API_URL}?acao=buscar&id=${id}`);
        const filme = await response.json();
        
        filmeId.value = filme.id;
        titulo.value = filme.titulo;
        diretor.value = filme.diretor;
        estudio.value = filme.estudio;
        ano.value = filme.ano;
        preco.value = filme.preco;
        
        formTitle.textContent = 'Editar Filme';
        btnCancelar.style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        mostrarToast('Erro ao carregar filme', 'error');
    }
}

async function deletarFilme(id) {
    if (!confirm('Excluir este filme permanentemente?')) return;
    
    try {
        await fetch(`${API_URL}?acao=deletar&id=${id}`, { method: 'DELETE' });
        mostrarToast('Filme excluído!', 'success');
        carregarFilmes();
    } catch (error) {
        mostrarToast('Erro ao excluir', 'error');
    }
}

function resetForm() {
    filmeForm.reset();
    filmeId.value = '';
    formTitle.textContent = 'Adicionar Novo Filme';
    btnCancelar.style.display = 'none';
}

function filtrarFilmes() {
    const termo = searchInput.value.toLowerCase();
    document.querySelectorAll('#filmes-table-body tr').forEach(linha => {
        const titulo = linha.cells[1].textContent.toLowerCase();
        const diretor = linha.cells[2].textContent.toLowerCase();
        linha.style.display = (titulo.includes(termo) || diretor.includes(termo)) ? '' : 'none';
    });
}

function mostrarToast(mensagem, tipo) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}