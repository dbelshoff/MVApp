

// Variável global para armazenar o cliente selecionado
let clienteSelecionado = null;
let clientesListaCompleta = []; // Variável para armazenar a lista completa de clientes

// Função para carregar a lista de clientes
async function carregarClientes() {
    const token = localStorage.getItem('token');

    if (!token) {
       alert("Você precisa estar logado para ver os clientes.");
       window.location.href = "admin.html";
       return;
    } 

    try {
        const response = await fetch('/api/Clientes/listarClientes', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const clientes = await response.json();
            clientesListaCompleta = clientes; // Armazena a lista completa de clientes
            exibirClientes(clientes); // Função para exibir clientes na tabela
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'Erro ao carregar clientes.');
        }
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        alert('Ocorreu um erro ao carregar os clientes. Tente novamente mais tarde.');
    }
}

// Função para exibir os clientes na tabela
function exibirClientes(clientes) {
    const tableBody = document.querySelector('#clientes-table tbody');
    if (tableBody) {
        tableBody.innerHTML = ''; // Limpa a tabela

        clientes.forEach(cliente => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cliente.id}</td>
                <td>${cliente.nome}</td>
                <td>${cliente.cpf}</td>
                <td>${cliente.email}</td>
                <td>${cliente.telefone}</td>
                <td>${cliente.limiteDeCredito}</td>
                <td>${cliente.limiteDisponivel}</td>
                <td>
                    <button onclick="toggleBloqueioCliente(${cliente.id}, ${cliente.bloqueado})">
                        ${cliente.bloqueado ? 'Desbloquear' : 'Bloquear'}
                    </button>
                   
                </td>
            `;
            tableBody.appendChild(row);

            // Evento de clique para selecionar o cliente
            row.addEventListener('click', function () {
                document.querySelectorAll('#clientes-table tbody tr').forEach(linha => {
                    linha.classList.remove('selected-row');
                });
                row.classList.add('selected-row');

                clienteSelecionado = cliente; // Define o cliente selecionado
            });

             // Evento de duplo clique para abrir o modal de edição
             row.addEventListener('dblclick', function () {
                clienteSelecionado = cliente; // Define o cliente selecionado para edição
                mostrarModalEdit(); // Chama a função de alteração ao dar dois cliques
            });
        });
    }
}

// Função para filtrar clientes com base na pesquisa
function filtrarClientes() {
    const termoPesquisa = document.getElementById('searchField').value.toLowerCase();
    const clientesFiltrados = clientesListaCompleta.filter(cliente => 
        cliente.nome.toLowerCase().includes(termoPesquisa) || cliente.cpf.includes(termoPesquisa)
    );
    exibirClientes(clientesFiltrados); // Exibe apenas os clientes filtrados
}

// Adicionar evento de pesquisa ao campo de busca
document.getElementById('searchField').addEventListener('input', filtrarClientes);

// Função para alternar bloqueio do cliente
async function toggleBloqueioCliente(clienteId, bloqueado) {
    const token = localStorage.getItem('token');
    const url = `/api/Clientes/${bloqueado ? 'desbloquearCliente' : 'bloquearCliente'}/${clienteId}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert(`Cliente ${bloqueado ? 'desbloqueado' : 'bloqueado'} com sucesso!`);
            carregarClientes(); // Recarrega a lista de clientes
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'Erro ao alterar status do cliente.');
        }
    } catch (error) {
        console.error('Erro ao alterar status do cliente:', error);
        alert('Ocorreu um erro ao alterar o status do cliente. Tente novamente mais tarde.');
    }
}


// Função para mostrar o modal de cadastro de cliente
function mostrarModalCadastro() {
    document.getElementById('createClientModal').style.display = 'block';
}

// Função para fechar o modal de cadastro
function fecharModalCadastro() {
    document.getElementById('createClientModal').style.display = 'none';
}

// Função para mostrar o modal de edição de cliente
function mostrarModalEdit() {
    if (!clienteSelecionado) {
        alert('Por favor, selecione um cliente primeiro.');
        return;
    }

    // Exibe o modal de edição
    document.getElementById('editModal').style.display = 'block';

    // Carregar os dados do cliente selecionado no formulário de edição
    document.getElementById('editNome').value = clienteSelecionado.nome;
    document.getElementById('editCpf').value = clienteSelecionado.cpf;
    document.getElementById('editEmail').value = clienteSelecionado.email;
    document.getElementById('editEndereco').value = clienteSelecionado.endereco;
    document.getElementById('editTelefone').value = clienteSelecionado.telefone;
    document.getElementById('editDiaDePagamento').value = new Date(clienteSelecionado.diaDePagamento).toISOString().substring(0, 10);
    document.getElementById('editSenha').value = clienteSelecionado.senha;
    document.getElementById('editLimiteDeCredito').value = clienteSelecionado.limiteDeCredito;
}

// Função para fechar o modal de edição
function fecharModalEdit() {
    document.getElementById('editModal').style.display = 'none';
}

// Função para salvar as alterações do cliente
document.getElementById('saveClientBtn').addEventListener('click', async function () {
    if (!clienteSelecionado) return;

    const token = localStorage.getItem('token');
    const url = `/api/Clientes/atualizarCliente/${clienteSelecionado.id}`;

    const updatedClient = {
        id: clienteSelecionado.id,
        nome: document.getElementById('editNome').value,
        cpf: document.getElementById('editCpf').value,
        email: document.getElementById('editEmail').value,
        endereco: document.getElementById('editEndereco').value,
        telefone: document.getElementById('editTelefone').value,
        diaDePagamento: document.getElementById('editDiaDePagamento').value,
        limiteDeCredito: parseFloat(document.getElementById('editLimiteDeCredito').value),
        senha: document.getElementById('editSenha').value
    };

    try {
        // Primeira chamada: Atualizar os dados do cliente
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedClient)
        });

        if (response.ok) {
            // Segunda chamada: Ajustar o limite após a atualização
            const limiteUrl = `/api/Clientes/alterarLimite/${clienteSelecionado.id}`;
            const limiteDto = { NovoLimite: updatedClient.limiteDeCredito };

            const limiteResponse = await fetch(limiteUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(limiteDto)
            });

            if (limiteResponse.ok) {
                alert('Cliente atualizado com sucesso e limite recalculado!');
                document.getElementById('editModal').style.display = 'none'; // Fecha o modal de edição
                carregarClientes(); // Recarrega a lista de clientes
            } else {
                const errorData = await limiteResponse.json();
                alert(errorData.message || 'Erro ao ajustar o limite do cliente.');
            }
        } else {
            const errorData = await response.json();
            console.error('Erro ao atualizar cliente:', errorData);
            alert(errorData.message || 'Erro ao atualizar cliente.');
        }
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        alert('Ocorreu um erro ao atualizar o cliente. Tente novamente mais tarde.');
    }
});

// Função para salvar o novo cliente
document.getElementById('saveNewClientBtn').addEventListener('click', async function () {
    const nome = document.getElementById('createNome').value;
    const cpf = document.getElementById('createCpf').value;
    const email = document.getElementById('createEmail').value;
    const senha = document.getElementById('createSenha').value;
    const endereco = document.getElementById('createEndereco').value;
    const telefone = document.getElementById('createTelefone').value;
    const diaDePagamento = document.getElementById('createDiaDePagamento').value;
    const limiteDeCredito = parseFloat(document.getElementById('createLimiteDeCredito').value) || 0;
    

    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/Clientes/cadastrarCliente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nome,
                cpf,
                email,
                senha,
                endereco,
                telefone,
                diaDePagamento,
                limiteDeCredito
            })
        });

        if (response.ok) {
            alert('Cliente cadastrado com sucesso!');
            document.getElementById('createClientModal').style.display = 'none';
            carregarClientes(); // Atualiza a lista de clientes
        } else {
            const errorData = await response.json();
            alert(`Erro: ${errorData.message || 'Falha ao cadastrar o cliente.'}`);
        }
    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error);
        alert(`Erro: ${errorData.message || 'Ocorreu um erro ao cadastrar o cliente. Tente novamente mais tarde.'}`);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const hamburgerMenu = document.getElementById("hamburgerMenu");

    // Clique no menu hamburger para mostrar ou esconder sidebar
    hamburgerMenu.addEventListener("click", function () {
        sidebar.classList.toggle("hidden");
    });

    // Função de logout
    document.getElementById('logoutLink').addEventListener('click', function(event) {
        event.preventDefault();
        logout();
    });
});

// Fechar o modal ao clicar no "X" ou no botão "Cancelar"
document.addEventListener('DOMContentLoaded', function () {
    const closeCreateButton = document.querySelector('.close-create');
    const cancelarCadastroButton = document.getElementById('cancelNewClientBtn');
    const cancelarEdicaoButton = document.getElementById('cancelEditClientBtn');
    const closeEditButton = document.querySelector('.close');
    const alterarClienteButton = document.getElementById('alterarCliente');
    const novoClienteButton = document.getElementById('novoCliente');
    const logoutLink = document.getElementById('logoutLink');

    // Fechar o modal de cadastro ao clicar no "X" ou no botão "Cancelar"
    if (closeCreateButton) {
        closeCreateButton.addEventListener('click', fecharModalCadastro);
    }

    if (cancelarCadastroButton) {
        cancelarCadastroButton.addEventListener('click', fecharModalCadastro);
    }

    // Fechar o modal de edição ao clicar no "X"
    if (closeEditButton) {
        closeEditButton.addEventListener('click', fecharModalEdit);
    }

    if (cancelarEdicaoButton) {
        cancelarEdicaoButton.addEventListener('click', fecharModalEdit);
    }

    // Mostrar o modal de edição ao clicar em "Alterar" no menu hambúrguer
    if (alterarClienteButton) {
        alterarClienteButton.addEventListener('click', mostrarModalEdit);
    }

    if (novoClienteButton) {
        novoClienteButton.addEventListener('click', mostrarModalCadastro);
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', function (event) {
            event.preventDefault();
            logout();
        });
    }
});





function logout() {
    console.log('Tentando fazer logout...');
    localStorage.removeItem('token');
    console.log('Token após remoção:', localStorage.getItem('token'));
    window.location.href = "index.html";
}






// Chama a função ao carregar a página
window.onload = carregarClientes;
