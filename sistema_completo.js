// ===== LUCKHOUSE GAMES - SISTEMA DE GESTÃO v5.0 COMPLETO =====
// JavaScript Principal com TODOS os módulos implementados

// ===== CONFIGURAÇÕES GLOBAIS =====
let STORE_CONFIG = {};
let ORDENS_SERVICO = [];
let CLIENTES = [];
let PRODUTOS = [];
let SERVICOS = [];
let VENDAS = [];
let RECEITAS = [];
let DESPESAS = [];
let ENVIOS_LAB = [];
let TECNICOS = [];
let AVALIACOES_CONSOLES = [];
let TRANSACOES_FINANCEIRAS = [];
let CADASTROS_AUXILIARES = { 
    tipos: ['Console', 'Controle', 'Acessório', 'Cabo', 'Fonte', 'Outro'], 
    marcas: ['Sony', 'Microsoft', 'Nintendo', 'Genérico', 'Outro'], 
    modelos: ['PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series', 'Nintendo Switch', 'Outro'], 
    categoriasProduto: ['Console', 'Controle', 'Jogo', 'Acessório', 'Cabo', 'Outro'],
    categoriasDespesa: ['Aluguel', 'Energia', 'Internet', 'Telefone', 'Materiais', 'Salários', 'Impostos', 'Outros']
};

let pdvCartItems = [];
let pdvPontosDesconto = { pontos: 0, valor: 0 };
let CURRENT_USER = { username: null, role: null };

// ===== FUNÇÕES UTILITÁRIAS =====
function showToast(message, type = "primary", title = "Sistema") {
    try {
        const toastEl = document.getElementById('liveToast');
        if (!toastEl) {
            console.log(`${title}: ${message}`);
            return;
        }
        
        const toastMessageEl = document.getElementById('toast-message');
        const toastHeaderEl = toastEl.querySelector('.toast-header');
        
        if (toastMessageEl) toastMessageEl.textContent = message;
        
        // Aplicar cores baseadas no tipo
        const typeClasses = {
            success: 'bg-success text-white',
            danger: 'bg-danger text-white',
            warning: 'bg-warning text-dark',
            info: 'bg-info text-white',
            primary: 'bg-primary text-white'
        };
        
        const classesToAdd = typeClasses[type] || typeClasses.primary;
        toastHeaderEl.className = `toast-header ${classesToAdd}`;
        
        bootstrap.Toast.getOrCreateInstance(toastEl).show();
    } catch (error) {
        console.error("Erro ao mostrar toast:", error);
        console.log(`${title}: ${message}`);
    }
}

function formatCurrency(value) {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "R$ 0,00";
    return numValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getNextId(collection) {
    if (!Array.isArray(collection) || collection.length === 0) return 1;
    const maxId = Math.max(0, ...collection.map(item => Number(item.id) || 0));
    return maxId + 1;
}

function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Erro ao salvar ${key}:`, error);
        return false;
    }
}

function loadData(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Erro ao carregar ${key}:`, error);
        return defaultValue;
    }
}

// ===== SISTEMA DE LOGIN =====
function setupLoginSystem() {
    const formLogin = document.getElementById('formLogin');
    if (!formLogin) return;

    formLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-usuario').value.trim();
        const password = document.getElementById('login-senha').value;
        
        // Validar credenciais
        if (username === 'admin' && password === 'admin') {
            CURRENT_USER = { username: 'Administrador', role: 'admin' };
        } else if (username === 'luckmaster' && password === 'L@1998*') {
            CURRENT_USER = { username: 'Luck Master', role: 'admin' };
        } else {
            showToast("Usuário ou senha incorretos!", "danger", "Erro de Login");
            return;
        }
        
        // Login bem-sucedido
        showToast(`Bem-vindo, ${CURRENT_USER.username}!`, "success", "Login");
        
        // Esconder tela de login e mostrar aplicação
        document.getElementById('login-screen').classList.add('d-none');
        document.getElementById('main-app').classList.remove('d-none');
        
        // Inicializar aplicação
        initializeApp();
    });
}

// ===== NAVEGAÇÃO =====
function setupNavigation() {
    // Toggle sidebar
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar-wrapper');
    const pageContent = document.getElementById('page-content-wrapper');
    
    if (menuToggle && sidebar && pageContent) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            pageContent.classList.toggle('active');
        });
    }
    
    // Links de navegação
    const navLinks = document.querySelectorAll('.nav-link[data-target]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            navigateToSection(target);
            
            // Atualizar link ativo
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Atualizar título da página
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = this.textContent.trim();
            }
        });
    });
    
    // Cards do dashboard
    const dashboardCards = document.querySelectorAll('.dashboard-card[data-target]');
    dashboardCards.forEach(card => {
        card.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            navigateToSection(target);
            
            // Atualizar navegação
            navLinks.forEach(l => l.classList.remove('active'));
            const targetLink = document.querySelector(`.nav-link[data-target="${target}"]`);
            if (targetLink) {
                targetLink.classList.add('active');
                const pageTitle = document.getElementById('page-title');
                if (pageTitle) {
                    pageTitle.textContent = targetLink.textContent.trim();
                }
            }
        });
    });
    
    // Logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja sair?')) {
                CURRENT_USER = { username: null, role: null };
                document.getElementById('main-app').classList.add('d-none');
                document.getElementById('login-screen').classList.remove('d-none');
                
                // Limpar formulário de login
                document.getElementById('formLogin').reset();
                
                showToast("Logout realizado com sucesso!", "info", "Sistema");
            }
        });
    }
}

function navigateToSection(sectionId) {
    // Esconder todas as seções
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.add('d-none'));
    
    // Mostrar seção alvo
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.remove('d-none');
        targetSection.classList.add('animate-fade-in');
        
        // Remover animação após completar
        setTimeout(() => {
            targetSection.classList.remove('animate-fade-in');
        }, 300);
        
        // Carregar dados específicos da seção
        switch(sectionId) {
            case 'ordens-servico':
                renderOSList();
                break;
            case 'pdv':
                updatePdvUI();
                break;
            case 'financeiro':
                renderFinanceiroModule();
                break;
            case 'envio-lab':
                renderEnvioLabList();
                break;
            case 'tecnicos':
                renderTecnicosList();
                break;
            case 'avaliacao-consoles':
                renderAvaliacaoConsolesList();
                break;
            case 'relatorios':
                renderRelatoriosModule();
                break;
        }
    }
}

// ===== DASHBOARD =====
function updateDashboard() {
    // Atualizar contadores
    document.getElementById('dashboard-total-clientes').textContent = CLIENTES.length;
    document.getElementById('dashboard-total-produtos').textContent = PRODUTOS.length;
    
    const osAtivas = ORDENS_SERVICO.filter(os => 
        ['Aguardando Orçamento', 'Orçamento Aprovado', 'Em Andamento', 'Aguardando Peça'].includes(os.status)
    ).length;
    document.getElementById('dashboard-os-ativas').textContent = osAtivas;
    
    const faturamentoMes = VENDAS
        .filter(v => new Date(v.timestamp).getMonth() === new Date().getMonth())
        .reduce((sum, v) => sum + v.total, 0);
    document.getElementById('dashboard-faturamento').textContent = formatCurrency(faturamentoMes);
    
    // Resumo financeiro
    const totalReceitas = RECEITAS.reduce((sum, r) => sum + r.valor, 0);
    const totalDespesas = DESPESAS.reduce((sum, d) => sum + d.valor, 0);
    const saldo = totalReceitas - totalDespesas;
    
    document.getElementById('dashboard-receitas').textContent = formatCurrency(totalReceitas);
    document.getElementById('dashboard-despesas').textContent = formatCurrency(totalDespesas);
    document.getElementById('dashboard-saldo').textContent = formatCurrency(saldo);
    document.getElementById('dashboard-saldo').className = saldo >= 0 ? 'text-success' : 'text-danger';
    
    // OS Recentes
    renderDashboardOSRecentes();
}

function renderDashboardOSRecentes() {
    const container = document.getElementById('dashboard-os-recentes');
    if (!container) return;
    
    const osRecentes = ORDENS_SERVICO
        .sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura))
        .slice(0, 5);
    
    if (osRecentes.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhuma OS cadastrada.</p>';
        return;
    }
    
    container.innerHTML = osRecentes.map(os => {
        const cliente = CLIENTES.find(c => c.id === os.clienteId);
        const statusClass = {
            'Aguardando Orçamento': 'warning',
            'Orçamento Aprovado': 'info',
            'Em Andamento': 'primary',
            'Concluído': 'success',
            'Entregue': 'success',
            'Cancelado': 'danger'
        };
        
        return `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-dark-tertiary rounded">
                <div>
                    <strong>OS #${String(os.id).padStart(6, '0')}</strong>
                    <br>
                    <small class="text-muted">${cliente ? cliente.nome : 'Cliente não encontrado'}</small>
                </div>
                <span class="badge bg-${statusClass[os.status] || 'secondary'}">${os.status}</span>
            </div>
        `;
    }).join('');
}

// ===== GESTÃO DE CLIENTES =====
function setupClientesModule() {
    const btnNovoCliente = document.getElementById('btn-novo-cliente');
    if (btnNovoCliente) {
        btnNovoCliente.addEventListener('click', () => {
            document.getElementById('formNovoCliente').reset();
            document.getElementById('cliente-id').value = '';
            document.getElementById('modalNovoClienteLabelDynamic').textContent = 'Novo Cliente';
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovoCliente')).show();
        });
    }
    
    const formNovoCliente = document.getElementById('formNovoCliente');
    if (formNovoCliente) {
        formNovoCliente.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('cliente-id').value;
            const clienteData = {
                nome: document.getElementById('cliente-nome').value.trim(),
                telefone: document.getElementById('cliente-telefone').value.trim(),
                cpf: document.getElementById('cliente-cpf').value.trim(),
                email: document.getElementById('cliente-email').value.trim(),
                endereco: document.getElementById('cliente-endereco').value.trim(),
                pontosFidelidade: parseInt(document.getElementById('cliente-pontos').value) || 0
            };
            
            if (!clienteData.nome) {
                showToast("Nome é obrigatório!", "warning");
                return;
            }
            
            if (id) {
                // Editar cliente existente
                const index = CLIENTES.findIndex(c => c.id == id);
                if (index !== -1) {
                    CLIENTES[index] = { ...CLIENTES[index], ...clienteData };
                    showToast("Cliente atualizado com sucesso!", "success");
                }
            } else {
                // Novo cliente
                const novoCliente = {
                    id: getNextId(CLIENTES),
                    ...clienteData,
                    dataCadastro: new Date().toISOString()
                };
                CLIENTES.push(novoCliente);
                showToast("Cliente cadastrado com sucesso!", "success");
            }
            
            saveData('luckhouse_clientes', CLIENTES);
            renderClientesList();
            updateDashboard();
            bootstrap.Modal.getInstance(document.getElementById('modalNovoCliente')).hide();
        });
    }
    
    // Busca de clientes
    const btnSearchCliente = document.getElementById('btn-search-cliente');
    const searchClienteInput = document.getElementById('searchClienteInput');
    
    if (btnSearchCliente && searchClienteInput) {
        btnSearchCliente.addEventListener('click', filterClientesList);
        searchClienteInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') filterClientesList();
        });
    }
}

function renderClientesList(list = CLIENTES) {
    const container = document.getElementById('cliente-list-container');
    if (!container) return;
    
    if (list.length === 0) {
        container.innerHTML = '<p class="text-muted p-2">Nenhum cliente cadastrado.</p>';
        return;
    }
    
    container.innerHTML = list.map(cliente => `
        <div class="list-group-item list-group-item-action bg-dark-secondary">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1 text-primary-custom">${cliente.nome}</h6>
                    <p class="mb-1 small">
                        ${cliente.telefone ? `<i class="fas fa-phone me-1"></i>${cliente.telefone}` : ''}
                        ${cliente.email ? `<i class="fas fa-envelope me-1 ms-2"></i>${cliente.email}` : ''}
                    </p>
                    ${cliente.cpf ? `<p class="mb-0 small text-muted">CPF: ${cliente.cpf}</p>` : ''}
                    ${cliente.pontosFidelidade > 0 ? `<p class="mb-0 small text-success">Pontos: ${cliente.pontosFidelidade}</p>` : ''}
                </div>
                <div class="btn-group-vertical">
                    <button class="btn btn-sm btn-outline-primary-custom mb-1" onclick="editarCliente(${cliente.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success-custom mb-1" onclick="abrirWhatsAppCliente(${cliente.id})">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="excluirCliente(${cliente.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterClientesList() {
    const term = document.getElementById('searchClienteInput').value.toLowerCase();
    if (!term) {
        renderClientesList();
        return;
    }
    
    const filtered = CLIENTES.filter(cliente => 
        cliente.nome.toLowerCase().includes(term) ||
        (cliente.telefone && cliente.telefone.includes(term)) ||
        (cliente.cpf && cliente.cpf.includes(term)) ||
        (cliente.email && cliente.email.toLowerCase().includes(term))
    );
    
    renderClientesList(filtered);
}

function editarCliente(id) {
    const cliente = CLIENTES.find(c => c.id == id);
    if (!cliente) return;
    
    document.getElementById('cliente-id').value = cliente.id;
    document.getElementById('cliente-nome').value = cliente.nome;
    document.getElementById('cliente-telefone').value = cliente.telefone || '';
    document.getElementById('cliente-cpf').value = cliente.cpf || '';
    document.getElementById('cliente-email').value = cliente.email || '';
    document.getElementById('cliente-endereco').value = cliente.endereco || '';
    document.getElementById('cliente-pontos').value = cliente.pontosFidelidade || 0;
    document.getElementById('modalNovoClienteLabelDynamic').textContent = 'Editar Cliente';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovoCliente')).show();
}

function excluirCliente(id) {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    
    CLIENTES = CLIENTES.filter(c => c.id != id);
    saveData('luckhouse_clientes', CLIENTES);
    renderClientesList();
    updateDashboard();
    showToast("Cliente excluído com sucesso!", "success");
}

function abrirWhatsAppCliente(id) {
    const cliente = CLIENTES.find(c => c.id == id);
    if (!cliente || !cliente.telefone) {
        showToast("Cliente não possui telefone cadastrado!", "warning");
        return;
    }
    
    const telefone = cliente.telefone.replace(/\D/g, '');
    const mensagem = `Olá ${cliente.nome}, tudo bem? Aqui é da Luckhouse Games!`;
    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

// ===== GESTÃO DE PRODUTOS =====
function setupProdutosModule() {
    const btnNovoProduto = document.getElementById('btn-novo-produto');
    if (btnNovoProduto) {
        btnNovoProduto.addEventListener('click', () => {
            document.getElementById('formNovoProduto').reset();
            document.getElementById('produto-id').value = '';
            document.getElementById('modalNovoProdutoLabelDynamic').textContent = 'Novo Produto';
            populateSelectFromAux('produto-categoria', 'categoriasProduto', 'Selecione uma categoria...');
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovoProduto')).show();
        });
    }
    
    const formNovoProduto = document.getElementById('formNovoProduto');
    if (formNovoProduto) {
        formNovoProduto.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('produto-id').value;
            const produtoData = {
                nome: document.getElementById('produto-nome').value.trim(),
                categoria: document.getElementById('produto-categoria').value,
                precoCusto: parseFloat(document.getElementById('produto-custo').value) || 0,
                precoVenda: parseFloat(document.getElementById('produto-preco').value),
                estoque: parseInt(document.getElementById('produto-estoque').value) || 0,
                isVideogame: document.getElementById('produto-is-videogame').checked,
                consignado: document.getElementById('produto-consignado').checked
            };
            
            if (!produtoData.nome || isNaN(produtoData.precoVenda)) {
                showToast("Preencha todos os campos obrigatórios!", "warning");
                return;
            }
            
            if (id) {
                // Editar produto existente
                const index = PRODUTOS.findIndex(p => p.id == id);
                if (index !== -1) {
                    PRODUTOS[index] = { ...PRODUTOS[index], ...produtoData };
                    showToast("Produto atualizado com sucesso!", "success");
                }
            } else {
                // Novo produto
                const novoProduto = {
                    id: getNextId(PRODUTOS),
                    ...produtoData,
                    dataCadastro: new Date().toISOString()
                };
                PRODUTOS.push(novoProduto);
                showToast("Produto cadastrado com sucesso!", "success");
            }
            
            saveData('luckhouse_produtos', PRODUTOS);
            renderProdutosList();
            updateDashboard();
            bootstrap.Modal.getInstance(document.getElementById('modalNovoProduto')).hide();
        });
    }
}

function renderProdutosList(list = PRODUTOS) {
    const container = document.getElementById('produto-list-container');
    if (!container) return;
    
    if (list.length === 0) {
        container.innerHTML = '<p class="text-muted p-2">Nenhum produto cadastrado.</p>';
        return;
    }
    
    container.innerHTML = list.map(produto => `
        <div class="list-group-item list-group-item-action bg-dark-secondary">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1 text-primary-custom">
                        ${produto.nome}
                        ${produto.isVideogame ? '<i class="fas fa-gamepad text-info ms-2"></i>' : ''}
                        ${produto.consignado ? '<i class="fas fa-handshake text-warning ms-2"></i>' : ''}
                    </h6>
                    <p class="mb-1">
                        <span class="text-success fw-bold">${formatCurrency(produto.precoVenda)}</span>
                        ${produto.categoria ? `<span class="badge bg-secondary ms-2">${produto.categoria}</span>` : ''}
                    </p>
                    <p class="mb-0 small text-muted">
                        Estoque: ${produto.estoque} | 
                        Custo: ${formatCurrency(produto.precoCusto)}
                    </p>
                </div>
                <div class="btn-group-vertical">
                    <button class="btn btn-sm btn-outline-primary-custom mb-1" onclick="editarProduto(${produto.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="excluirProduto(${produto.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function editarProduto(id) {
    const produto = PRODUTOS.find(p => p.id == id);
    if (!produto) return;
    
    document.getElementById('produto-id').value = produto.id;
    document.getElementById('produto-nome').value = produto.nome;
    populateSelectFromAux('produto-categoria', 'categoriasProduto', 'Selecione uma categoria...');
    document.getElementById('produto-categoria').value = produto.categoria || '';
    document.getElementById('produto-custo').value = produto.precoCusto;
    document.getElementById('produto-preco').value = produto.precoVenda;
    document.getElementById('produto-estoque').value = produto.estoque;
    document.getElementById('produto-is-videogame').checked = produto.isVideogame || false;
    document.getElementById('produto-consignado').checked = produto.consignado || false;
    document.getElementById('modalNovoProdutoLabelDynamic').textContent = 'Editar Produto';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovoProduto')).show();
}

function excluirProduto(id) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    
    PRODUTOS = PRODUTOS.filter(p => p.id != id);
    saveData('luckhouse_produtos', PRODUTOS);
    renderProdutosList();
    updateDashboard();
    showToast("Produto excluído com sucesso!", "success");
}

// ===== GESTÃO DE SERVIÇOS =====
function setupServicosModule() {
    const btnNovoServico = document.getElementById('btn-novo-servico');
    if (btnNovoServico) {
        btnNovoServico.addEventListener('click', () => {
            document.getElementById('formNovoServico').reset();
            document.getElementById('servico-id').value = '';
            document.getElementById('modalNovoServicoLabelDynamic').textContent = 'Novo Serviço';
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovoServico')).show();
        });
    }
    
    const formNovoServico = document.getElementById('formNovoServico');
    if (formNovoServico) {
        formNovoServico.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('servico-id').value;
            const servicoData = {
                nome: document.getElementById('servico-nome').value.trim(),
                descricao: document.getElementById('servico-descricao').value.trim(),
                custoTecnico: parseFloat(document.getElementById('servico-custo-tecnico').value) || 0,
                valorCliente: parseFloat(document.getElementById('servico-valor').value)
            };
            
            if (!servicoData.nome || isNaN(servicoData.valorCliente)) {
                showToast("Preencha todos os campos obrigatórios!", "warning");
                return;
            }
            
            if (id) {
                // Editar serviço existente
                const index = SERVICOS.findIndex(s => s.id == id);
                if (index !== -1) {
                    SERVICOS[index] = { ...SERVICOS[index], ...servicoData };
                    showToast("Serviço atualizado com sucesso!", "success");
                }
            } else {
                // Novo serviço
                const novoServico = {
                    id: getNextId(SERVICOS),
                    ...servicoData,
                    dataCadastro: new Date().toISOString()
                };
                SERVICOS.push(novoServico);
                showToast("Serviço cadastrado com sucesso!", "success");
            }
            
            saveData('luckhouse_servicos', SERVICOS);
            renderServicosList();
            bootstrap.Modal.getInstance(document.getElementById('modalNovoServico')).hide();
        });
    }
}

function renderServicosList(list = SERVICOS) {
    const container = document.getElementById('servico-list-container');
    if (!container) return;
    
    if (list.length === 0) {
        container.innerHTML = '<p class="text-muted p-2">Nenhum serviço cadastrado.</p>';
        return;
    }
    
    container.innerHTML = list.map(servico => `
        <div class="list-group-item list-group-item-action bg-dark-secondary">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1 text-success-custom">${servico.nome}</h6>
                    <p class="mb-1">
                        <span class="text-success fw-bold">${formatCurrency(servico.valorCliente)}</span>
                        <span class="text-muted ms-2">Custo: ${formatCurrency(servico.custoTecnico)}</span>
                    </p>
                    ${servico.descricao ? `<p class="mb-0 small text-muted">${servico.descricao}</p>` : ''}
                </div>
                <div class="btn-group-vertical">
                    <button class="btn btn-sm btn-outline-primary-custom mb-1" onclick="editarServico(${servico.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="excluirServico(${servico.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function editarServico(id) {
    const servico = SERVICOS.find(s => s.id == id);
    if (!servico) return;
    
    document.getElementById('servico-id').value = servico.id;
    document.getElementById('servico-nome').value = servico.nome;
    document.getElementById('servico-descricao').value = servico.descricao || '';
    document.getElementById('servico-custo-tecnico').value = servico.custoTecnico;
    document.getElementById('servico-valor').value = servico.valorCliente;
    document.getElementById('modalNovoServicoLabelDynamic').textContent = 'Editar Serviço';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovoServico')).show();
}

function excluirServico(id) {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    
    SERVICOS = SERVICOS.filter(s => s.id != id);
    saveData('luckhouse_servicos', SERVICOS);
    renderServicosList();
    showToast("Serviço excluído com sucesso!", "success");
}

// ===== MÓDULO DE ORDENS DE SERVIÇO (OS) =====
function setupOSModule() {
    const btnNovaOS = document.getElementById('btn-nova-os');
    if (btnNovaOS) {
        btnNovaOS.addEventListener('click', () => {
            document.getElementById('formNovaOS').reset();
            document.getElementById('os-id').value = '';
            document.getElementById('modalNovaOSLabelDynamic').textContent = 'Nova Ordem de Serviço';
            populateClienteSelect('os-cliente-select');
            populateServicoSelect('os-servico-select');
            populateTecnicoSelect('os-tecnico-select');
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovaOS')).show();
        });
    }
    
    const formNovaOS = document.getElementById('formNovaOS');
    if (formNovaOS) {
        formNovaOS.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('os-id').value;
            const osData = {
                clienteId: parseInt(document.getElementById('os-cliente-select').value),
                equipamento: document.getElementById('os-equipamento').value.trim(),
                marca: document.getElementById('os-marca').value.trim(),
                modelo: document.getElementById('os-modelo').value.trim(),
                serial: document.getElementById('os-serial').value.trim(),
                problemaDescricao: document.getElementById('os-problema').value.trim(),
                observacoes: document.getElementById('os-observacoes').value.trim(),
                valorOrcamento: parseFloat(document.getElementById('os-valor').value) || 0,
                status: document.getElementById('os-status').value,
                servicoId: parseInt(document.getElementById('os-servico-select').value) || null,
                tecnicoId: parseInt(document.getElementById('os-tecnico-select').value) || null
            };
            
            if (!osData.clienteId || !osData.equipamento || !osData.problemaDescricao) {
                showToast("Preencha todos os campos obrigatórios!", "warning");
                return;
            }
            
            if (id) {
                // Editar OS existente
                const index = ORDENS_SERVICO.findIndex(os => os.id == id);
                if (index !== -1) {
                    ORDENS_SERVICO[index] = { ...ORDENS_SERVICO[index], ...osData };
                    showToast("OS atualizada com sucesso!", "success");
                }
            } else {
                // Nova OS
                const novaOS = {
                    id: getNextId(ORDENS_SERVICO),
                    ...osData,
                    dataAbertura: new Date().toISOString(),
                    dataUltimaAtualizacao: new Date().toISOString()
                };
                ORDENS_SERVICO.push(novaOS);
                showToast("OS criada com sucesso!", "success");
            }
            
            saveData('luckhouse_os', ORDENS_SERVICO);
            renderOSList();
            updateDashboard();
            bootstrap.Modal.getInstance(document.getElementById('modalNovaOS')).hide();
        });
    }
}

function renderOSList(list = ORDENS_SERVICO) {
    const container = document.getElementById('os-list-container');
    if (!container) return;
    
    if (list.length === 0) {
        container.innerHTML = '<p class="text-muted p-2">Nenhuma OS cadastrada.</p>';
        return;
    }
    
    container.innerHTML = list.map(os => {
        const cliente = CLIENTES.find(c => c.id === os.clienteId);
        const servico = SERVICOS.find(s => s.id === os.servicoId);
        const tecnico = TECNICOS.find(t => t.id === os.tecnicoId);
        
        const statusClass = {
            'Aguardando Orçamento': 'warning',
            'Orçamento Aprovado': 'info',
            'Em Andamento': 'primary',
            'Aguardando Peça': 'secondary',
            'Concluído': 'success',
            'Entregue': 'success',
            'Cancelado': 'danger'
        };
        
        return `
            <div class="card bg-dark-secondary mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title text-primary-custom">OS #${String(os.id).padStart(6, '0')}</h6>
                            <p class="card-text mb-1"><strong>Cliente:</strong> ${cliente ? cliente.nome : 'N/A'}</p>
                            <p class="card-text mb-1"><strong>Equipamento:</strong> ${os.equipamento} ${os.marca} ${os.modelo}</p>
                            <p class="card-text mb-1"><strong>Problema:</strong> ${os.problemaDescricao}</p>
                            ${servico ? `<p class="card-text mb-1"><strong>Serviço:</strong> ${servico.nome}</p>` : ''}
                            ${tecnico ? `<p class="card-text mb-1"><strong>Técnico:</strong> ${tecnico.nome}</p>` : ''}
                            <p class="card-text mb-1"><strong>Valor:</strong> ${formatCurrency(os.valorOrcamento)}</p>
                            <small class="text-muted">Aberta em: ${new Date(os.dataAbertura).toLocaleDateString('pt-BR')}</small>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-${statusClass[os.status] || 'secondary'} mb-2">${os.status}</span>
                            <div class="btn-group-vertical">
                                <button class="btn btn-sm btn-outline-primary-custom mb-1" onclick="editarOS(${os.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-info mb-1" onclick="imprimirOS(${os.id})">
                                    <i class="fas fa-print"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="excluirOS(${os.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function editarOS(id) {
    const os = ORDENS_SERVICO.find(o => o.id == id);
    if (!os) return;
    
    document.getElementById('os-id').value = os.id;
    populateClienteSelect('os-cliente-select');
    document.getElementById('os-cliente-select').value = os.clienteId;
    document.getElementById('os-equipamento').value = os.equipamento;
    document.getElementById('os-marca').value = os.marca;
    document.getElementById('os-modelo').value = os.modelo;
    document.getElementById('os-serial').value = os.serial || '';
    document.getElementById('os-problema').value = os.problemaDescricao;
    document.getElementById('os-observacoes').value = os.observacoes || '';
    document.getElementById('os-valor').value = os.valorOrcamento;
    document.getElementById('os-status').value = os.status;
    populateServicoSelect('os-servico-select');
    if (os.servicoId) document.getElementById('os-servico-select').value = os.servicoId;
    populateTecnicoSelect('os-tecnico-select');
    if (os.tecnicoId) document.getElementById('os-tecnico-select').value = os.tecnicoId;
    document.getElementById('modalNovaOSLabelDynamic').textContent = 'Editar OS';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovaOS')).show();
}

function excluirOS(id) {
    if (!confirm("Tem certeza que deseja excluir esta OS?")) return;
    
    ORDENS_SERVICO = ORDENS_SERVICO.filter(os => os.id != id);
    saveData('luckhouse_os', ORDENS_SERVICO);
    renderOSList();
    updateDashboard();
    showToast("OS excluída com sucesso!", "success");
}

function imprimirOS(id) {
    const os = ORDENS_SERVICO.find(o => o.id == id);
    if (!os) return;
    
    const cliente = CLIENTES.find(c => c.id === os.clienteId);
    const servico = SERVICOS.find(s => s.id === os.servicoId);
    const tecnico = TECNICOS.find(t => t.id === os.tecnicoId);
    
    const printContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px;">
                <h1>LUCKHOUSE GAMES</h1>
                <h2>ORDEM DE SERVIÇO</h2>
                <p>OS #${String(os.id).padStart(6, '0')}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3>DADOS DO CLIENTE</h3>
                <p><strong>Nome:</strong> ${cliente ? cliente.nome : 'N/A'}</p>
                <p><strong>Telefone:</strong> ${cliente ? cliente.telefone || 'N/A' : 'N/A'}</p>
                <p><strong>Email:</strong> ${cliente ? cliente.email || 'N/A' : 'N/A'}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3>EQUIPAMENTO</h3>
                <p><strong>Tipo:</strong> ${os.equipamento}</p>
                <p><strong>Marca:</strong> ${os.marca}</p>
                <p><strong>Modelo:</strong> ${os.modelo}</p>
                <p><strong>Serial:</strong> ${os.serial || 'N/A'}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3>SERVIÇO</h3>
                <p><strong>Problema:</strong> ${os.problemaDescricao}</p>
                <p><strong>Observações:</strong> ${os.observacoes || 'N/A'}</p>
                ${servico ? `<p><strong>Serviço:</strong> ${servico.nome}</p>` : ''}
                ${tecnico ? `<p><strong>Técnico Responsável:</strong> ${tecnico.nome}</p>` : ''}
                <p><strong>Status:</strong> ${os.status}</p>
                <p><strong>Valor:</strong> ${formatCurrency(os.valorOrcamento)}</p>
            </div>
            
            <div style="margin-top: 40px;">
                <p><strong>Data de Abertura:</strong> ${new Date(os.dataAbertura).toLocaleDateString('pt-BR')}</p>
                <p style="margin-top: 40px;">_________________________________</p>
                <p style="text-align: center;">Assinatura do Cliente</p>
            </div>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>OS #${String(os.id).padStart(6, '0')}</title>
                <style>
                    body { margin: 0; padding: 20px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    }
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// ===== MÓDULO FINANCEIRO =====
function setupFinanceiroModule() {
    const btnNovaReceita = document.getElementById('btn-nova-receita');
    if (btnNovaReceita) {
        btnNovaReceita.addEventListener('click', () => {
            document.getElementById('formNovaReceita').reset();
            document.getElementById('receita-id').value = '';
            document.getElementById('modalNovaReceitaLabelDynamic').textContent = 'Nova Receita';
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovaReceita')).show();
        });
    }
    
    const btnNovaDespesa = document.getElementById('btn-nova-despesa');
    if (btnNovaDespesa) {
        btnNovaDespesa.addEventListener('click', () => {
            document.getElementById('formNovaDespesa').reset();
            document.getElementById('despesa-id').value = '';
            document.getElementById('modalNovaDespesaLabelDynamic').textContent = 'Nova Despesa';
            populateSelectFromAux('despesa-categoria', 'categoriasDespesa', 'Selecione uma categoria...');
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovaDespesa')).show();
        });
    }
    
    // Form de receitas
    const formNovaReceita = document.getElementById('formNovaReceita');
    if (formNovaReceita) {
        formNovaReceita.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('receita-id').value;
            const receitaData = {
                descricao: document.getElementById('receita-descricao').value.trim(),
                valor: parseFloat(document.getElementById('receita-valor').value),
                data: document.getElementById('receita-data').value,
                categoria: document.getElementById('receita-categoria').value
            };
            
            if (!receitaData.descricao || isNaN(receitaData.valor) || !receitaData.data) {
                showToast("Preencha todos os campos obrigatórios!", "warning");
                return;
            }
            
            if (id) {
                // Editar receita existente
                const index = RECEITAS.findIndex(r => r.id == id);
                if (index !== -1) {
                    RECEITAS[index] = { ...RECEITAS[index], ...receitaData };
                    showToast("Receita atualizada com sucesso!", "success");
                }
            } else {
                // Nova receita
                const novaReceita = {
                    id: getNextId(RECEITAS),
                    ...receitaData,
                    dataCadastro: new Date().toISOString()
                };
                RECEITAS.push(novaReceita);
                showToast("Receita cadastrada com sucesso!", "success");
            }
            
            saveData('luckhouse_receitas', RECEITAS);
            renderFinanceiroModule();
            updateDashboard();
            bootstrap.Modal.getInstance(document.getElementById('modalNovaReceita')).hide();
        });
    }
    
    // Form de despesas
    const formNovaDespesa = document.getElementById('formNovaDespesa');
    if (formNovaDespesa) {
        formNovaDespesa.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('despesa-id').value;
            const despesaData = {
                descricao: document.getElementById('despesa-descricao').value.trim(),
                valor: parseFloat(document.getElementById('despesa-valor').value),
                data: document.getElementById('despesa-data').value,
                categoria: document.getElementById('despesa-categoria').value
            };
            
            if (!despesaData.descricao || isNaN(despesaData.valor) || !despesaData.data) {
                showToast("Preencha todos os campos obrigatórios!", "warning");
                return;
            }
            
            if (id) {
                // Editar despesa existente
                const index = DESPESAS.findIndex(d => d.id == id);
                if (index !== -1) {
                    DESPESAS[index] = { ...DESPESAS[index], ...despesaData };
                    showToast("Despesa atualizada com sucesso!", "success");
                }
            } else {
                // Nova despesa
                const novaDespesa = {
                    id: getNextId(DESPESAS),
                    ...despesaData,
                    dataCadastro: new Date().toISOString()
                };
                DESPESAS.push(novaDespesa);
                showToast("Despesa cadastrada com sucesso!", "success");
            }
            
            saveData('luckhouse_despesas', DESPESAS);
            renderFinanceiroModule();
            updateDashboard();
            bootstrap.Modal.getInstance(document.getElementById('modalNovaDespesa')).hide();
        });
    }
}

function renderFinanceiroModule() {
    renderReceitasList();
    renderDespesasList();
    renderResumoFinanceiro();
}

function renderReceitasList() {
    const container = document.getElementById('receitas-list-container');
    if (!container) return;
    
    if (RECEITAS.length === 0) {
        container.innerHTML = '<p class="text-muted p-2">Nenhuma receita cadastrada.</p>';
        return;
    }
    
    container.innerHTML = RECEITAS.map(receita => `
        <div class="list-group-item list-group-item-action bg-dark-secondary">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1 text-success-custom">${receita.descricao}</h6>
                    <p class="mb-1">
                        <span class="text-success fw-bold">${formatCurrency(receita.valor)}</span>
                        ${receita.categoria ? `<span class="badge bg-success ms-2">${receita.categoria}</span>` : ''}
                    </p>
                    <small class="text-muted">Data: ${new Date(receita.data).toLocaleDateString('pt-BR')}</small>
                </div>
                <div class="btn-group-vertical">
                    <button class="btn btn-sm btn-outline-primary-custom mb-1" onclick="editarReceita(${receita.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="excluirReceita(${receita.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderDespesasList() {
    const container = document.getElementById('despesas-list-container');
    if (!container) return;
    
    if (DESPESAS.length === 0) {
        container.innerHTML = '<p class="text-muted p-2">Nenhuma despesa cadastrada.</p>';
        return;
    }
    
    container.innerHTML = DESPESAS.map(despesa => `
        <div class="list-group-item list-group-item-action bg-dark-secondary">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1 text-danger-custom">${despesa.descricao}</h6>
                    <p class="mb-1">
                        <span class="text-danger fw-bold">${formatCurrency(despesa.valor)}</span>
                        ${despesa.categoria ? `<span class="badge bg-danger ms-2">${despesa.categoria}</span>` : ''}
                    </p>
                    <small class="text-muted">Data: ${new Date(despesa.data).toLocaleDateString('pt-BR')}</small>
                </div>
                <div class="btn-group-vertical">
                    <button class="btn btn-sm btn-outline-primary-custom mb-1" onclick="editarDespesa(${despesa.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="excluirDespesa(${despesa.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderResumoFinanceiro() {
    const totalReceitas = RECEITAS.reduce((sum, r) => sum + r.valor, 0);
    const totalDespesas = DESPESAS.reduce((sum, d) => sum + d.valor, 0);
    const saldo = totalReceitas - totalDespesas;
    
    const resumoContainer = document.getElementById('resumo-financeiro-container');
    if (resumoContainer) {
        resumoContainer.innerHTML = `
            <div class="row text-center">
                <div class="col-md-4">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h5>Total Receitas</h5>
                            <h3>${formatCurrency(totalReceitas)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-danger text-white">
                        <div class="card-body">
                            <h5>Total Despesas</h5>
                            <h3>${formatCurrency(totalDespesas)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card ${saldo >= 0 ? 'bg-info' : 'bg-warning'} text-white">
                        <div class="card-body">
                            <h5>Saldo</h5>
                            <h3>${formatCurrency(saldo)}</h3>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function editarReceita(id) {
    const receita = RECEITAS.find(r => r.id == id);
    if (!receita) return;
    
    document.getElementById('receita-id').value = receita.id;
    document.getElementById('receita-descricao').value = receita.descricao;
    document.getElementById('receita-valor').value = receita.valor;
    document.getElementById('receita-data').value = receita.data;
    document.getElementById('receita-categoria').value = receita.categoria || '';
    document.getElementById('modalNovaReceitaLabelDynamic').textContent = 'Editar Receita';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovaReceita')).show();
}

function excluirReceita(id) {
    if (!confirm("Tem certeza que deseja excluir esta receita?")) return;
    
    RECEITAS = RECEITAS.filter(r => r.id != id);
    saveData('luckhouse_receitas', RECEITAS);
    renderFinanceiroModule();
    updateDashboard();
    showToast("Receita excluída com sucesso!", "success");
}

function editarDespesa(id) {
    const despesa = DESPESAS.find(d => d.id == id);
    if (!despesa) return;
    
    document.getElementById('despesa-id').value = despesa.id;
    document.getElementById('despesa-descricao').value = despesa.descricao;
    document.getElementById('despesa-valor').value = despesa.valor;
    document.getElementById('despesa-data').value = despesa.data;
    populateSelectFromAux('despesa-categoria', 'categoriasDespesa', 'Selecione uma categoria...');
    document.getElementById('despesa-categoria').value = despesa.categoria || '';
    document.getElementById('modalNovaDespesaLabelDynamic').textContent = 'Editar Despesa';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovaDespesa')).show();
}

function excluirDespesa(id) {
    if (!confirm("Tem certeza que deseja excluir esta despesa?")) return;
    
    DESPESAS = DESPESAS.filter(d => d.id != id);
    saveData('luckhouse_despesas', DESPESAS);
    renderFinanceiroModule();
    updateDashboard();
    showToast("Despesa excluída com sucesso!", "success");
}

// ===== MÓDULO ENVIO LAB =====
function setupEnvioLabModule() {
    const btnNovoEnvio = document.getElementById('btn-novo-envio-lab');
    if (btnNovoEnvio) {
        btnNovoEnvio.addEventListener('click', () => {
            document.getElementById('formNovoEnvioLab').reset();
            document.getElementById('envio-lab-id').value = '';
            document.getElementById('modalNovoEnvioLabLabelDynamic').textContent = 'Novo Envio LAB';
            populateOSSelect('envio-lab-os-select');
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovoEnvioLab')).show();
        });
    }
    
    const formNovoEnvio = document.getElementById('formNovoEnvioLab');
    if (formNovoEnvio) {
        formNovoEnvio.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('envio-lab-id').value;
            const envioData = {
                osId: parseInt(document.getElementById('envio-lab-os-select').value),
                laboratorio: document.getElementById('envio-lab-laboratorio').value.trim(),
                dataEnvio: document.getElementById('envio-lab-data-envio').value,
                prazoEstimado: document.getElementById('envio-lab-prazo').value,
                custoEstimado: parseFloat(document.getElementById('envio-lab-custo').value) || 0,
                status: document.getElementById('envio-lab-status').value,
                observacoes: document.getElementById('envio-lab-observacoes').value.trim()
            };
            
            if (!envioData.osId || !envioData.laboratorio || !envioData.dataEnvio) {
                showToast("Preencha todos os campos obrigatórios!", "warning");
                return;
            }
            
            if (id) {
                // Editar envio existente
                const index = ENVIOS_LAB.findIndex(e => e.id == id);
                if (index !== -1) {
                    ENVIOS_LAB[index] = { ...ENVIOS_LAB[index], ...envioData };
                    showToast("Envio LAB atualizado com sucesso!", "success");
                }
            } else {
                // Novo envio
                const novoEnvio = {
                    id: getNextId(ENVIOS_LAB),
                    ...envioData,
                    dataCadastro: new Date().toISOString()
                };
                ENVIOS_LAB.push(novoEnvio);
                showToast("Envio LAB cadastrado com sucesso!", "success");
            }
            
            saveData('luckhouse_envios_lab', ENVIOS_LAB);
            renderEnvioLabList();
            bootstrap.Modal.getInstance(document.getElementById('modalNovoEnvioLab')).hide();
        });
    }
}

function renderEnvioLabList() {
    const container = document.getElementById('envio-lab-list-container');
    if (!container) return;
    
    if (ENVIOS_LAB.length === 0) {
        container.innerHTML = '<p class="text-muted p-2">Nenhum envio LAB cadastrado.</p>';
        return;
    }
    
    container.innerHTML = ENVIOS_LAB.map(envio => {
        const os = ORDENS_SERVICO.find(o => o.id === envio.osId);
        const cliente = os ? CLIENTES.find(c => c.id === os.clienteId) : null;
        
        const statusClass = {
            'Enviado': 'warning',
            'Em Análise': 'info',
            'Aguardando Peça': 'secondary',
            'Concluído': 'success',
            'Retornado': 'primary'
        };
        
        return `
            <div class="card bg-dark-secondary mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title text-primary-custom">Envio #${String(envio.id).padStart(4, '0')}</h6>
                            <p class="card-text mb-1"><strong>OS:</strong> #${os ? String(os.id).padStart(6, '0') : 'N/A'}</p>
                            <p class="card-text mb-1"><strong>Cliente:</strong> ${cliente ? cliente.nome : 'N/A'}</p>
                            <p class="card-text mb-1"><strong>Laboratório:</strong> ${envio.laboratorio}</p>
                            <p class="card-text mb-1"><strong>Data Envio:</strong> ${new Date(envio.dataEnvio).toLocaleDateString('pt-BR')}</p>
                            ${envio.prazoEstimado ? `<p class="card-text mb-1"><strong>Prazo:</strong> ${new Date(envio.prazoEstimado).toLocaleDateString('pt-BR')}</p>` : ''}
                            <p class="card-text mb-1"><strong>Custo:</strong> ${formatCurrency(envio.custoEstimado)}</p>
                            ${envio.observacoes ? `<p class="card-text mb-1"><strong>Obs:</strong> ${envio.observacoes}</p>` : ''}
                        </div>
                        <div class="text-end">
                            <span class="badge bg-${statusClass[envio.status] || 'secondary'} mb-2">${envio.status}</span>
                            <div class="btn-group-vertical">
                                <button class="btn btn-sm btn-outline-primary-custom mb-1" onclick="editarEnvioLab(${envio.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="excluirEnvioLab(${envio.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function editarEnvioLab(id) {
    const envio = ENVIOS_LAB.find(e => e.id == id);
    if (!envio) return;
    
    document.getElementById('envio-lab-id').value = envio.id;
    populateOSSelect('envio-lab-os-select');
    document.getElementById('envio-lab-os-select').value = envio.osId;
    document.getElementById('envio-lab-laboratorio').value = envio.laboratorio;
    document.getElementById('envio-lab-data-envio').value = envio.dataEnvio;
    document.getElementById('envio-lab-prazo').value = envio.prazoEstimado || '';
    document.getElementById('envio-lab-custo').value = envio.custoEstimado;
    document.getElementById('envio-lab-status').value = envio.status;
    document.getElementById('envio-lab-observacoes').value = envio.observacoes || '';
    document.getElementById('modalNovoEnvioLabLabelDynamic').textContent = 'Editar Envio LAB';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovoEnvioLab')).show();
}

function excluirEnvioLab(id) {
    if (!confirm("Tem certeza que deseja excluir este envio LAB?")) return;
    
    ENVIOS_LAB = ENVIOS_LAB.filter(e => e.id != id);
    saveData('luckhouse_envios_lab', ENVIOS_LAB);
    renderEnvioLabList();
    showToast("Envio LAB excluído com sucesso!", "success");
}

// ===== MÓDULO DE GESTÃO DE TÉCNICOS =====
function setupTecnicosModule() {
    const btnNovoTecnico = document.getElementById('btn-novo-tecnico');
    if (btnNovoTecnico) {
        btnNovoTecnico.addEventListener('click', () => {
            document.getElementById('formNovoTecnico').reset();
            document.getElementById('tecnico-id').value = '';
            document.getElementById('modalNovoTecnicoLabelDynamic').textContent = 'Novo Técnico';
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovoTecnico')).show();
        });
    }
    
    const formNovoTecnico = document.getElementById('formNovoTecnico');
    if (formNovoTecnico) {
        formNovoTecnico.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('tecnico-id').value;
            const tecnicoData = {
                nome: document.getElementById('tecnico-nome').value.trim(),
                telefone: document.getElementById('tecnico-telefone').value.trim(),
                email: document.getElementById('tecnico-email').value.trim(),
                especialidade: document.getElementById('tecnico-especialidade').value.trim(),
                ativo: document.getElementById('tecnico-ativo').checked
            };
            
            if (!tecnicoData.nome) {
                showToast("Nome é obrigatório!", "warning");
                return;
            }
            
            if (id) {
                // Editar técnico existente
                const index = TECNICOS.findIndex(t => t.id == id);
                if (index !== -1) {
                    TECNICOS[index] = { ...TECNICOS[index], ...tecnicoData };
                    showToast("Técnico atualizado com sucesso!", "success");
                }
            } else {
                // Novo técnico
                const novoTecnico = {
                    id: getNextId(TECNICOS),
                    ...tecnicoData,
                    dataCadastro: new Date().toISOString()
                };
                TECNICOS.push(novoTecnico);
                showToast("Técnico cadastrado com sucesso!", "success");
            }
            
            saveData('luckhouse_tecnicos', TECNICOS);
            renderTecnicosList();
            bootstrap.Modal.getInstance(document.getElementById('modalNovoTecnico')).hide();
        });
    }
}

function renderTecnicosList() {
    const container = document.getElementById('tecnicos-list-container');
    if (!container) return;
    
    if (TECNICOS.length === 0) {
        container.innerHTML = '<p class="text-muted p-2">Nenhum técnico cadastrado.</p>';
        return;
    }
    
    container.innerHTML = TECNICOS.map(tecnico => `
        <div class="list-group-item list-group-item-action bg-dark-secondary">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1 text-primary-custom">
                        ${tecnico.nome}
                        ${!tecnico.ativo ? '<span class="badge bg-secondary ms-2">Inativo</span>' : ''}
                    </h6>
                    <p class="mb-1 small">
                        ${tecnico.telefone ? `<i class="fas fa-phone me-1"></i>${tecnico.telefone}` : ''}
                        ${tecnico.email ? `<i class="fas fa-envelope me-1 ms-2"></i>${tecnico.email}` : ''}
                    </p>
                    ${tecnico.especialidade ? `<p class="mb-0 small text-muted">Especialidade: ${tecnico.especialidade}</p>` : ''}
                </div>
                <div class="btn-group-vertical">
                    <button class="btn btn-sm btn-outline-primary-custom mb-1" onclick="editarTecnico(${tecnico.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success-custom mb-1" onclick="abrirWhatsAppTecnico(${tecnico.id})">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="excluirTecnico(${tecnico.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function editarTecnico(id) {
    const tecnico = TECNICOS.find(t => t.id == id);
    if (!tecnico) return;
    
    document.getElementById('tecnico-id').value = tecnico.id;
    document.getElementById('tecnico-nome').value = tecnico.nome;
    document.getElementById('tecnico-telefone').value = tecnico.telefone || '';
    document.getElementById('tecnico-email').value = tecnico.email || '';
    document.getElementById('tecnico-especialidade').value = tecnico.especialidade || '';
    document.getElementById('tecnico-ativo').checked = tecnico.ativo !== false;
    document.getElementById('modalNovoTecnicoLabelDynamic').textContent = 'Editar Técnico';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovoTecnico')).show();
}

function excluirTecnico(id) {
    if (!confirm("Tem certeza que deseja excluir este técnico?")) return;
    
    TECNICOS = TECNICOS.filter(t => t.id != id);
    saveData('luckhouse_tecnicos', TECNICOS);
    renderTecnicosList();
    showToast("Técnico excluído com sucesso!", "success");
}

function abrirWhatsAppTecnico(id) {
    const tecnico = TECNICOS.find(t => t.id == id);
    if (!tecnico || !tecnico.telefone) {
        showToast("Técnico não possui telefone cadastrado!", "warning");
        return;
    }
    
    const telefone = tecnico.telefone.replace(/\D/g, '');
    const mensagem = `Olá ${tecnico.nome}, tudo bem? Aqui é da Luckhouse Games!`;
    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

// ===== MÓDULO DE AVALIAÇÃO DE CONSOLES =====
function setupAvaliacaoConsolesModule() {
    const btnNovaAvaliacao = document.getElementById('btn-nova-avaliacao');
    if (btnNovaAvaliacao) {
        btnNovaAvaliacao.addEventListener('click', () => {
            document.getElementById('formNovaAvaliacao').reset();
            document.getElementById('avaliacao-id').value = '';
            document.getElementById('modalNovaAvaliacaoLabelDynamic').textContent = 'Nova Avaliação de Console';
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovaAvaliacao')).show();
        });
    }
    
    const formNovaAvaliacao = document.getElementById('formNovaAvaliacao');
    if (formNovaAvaliacao) {
        formNovaAvaliacao.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('avaliacao-id').value;
            const avaliacaoData = {
                console: document.getElementById('avaliacao-console').value.trim(),
                marca: document.getElementById('avaliacao-marca').value.trim(),
                modelo: document.getElementById('avaliacao-modelo').value.trim(),
                estadoGeral: parseInt(document.getElementById('avaliacao-estado-geral').value),
                funcionamento: parseInt(document.getElementById('avaliacao-funcionamento').value),
                acessorios: parseInt(document.getElementById('avaliacao-acessorios').value),
                observacoes: document.getElementById('avaliacao-observacoes').value.trim(),
                precoSugerido: parseFloat(document.getElementById('avaliacao-preco-sugerido').value) || 0
            };
            
            if (!avaliacaoData.console || !avaliacaoData.marca || !avaliacaoData.modelo) {
                showToast("Preencha todos os campos obrigatórios!", "warning");
                return;
            }
            
            // Calcular preço sugerido baseado nos critérios
            const precoBase = {
                'PlayStation 4': 800,
                'PlayStation 5': 2500,
                'Xbox One': 600,
                'Xbox Series S': 1500,
                'Xbox Series X': 2200,
                'Nintendo Switch': 1200
            };
            
            const basePrice = precoBase[avaliacaoData.modelo] || 500;
            const mediaAvaliacoes = (avaliacaoData.estadoGeral + avaliacaoData.funcionamento + avaliacaoData.acessorios) / 3;
            const fatorCondicao = mediaAvaliacoes / 10; // 0.1 a 1.0
            
            avaliacaoData.precoSugerido = Math.round(basePrice * fatorCondicao);
            
            if (id) {
                // Editar avaliação existente
                const index = AVALIACOES_CONSOLES.findIndex(a => a.id == id);
                if (index !== -1) {
                    AVALIACOES_CONSOLES[index] = { ...AVALIACOES_CONSOLES[index], ...avaliacaoData };
                    showToast("Avaliação atualizada com sucesso!", "success");
                }
            } else {
                // Nova avaliação
                const novaAvaliacao = {
                    id: getNextId(AVALIACOES_CONSOLES),
                    ...avaliacaoData,
                    dataAvaliacao: new Date().toISOString()
                };
                AVALIACOES_CONSOLES.push(novaAvaliacao);
                showToast("Avaliação cadastrada com sucesso!", "success");
            }
            
            saveData('luckhouse_avaliacoes_consoles', AVALIACOES_CONSOLES);
            renderAvaliacaoConsolesList();
            
            // Atualizar o campo de preço sugerido no modal
            document.getElementById('avaliacao-preco-sugerido').value = avaliacaoData.precoSugerido;
            
            bootstrap.Modal.getInstance(document.getElementById('modalNovaAvaliacao')).hide();
        });
    }
    
    // Atualizar preço sugerido em tempo real
    const criteriosInputs = ['avaliacao-estado-geral', 'avaliacao-funcionamento', 'avaliacao-acessorios', 'avaliacao-modelo'];
    criteriosInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('change', calcularPrecoSugerido);
        }
    });
}

function calcularPrecoSugerido() {
    const modelo = document.getElementById('avaliacao-modelo').value;
    const estadoGeral = parseInt(document.getElementById('avaliacao-estado-geral').value) || 5;
    const funcionamento = parseInt(document.getElementById('avaliacao-funcionamento').value) || 5;
    const acessorios = parseInt(document.getElementById('avaliacao-acessorios').value) || 5;
    
    const precoBase = {
        'PlayStation 4': 800,
        'PlayStation 5': 2500,
        'Xbox One': 600,
        'Xbox Series S': 1500,
        'Xbox Series X': 2200,
        'Nintendo Switch': 1200
    };
    
    const basePrice = precoBase[modelo] || 500;
    const mediaAvaliacoes = (estadoGeral + funcionamento + acessorios) / 3;
    const fatorCondicao = mediaAvaliacoes / 10;
    const precoSugerido = Math.round(basePrice * fatorCondicao);
    
    document.getElementById('avaliacao-preco-sugerido').value = precoSugerido;
}

function renderAvaliacaoConsolesList() {
    const container = document.getElementById('avaliacao-consoles-list-container');
    if (!container) return;
    
    if (AVALIACOES_CONSOLES.length === 0) {
        container.innerHTML = '<p class="text-muted p-2">Nenhuma avaliação de console cadastrada.</p>';
        return;
    }
    
    container.innerHTML = AVALIACOES_CONSOLES.map(avaliacao => {
        const mediaAvaliacoes = (avaliacao.estadoGeral + avaliacao.funcionamento + avaliacao.acessorios) / 3;
        const corNota = mediaAvaliacoes >= 8 ? 'success' : mediaAvaliacoes >= 6 ? 'warning' : 'danger';
        
        return `
            <div class="card bg-dark-secondary mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title text-primary-custom">${avaliacao.console} ${avaliacao.marca} ${avaliacao.modelo}</h6>
                            <p class="card-text mb-1"><strong>Estado Geral:</strong> ${avaliacao.estadoGeral}/10</p>
                            <p class="card-text mb-1"><strong>Funcionamento:</strong> ${avaliacao.funcionamento}/10</p>
                            <p class="card-text mb-1"><strong>Acessórios:</strong> ${avaliacao.acessorios}/10</p>
                            <p class="card-text mb-1">
                                <strong>Média:</strong> 
                                <span class="badge bg-${corNota}">${mediaAvaliacoes.toFixed(1)}/10</span>
                            </p>
                            <p class="card-text mb-1">
                                <strong>Preço Sugerido:</strong> 
                                <span class="text-success fw-bold">${formatCurrency(avaliacao.precoSugerido)}</span>
                            </p>
                            ${avaliacao.observacoes ? `<p class="card-text mb-1"><strong>Obs:</strong> ${avaliacao.observacoes}</p>` : ''}
                            <small class="text-muted">Avaliado em: ${new Date(avaliacao.dataAvaliacao).toLocaleDateString('pt-BR')}</small>
                        </div>
                        <div class="text-end">
                            <div class="btn-group-vertical">
                                <button class="btn btn-sm btn-outline-primary-custom mb-1" onclick="editarAvaliacaoConsole(${avaliacao.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-success-custom mb-1" onclick="criarProdutoDeAvaliacao(${avaliacao.id})">
                                    <i class="fas fa-plus"></i> Produto
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="excluirAvaliacaoConsole(${avaliacao.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function editarAvaliacaoConsole(id) {
    const avaliacao = AVALIACOES_CONSOLES.find(a => a.id == id);
    if (!avaliacao) return;
    
    document.getElementById('avaliacao-id').value = avaliacao.id;
    document.getElementById('avaliacao-console').value = avaliacao.console;
    document.getElementById('avaliacao-marca').value = avaliacao.marca;
    document.getElementById('avaliacao-modelo').value = avaliacao.modelo;
    document.getElementById('avaliacao-estado-geral').value = avaliacao.estadoGeral;
    document.getElementById('avaliacao-funcionamento').value = avaliacao.funcionamento;
    document.getElementById('avaliacao-acessorios').value = avaliacao.acessorios;
    document.getElementById('avaliacao-observacoes').value = avaliacao.observacoes || '';
    document.getElementById('avaliacao-preco-sugerido').value = avaliacao.precoSugerido;
    document.getElementById('modalNovaAvaliacaoLabelDynamic').textContent = 'Editar Avaliação';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovaAvaliacao')).show();
}

function excluirAvaliacaoConsole(id) {
    if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return;
    
    AVALIACOES_CONSOLES = AVALIACOES_CONSOLES.filter(a => a.id != id);
    saveData('luckhouse_avaliacoes_consoles', AVALIACOES_CONSOLES);
    renderAvaliacaoConsolesList();
    showToast("Avaliação excluída com sucesso!", "success");
}

function criarProdutoDeAvaliacao(id) {
    const avaliacao = AVALIACOES_CONSOLES.find(a => a.id == id);
    if (!avaliacao) return;
    
    const novoProduto = {
        id: getNextId(PRODUTOS),
        nome: `${avaliacao.console} ${avaliacao.marca} ${avaliacao.modelo}`,
        categoria: 'Console',
        precoCusto: avaliacao.precoSugerido,
        precoVenda: Math.round(avaliacao.precoSugerido * 1.3), // 30% de margem
        estoque: 1,
        isVideogame: true,
        consignado: false,
        dataCadastro: new Date().toISOString()
    };
    
    PRODUTOS.push(novoProduto);
    saveData('luckhouse_produtos', PRODUTOS);
    renderProdutosList();
    updateDashboard();
    showToast(`Produto "${novoProduto.nome}" criado com sucesso!`, "success");
}

// ===== MÓDULO DE PDV =====
function setupPDVModule() {
    const btnAdicionarProdutoPDV = document.getElementById('btn-adicionar-produto-pdv');
    if (btnAdicionarProdutoPDV) {
        btnAdicionarProdutoPDV.addEventListener('click', () => {
            populateProdutoSelectPDV();
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAdicionarProdutoPDV')).show();
        });
    }
    
    const btnAdicionarServicoPDV = document.getElementById('btn-adicionar-servico-pdv');
    if (btnAdicionarServicoPDV) {
        btnAdicionarServicoPDV.addEventListener('click', () => {
            populateServicoSelectPDV();
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAdicionarServicoPDV')).show();
        });
    }
    
    const btnFinalizarVenda = document.getElementById('btn-finalizar-venda');
    if (btnFinalizarVenda) {
        btnFinalizarVenda.addEventListener('click', finalizarVenda);
    }
    
    const btnLimparCarrinho = document.getElementById('btn-limpar-carrinho');
    if (btnLimparCarrinho) {
        btnLimparCarrinho.addEventListener('click', limparCarrinho);
    }
    
    // Eventos para adicionar produtos/serviços
    const formAdicionarProduto = document.getElementById('formAdicionarProdutoPDV');
    if (formAdicionarProduto) {
        formAdicionarProduto.addEventListener('submit', function(e) {
            e.preventDefault();
            adicionarProdutoAoCarrinho();
        });
    }
    
    const formAdicionarServico = document.getElementById('formAdicionarServicoPDV');
    if (formAdicionarServico) {
        formAdicionarServico.addEventListener('submit', function(e) {
            e.preventDefault();
            adicionarServicoAoCarrinho();
        });
    }
    
    // Atualizar desconto em tempo real
    const descontoInput = document.getElementById('pdv-desconto-percentual');
    if (descontoInput) {
        descontoInput.addEventListener('input', updatePdvTotals);
    }
}

function updatePdvUI() {
    populateClienteSelectPDV();
    renderCarrinhoPDV();
    updatePdvTotals();
}

function populateProdutoSelectPDV() {
    const select = document.getElementById('pdv-produto-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione um produto...</option>';
    PRODUTOS.filter(p => p.estoque > 0).forEach(produto => {
        select.innerHTML += `<option value="${produto.id}">${produto.nome} - ${formatCurrency(produto.precoVenda)} (Estoque: ${produto.estoque})</option>`;
    });
}

function populateServicoSelectPDV() {
    const select = document.getElementById('pdv-servico-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione um serviço...</option>';
    SERVICOS.forEach(servico => {
        select.innerHTML += `<option value="${servico.id}">${servico.nome} - ${formatCurrency(servico.valorCliente)}</option>`;
    });
}

function populateClienteSelectPDV() {
    const select = document.getElementById('pdv-cliente-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">Cliente Avulso</option>';
    CLIENTES.forEach(cliente => {
        select.innerHTML += `<option value="${cliente.id}">${cliente.nome}</option>`;
    });
}

function adicionarProdutoAoCarrinho() {
    const produtoId = parseInt(document.getElementById('pdv-produto-select').value);
    const quantidade = parseInt(document.getElementById('pdv-produto-quantidade').value) || 1;
    
    if (!produtoId) {
        showToast("Selecione um produto!", "warning");
        return;
    }
    
    const produto = PRODUTOS.find(p => p.id === produtoId);
    if (!produto) {
        showToast("Produto não encontrado!", "danger");
        return;
    }
    
    if (quantidade > produto.estoque) {
        showToast(`Estoque insuficiente! Disponível: ${produto.estoque}`, "warning");
        return;
    }
    
    // Verificar se já existe no carrinho
    const itemExistente = pdvCartItems.find(item => item.id === produtoId && item.tipo === 'produto');
    if (itemExistente) {
        if (itemExistente.quantidade + quantidade > produto.estoque) {
            showToast(`Estoque insuficiente! Disponível: ${produto.estoque}`, "warning");
            return;
        }
        itemExistente.quantidade += quantidade;
    } else {
        pdvCartItems.push({
            id: produtoId,
            tipo: 'produto',
            nome: produto.nome,
            preco: produto.precoVenda,
            quantidade: quantidade,
            estoqueOriginal: produto.estoque
        });
    }
    
    renderCarrinhoPDV();
    updatePdvTotals();
    bootstrap.Modal.getInstance(document.getElementById('modalAdicionarProdutoPDV')).hide();
    document.getElementById('formAdicionarProdutoPDV').reset();
    showToast("Produto adicionado ao carrinho!", "success");
}

function adicionarServicoAoCarrinho() {
    const servicoId = parseInt(document.getElementById('pdv-servico-select').value);
    const quantidade = parseInt(document.getElementById('pdv-servico-quantidade').value) || 1;
    
    if (!servicoId) {
        showToast("Selecione um serviço!", "warning");
        return;
    }
    
    const servico = SERVICOS.find(s => s.id === servicoId);
    if (!servico) {
        showToast("Serviço não encontrado!", "danger");
        return;
    }
    
    // Verificar se já existe no carrinho
    const itemExistente = pdvCartItems.find(item => item.id === servicoId && item.tipo === 'servico');
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        pdvCartItems.push({
            id: servicoId,
            tipo: 'servico',
            nome: servico.nome,
            preco: servico.valorCliente,
            quantidade: quantidade
        });
    }
    
    renderCarrinhoPDV();
    updatePdvTotals();
    bootstrap.Modal.getInstance(document.getElementById('modalAdicionarServicoPDV')).hide();
    document.getElementById('formAdicionarServicoPDV').reset();
    showToast("Serviço adicionado ao carrinho!", "success");
}

function renderCarrinhoPDV() {
    const container = document.getElementById('pdv-carrinho-container');
    if (!container) return;
    
    if (pdvCartItems.length === 0) {
        container.innerHTML = '<p class="text-muted">Carrinho vazio.</p>';
        return;
    }
    
    container.innerHTML = pdvCartItems.map((item, index) => `
        <div class="list-group-item bg-dark-secondary d-flex justify-content-between align-items-center">
            <div>
                <h6 class="mb-1">${item.nome}</h6>
                <small class="text-muted">${item.tipo === 'produto' ? 'Produto' : 'Serviço'}</small>
            </div>
            <div class="d-flex align-items-center">
                <span class="me-2">${item.quantidade}x ${formatCurrency(item.preco)}</span>
                <span class="me-2 fw-bold">${formatCurrency(item.preco * item.quantidade)}</span>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-secondary" onclick="decrementarItemCarrinho(${index})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="incrementarItemCarrinho(${index})">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="removerItemCarrinho(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function incrementarItemCarrinho(index) {
    const item = pdvCartItems[index];
    if (item.tipo === 'produto') {
        const produto = PRODUTOS.find(p => p.id === item.id);
        if (item.quantidade >= produto.estoque) {
            showToast(`Estoque máximo atingido! Disponível: ${produto.estoque}`, "warning");
            return;
        }
    }
    item.quantidade++;
    renderCarrinhoPDV();
    updatePdvTotals();
}

function decrementarItemCarrinho(index) {
    const item = pdvCartItems[index];
    if (item.quantidade > 1) {
        item.quantidade--;
    } else {
        pdvCartItems.splice(index, 1);
    }
    renderCarrinhoPDV();
    updatePdvTotals();
}

function removerItemCarrinho(index) {
    pdvCartItems.splice(index, 1);
    renderCarrinhoPDV();
    updatePdvTotals();
}

function updatePdvTotals() {
    const subtotal = pdvCartItems.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const descontoPercentual = parseFloat(document.getElementById('pdv-desconto-percentual').value) || 0;
    const descontoValor = subtotal * (descontoPercentual / 100);
    const total = subtotal - descontoValor;
    
    document.getElementById('pdv-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('pdv-desconto-valor').textContent = formatCurrency(descontoValor);
    document.getElementById('pdv-total').textContent = formatCurrency(total);
}

function finalizarVenda() {
    if (pdvCartItems.length === 0) {
        showToast("Carrinho vazio!", "warning");
        return;
    }
    
    const clienteId = document.getElementById('pdv-cliente-select').value ? parseInt(document.getElementById('pdv-cliente-select').value) : null;
    const formaPagamento = document.getElementById('pdv-forma-pagamento').value;
    const nomeCliente = document.getElementById('pdv-nome-cliente').value.trim();
    
    if (!formaPagamento) {
        showToast("Selecione a forma de pagamento!", "warning");
        return;
    }
    
    const subtotal = pdvCartItems.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const descontoPercentual = parseFloat(document.getElementById('pdv-desconto-percentual').value) || 0;
    const descontoValor = subtotal * (descontoPercentual / 100);
    const total = subtotal - descontoValor;
    
    const venda = {
        id: getNextId(VENDAS),
        clienteId: clienteId,
        nomeCliente: nomeCliente || 'Cliente Avulso',
        itens: [...pdvCartItems],
        subtotal: subtotal,
        desconto: descontoValor,
        total: total,
        formaPagamento: formaPagamento,
        timestamp: new Date().toISOString()
    };
    
    VENDAS.push(venda);
    saveData('luckhouse_vendas', VENDAS);
    
    // Atualizar estoque dos produtos
    pdvCartItems.forEach(item => {
        if (item.tipo === 'produto') {
            const produto = PRODUTOS.find(p => p.id === item.id);
            if (produto) {
                produto.estoque -= item.quantidade;
            }
        }
    });
    saveData('luckhouse_produtos', PRODUTOS);
    
    // Adicionar pontos de fidelidade se cliente cadastrado
    if (clienteId) {
        const cliente = CLIENTES.find(c => c.id === clienteId);
        if (cliente) {
            const pontosGanhos = Math.floor(total);
            cliente.pontosFidelidade = (cliente.pontosFidelidade || 0) + pontosGanhos;
            saveData('luckhouse_clientes', CLIENTES);
        }
    }
    
    showToast(`Venda #${venda.id} finalizada com sucesso!`, "success");
    limparCarrinho();
    updateDashboard();
    
    // Perguntar se deseja imprimir recibo
    if (confirm("Deseja imprimir o recibo da venda?")) {
        imprimirRecibo(venda);
    }
}

function limparCarrinho() {
    pdvCartItems = [];
    pdvPontosDesconto = { pontos: 0, valor: 0 };
    document.getElementById('pdv-cliente-select').value = '';
    document.getElementById('pdv-nome-cliente').value = '';
    document.getElementById('pdv-desconto-percentual').value = 0;
    document.getElementById('pdv-forma-pagamento').value = '';
    renderCarrinhoPDV();
    updatePdvTotals();
}

function imprimirRecibo(venda) {
    const cliente = venda.clienteId ? CLIENTES.find(c => c.id === venda.clienteId) : null;
    
    const reciboContent = `
        <div style="font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto; padding: 10px;">
            <div style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px;">
                <h3>LUCKHOUSE GAMES</h3>
                <p style="margin: 0; font-size: 12px;">RECIBO DE VENDA</p>
                <p style="margin: 0; font-size: 12px;">Venda #${venda.id}</p>
            </div>
            
            <div style="margin-bottom: 10px;">
                <p style="margin: 0; font-size: 12px;"><strong>Data:</strong> ${new Date(venda.timestamp).toLocaleString('pt-BR')}</p>
                <p style="margin: 0; font-size: 12px;"><strong>Cliente:</strong> ${venda.nomeCliente}</p>
                <p style="margin: 0; font-size: 12px;"><strong>Pagamento:</strong> ${venda.formaPagamento}</p>
            </div>
            
            <div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 0; margin: 10px 0;">
                ${venda.itens.map(item => `
                    <div style="display: flex; justify-content: space-between; font-size: 12px;">
                        <span>${item.quantidade}x ${item.nome}</span>
                        <span>${formatCurrency(item.preco * item.quantidade)}</span>
                    </div>
                `).join('')}
            </div>
            
            <div style="font-size: 12px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(venda.subtotal)}</span>
                </div>
                ${venda.desconto > 0 ? `
                <div style="display: flex; justify-content: space-between;">
                    <span>Desconto:</span>
                    <span>-${formatCurrency(venda.desconto)}</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; font-weight: bold; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px;">
                    <span>TOTAL:</span>
                    <span>${formatCurrency(venda.total)}</span>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 15px; font-size: 10px;">
                <p>Obrigado pela preferência!</p>
                <p>WhatsApp: ${STORE_CONFIG.telefone || '(11) 99999-9999'}</p>
            </div>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Recibo Venda #${venda.id}</title>
                <style>
                    body { margin: 0; padding: 10px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                ${reciboContent}
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    }
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// ===== MÓDULO DE RELATÓRIOS =====
function renderRelatoriosModule() {
    renderProdutosMaisVendidos();
    renderServicosMaisRealizados();
    renderRelatorioVendas();
    renderRelatorioFinanceiro();
}

function renderProdutosMaisVendidos() {
    const container = document.getElementById('produtos-mais-vendidos-container');
    if (!container) return;
    
    const produtosVendidos = {};
    
    VENDAS.forEach(venda => {
        venda.itens.forEach(item => {
            if (item.tipo === 'produto') {
                if (!produtosVendidos[item.id]) {
                    produtosVendidos[item.id] = {
                        nome: item.nome,
                        quantidade: 0,
                        receita: 0
                    };
                }
                produtosVendidos[item.id].quantidade += item.quantidade;
                produtosVendidos[item.id].receita += (item.preco * item.quantidade);
            }
        });
    });
    
    const ranking = Object.values(produtosVendidos)
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5);
    
    if (ranking.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhuma venda de produto registrada.</p>';
        return;
    }
    
    container.innerHTML = ranking.map((produto, index) => `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-dark-secondary rounded">
            <div>
                <span class="badge bg-primary me-2">${index + 1}º</span>
                <strong>${produto.nome}</strong>
            </div>
            <div class="text-end">
                <div class="text-success">${produto.quantidade} vendidos</div>
                <small class="text-muted">${formatCurrency(produto.receita)}</small>
            </div>
        </div>
    `).join('');
}

function renderServicosMaisRealizados() {
    const container = document.getElementById('servicos-mais-realizados-container');
    if (!container) return;
    
    const servicosRealizados = {};
    
    VENDAS.forEach(venda => {
        venda.itens.forEach(item => {
            if (item.tipo === 'servico') {
                if (!servicosRealizados[item.nome]) {
                    servicosRealizados[item.nome] = {
                        nome: item.nome,
                        quantidade: 0,
                        receita: 0
                    };
                }
                servicosRealizados[item.nome].quantidade += item.quantidade;
                servicosRealizados[item.nome].receita += (item.preco * item.quantidade);
            }
        });
    });
    
    const ranking = Object.values(servicosRealizados)
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5);
    
    if (ranking.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhum serviço realizado registrado.</p>';
        return;
    }
    
    container.innerHTML = ranking.map((servico, index) => `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-dark-secondary rounded">
            <div>
                <span class="badge bg-info me-2">${index + 1}º</span>
                <strong>${servico.nome}</strong>
            </div>
            <div class="text-end">
                <div class="text-success">${servico.quantidade} realizados</div>
                <small class="text-muted">${formatCurrency(servico.receita)}</small>
            </div>
        </div>
    `).join('');
}

function renderRelatorioVendas() {
    const container = document.getElementById('relatorio-vendas-container');
    if (!container) return;
    
    const totalVendas = VENDAS.length;
    const faturamentoTotal = VENDAS.reduce((sum, v) => sum + v.total, 0);
    const ticketMedio = totalVendas > 0 ? faturamentoTotal / totalVendas : 0;
    
    const hoje = new Date();
    const vendasHoje = VENDAS.filter(v => {
        const dataVenda = new Date(v.timestamp);
        return dataVenda.toDateString() === hoje.toDateString();
    });
    
    const faturamentoHoje = vendasHoje.reduce((sum, v) => sum + v.total, 0);
    
    container.innerHTML = `
        <div class="row text-center">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <h5>Total de Vendas</h5>
                        <h3>${totalVendas}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h5>Faturamento Total</h5>
                        <h3>${formatCurrency(faturamentoTotal)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <h5>Ticket Médio</h5>
                        <h3>${formatCurrency(ticketMedio)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-dark">
                    <div class="card-body">
                        <h5>Vendas Hoje</h5>
                        <h3>${vendasHoje.length}</h3>
                        <small>${formatCurrency(faturamentoHoje)}</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderRelatorioFinanceiro() {
    const container = document.getElementById('relatorio-financeiro-container');
    if (!container) return;
    
    const totalReceitas = RECEITAS.reduce((sum, r) => sum + r.valor, 0);
    const totalDespesas = DESPESAS.reduce((sum, d) => sum + d.valor, 0);
    const saldo = totalReceitas - totalDespesas;
    
    const faturamentoVendas = VENDAS.reduce((sum, v) => sum + v.total, 0);
    const receitaTotal = totalReceitas + faturamentoVendas;
    
    container.innerHTML = `
        <div class="row text-center">
            <div class="col-md-4">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h5>Receita Total</h5>
                        <h3>${formatCurrency(receitaTotal)}</h3>
                        <small>Vendas + Receitas</small>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-danger text-white">
                    <div class="card-body">
                        <h5>Despesas Total</h5>
                        <h3>${formatCurrency(totalDespesas)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card ${saldo >= 0 ? 'bg-info' : 'bg-warning'} text-white">
                    <div class="card-body">
                        <h5>Resultado</h5>
                        <h3>${formatCurrency(receitaTotal - totalDespesas)}</h3>
                        <small>${saldo >= 0 ? 'Lucro' : 'Prejuízo'}</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== FUNÇÕES AUXILIARES =====
function populateSelectFromAux(selectId, auxKey, placeholder = 'Selecione...') {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = `<option value="">${placeholder}</option>`;
    
    const items = CADASTROS_AUXILIARES[auxKey] || [];
    items.forEach(item => {
        select.innerHTML += `<option value="${item}">${item}</option>`;
    });
}

function populateClienteSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione um cliente...</option>';
    CLIENTES.forEach(cliente => {
        select.innerHTML += `<option value="${cliente.id}">${cliente.nome}</option>`;
    });
}

function populateServicoSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione um serviço...</option>';
    SERVICOS.forEach(servico => {
        select.innerHTML += `<option value="${servico.id}">${servico.nome}</option>`;
    });
}

function populateTecnicoSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione um técnico...</option>';
    TECNICOS.filter(t => t.ativo !== false).forEach(tecnico => {
        select.innerHTML += `<option value="${tecnico.id}">${tecnico.nome}</option>`;
    });
}

function populateOSSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione uma OS...</option>';
    ORDENS_SERVICO.forEach(os => {
        const cliente = CLIENTES.find(c => c.id === os.clienteId);
        select.innerHTML += `<option value="${os.id}">OS #${String(os.id).padStart(6, '0')} - ${cliente ? cliente.nome : 'N/A'}</option>`;
    });
}

// ===== CONFIGURAÇÕES =====
function setupConfiguracoes() {
    // Carregar configurações da loja
    const configLoja = loadData('luckhouse_config_loja', {});
    if (configLoja.nomeLoja) document.getElementById('config-nome-loja').value = configLoja.nomeLoja;
    if (configLoja.cnpj) document.getElementById('config-cnpj').value = configLoja.cnpj;
    if (configLoja.telefone) document.getElementById('config-telefone').value = configLoja.telefone;
    if (configLoja.email) document.getElementById('config-email').value = configLoja.email;
    if (configLoja.endereco) document.getElementById('config-endereco').value = configLoja.endereco;
    
    // Form de configurações da loja
    const formConfigLoja = document.getElementById('formConfigLoja');
    if (formConfigLoja) {
        formConfigLoja.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const config = {
                nomeLoja: document.getElementById('config-nome-loja').value.trim(),
                cnpj: document.getElementById('config-cnpj').value.trim(),
                telefone: document.getElementById('config-telefone').value.trim(),
                email: document.getElementById('config-email').value.trim(),
                endereco: document.getElementById('config-endereco').value.trim()
            };
            
            saveData('luckhouse_config_loja', config);
            STORE_CONFIG = config;
            showToast("Configurações da loja salvas com sucesso!", "success");
        });
    }
    
    // Configurações do sistema
    const formConfigSistema = document.getElementById('formConfigSistema');
    if (formConfigSistema) {
        formConfigSistema.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const tema = document.getElementById('config-tema').value;
            
            // Aplicar tema
            if (tema === 'light') {
                document.body.classList.add('light-theme');
                document.body.classList.remove('dark-theme');
            } else {
                document.body.classList.add('dark-theme');
                document.body.classList.remove('light-theme');
            }
            
            const configSistema = {
                tema: tema,
                garantiaDias: parseInt(document.getElementById('config-garantia-dias').value) || 90,
                pontosReal: parseFloat(document.getElementById('config-pontos-real').value) || 1,
                pontosDesconto: parseInt(document.getElementById('config-pontos-desconto').value) || 100,
                valorDesconto: parseFloat(document.getElementById('config-valor-desconto').value) || 10
            };
            
            saveData('luckhouse_config_sistema', configSistema);
            showToast("Configurações do sistema salvas com sucesso!", "success");
        });
    }
}

// ===== INICIALIZAÇÃO =====
function initializeApp() {
    console.log('Inicializando Luckhouse Games v5.0...');
    
    // Carregar dados do localStorage
    CLIENTES = loadData('luckhouse_clientes', []);
    PRODUTOS = loadData('luckhouse_produtos', []);
    SERVICOS = loadData('luckhouse_servicos', []);
    ORDENS_SERVICO = loadData('luckhouse_os', []);
    VENDAS = loadData('luckhouse_vendas', []);
    RECEITAS = loadData('luckhouse_receitas', []);
    DESPESAS = loadData('luckhouse_despesas', []);
    ENVIOS_LAB = loadData('luckhouse_envios_lab', []);
    TECNICOS = loadData('luckhouse_tecnicos', []);
    AVALIACOES_CONSOLES = loadData('luckhouse_avaliacoes_consoles', []);
    TRANSACOES_FINANCEIRAS = loadData('luckhouse_transacoes', []);
    CADASTROS_AUXILIARES = loadData('luckhouse_cadastros_aux', CADASTROS_AUXILIARES);
    STORE_CONFIG = loadData('luckhouse_config_loja', {});
    
    // Configurar módulos
    setupNavigation();
    setupClientesModule();
    setupProdutosModule();
    setupServicosModule();
    setupOSModule();
    setupFinanceiroModule();
    setupEnvioLabModule();
    setupTecnicosModule();
    setupAvaliacaoConsolesModule();
    setupPDVModule();
    setupConfiguracoes();
    
    // Renderizar dados iniciais
    renderClientesList();
    renderProdutosList();
    renderServicosList();
    updateDashboard();
    
    // Navegar para dashboard
    navigateToSection('dashboard');
    
    // Atualizar ano no footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    console.log('Sistema inicializado com sucesso!');
    showToast("Sistema carregado com sucesso!", "success", "Luckhouse Games");
}

// ===== EVENTOS GLOBAIS =====
window.editarCliente = editarCliente;
window.excluirCliente = excluirCliente;
window.abrirWhatsAppCliente = abrirWhatsAppCliente;
window.editarProduto = editarProduto;
window.excluirProduto = excluirProduto;
window.editarServico = editarServico;
window.excluirServico = excluirServico;
window.editarOS = editarOS;
window.excluirOS = excluirOS;
window.imprimirOS = imprimirOS;
window.editarReceita = editarReceita;
window.excluirReceita = excluirReceita;
window.editarDespesa = editarDespesa;
window.excluirDespesa = excluirDespesa;
window.editarEnvioLab = editarEnvioLab;
window.excluirEnvioLab = excluirEnvioLab;
window.editarTecnico = editarTecnico;
window.excluirTecnico = excluirTecnico;
window.abrirWhatsAppTecnico = abrirWhatsAppTecnico;
window.editarAvaliacaoConsole = editarAvaliacaoConsole;
window.excluirAvaliacaoConsole = excluirAvaliacaoConsole;
window.criarProdutoDeAvaliacao = criarProdutoDeAvaliacao;
window.incrementarItemCarrinho = incrementarItemCarrinho;
window.decrementarItemCarrinho = decrementarItemCarrinho;
window.removerItemCarrinho = removerItemCarrinho;

// ===== INICIALIZAÇÃO QUANDO DOM ESTIVER PRONTO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, configurando sistema de login...');
    setupLoginSystem();
    
    // Aplicar tema padrão
    document.body.classList.add('dark-theme');
    
    console.log('Sistema pronto para uso!');
});

