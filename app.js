// Configuração da API
const API_URL = 'http://localhost:3000/api/filmes';

// Elementos do DOM
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
const loading = document.getElementById('loading');
const noData = document.getElementById('no-data');
const movieCount = document.getElementById('movie-count');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Página carregada! Iniciando carregamento dos filmes...');
    carregarFilmes();
});

filmeForm.addEventListener('submit', salvarFilme);
btnCancelar.addEventListener('click', resetForm);
searchInput.addEventListener('input', filtrarFilmes);

// Função para carregar filmes
async function carregarFilmes() {
    console.log('🔄 Tentando carregar filmes da API...');
    
    try {
        // Mostrar loading
        loading.style.display = 'block';
        tableBody.innerHTML = '';
        noData.style.display = 'none';
        
        console.log('📡 Fazendo requisição para:', API_URL);
        
        const response = await fetch(API_URL);
        
        console.log('📥 Resposta recebida:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const filmes = await response.json();
        
        console.log('✅ Filmes carregados:', filmes);
        
        exibirFilmes(filmes);
        
    } catch (error) {
        console.error('❌ Erro ao carregar filmes:', error);
        mostrarToast('Erro ao conectar com o servidor! Verifique se o back-end está rodando.', 'error');
        tableBody.innerHTML = '';
        noData.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}

// Função para exibir filmes na tabela
function exibirFilmes(filmes) {
    console.log('🎨 Exibindo', filmes.length, 'filmes na tabela');
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    // Verificar se tem filmes
    if (!filmes || filmes.length === 0) {
        console.log('📭 Nenhum filme encontrado');
        noData.style.display = 'block';
        movieCount.innerHTML = '<span class="count-number">0</span> filmes';
        return;
    }
    
    // Esconder mensagem de vazio
    noData.style.display = 'none';
    
    // Atualizar contador
    movieCount.innerHTML = `<span class="count-number">${filmes.length}</span> filmes`;
    
    // Adicionar cada filme na tabela
    filmes.forEach(filme => {
        console.log('➕ Adicionando filme:', filme.titulo);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${filme.id}</td>
            <td><strong>${filme.titulo}</strong></td>
            <td>${filme.diretor || '-'}</td>
            <td>${filme.estudio || '-'}</td>
            <td>${filme.ano || '-'}</td>
            <td>${filme.preco ? 'R$ ' + parseFloat(filme.preco).toFixed(2).replace('.', ',') : '-'}</td>
            <td class="actions">
                <button class="btn-edit" onclick="editarFilme(${filme.id})">✏️ Editar</button>
                <button class="btn-danger" onclick="deletarFilme(${filme.id})">🗑️ Excluir</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
    
    console.log('✅ Tabela atualizada com sucesso!');
}

// Função para salvar filme
async function salvarFilme(e) {
    e.preventDefault();
    
    console.log('💾 Tentando salvar filme...');
    
    const filme = {
        titulo: titulo.value.trim(),
        diretor: diretor.value.trim(),
        estudio: estudio.value.trim() || null,
        ano: ano.value ? parseInt(ano.value) : null,
        preco: preco.value ? parseFloat(preco.value) : null
    };
    
    console.log('📦 Dados do filme:', filme);
    
    if (!filme.titulo || !filme.diretor) {
        mostrarToast('⚠️ Título e Diretor são obrigatórios!', 'error');
        return;
    }
    
    const id = filmeId.value;
    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? 'PUT' : 'POST';
    
    console.log(`📤 Enviando ${method} para ${url}`);
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filme)
        });
        
        console.log('📥 Resposta:', response.status);
        
        if (response.ok) {
            const filmeSalvo = await response.json();
            console.log('✅ Filme salvo:', filmeSalvo);
            
            mostrarToast(
                id ? '🎬 Filme atualizado com sucesso!' : '🍿 Filme adicionado à coleção!',
                'success'
            );
            resetForm();
            carregarFilmes();
        } else {
            const erro = await response.json();
            throw new Error(erro.erro || 'Erro ao salvar filme');
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        mostrarToast('❌ ' + error.message, 'error');
    }
}

// Função para editar filme
async function editarFilme(id) {
    console.log('✏️ Editando filme ID:', id);
    
    try {
        const response = await fetch(`${API_URL}/${id}`);
        
        console.log('📥 Resposta:', response.status);
        
        if (!response.ok) throw new Error('Filme não encontrado');
        
        const filme = await response.json();
        console.log('📦 Dados do filme:', filme);
        
        filmeId.value = filme.id;
        titulo.value = filme.titulo;
        diretor.value = filme.diretor;
        estudio.value = filme.estudio || '';
        ano.value = filme.ano || '';
        preco.value = filme.preco || '';
        
        formTitle.innerHTML = '<span class="icon">✏️</span> Editar Filme';
        btnCancelar.style.display = 'inline-flex';
        
        document.querySelector('.form-card').scrollIntoView({ 
            behavior: 'smooth' 
        });
        
    } catch (error) {
        console.error('❌ Erro:', error);
        mostrarToast('Erro ao carregar filme: ' + error.message, 'error');
    }
}

// Função para deletar filme
async function deletarFilme(id) {
    console.log('🗑️ Tentando deletar filme ID:', id);
    
    if (!confirm('🗑️ Tem certeza que deseja excluir este filme da coleção?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        console.log('📥 Resposta:', response.status);
        
        if (response.ok) {
            console.log('✅ Filme deletado');
            mostrarToast('🗑️ Filme removido da coleção!', 'success');
            carregarFilmes();
        } else {
            const erro = await response.json();
            throw new Error(erro.erro || 'Erro ao excluir filme');
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        mostrarToast('❌ ' + error.message, 'error');
    }
}

// Função para resetar formulário
function resetForm() {
    console.log('🔄 Resetando formulário');
    filmeForm.reset();
    filmeId.value = '';
    formTitle.innerHTML = '<span class="icon">🎥</span> Adicionar Novo Filme';
    btnCancelar.style.display = 'none';
}

// Função para filtrar filmes
function filtrarFilmes() {
    const termo = searchInput.value.toLowerCase();
    const linhas = tableBody.getElementsByTagName('tr');
    
    Array.from(linhas).forEach(linha => {
        const titulo = linha.cells[1].textContent.toLowerCase();
        const diretor = linha.cells[2].textContent.toLowerCase();
        linha.style.display = (titulo.includes(termo) || diretor.includes(termo)) ? '' : 'none';
    });
}

// Função para mostrar toast
function mostrarToast(mensagem, tipo) {
    const toastExistente = document.querySelector('.toast');
    if (toastExistente) toastExistente.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}