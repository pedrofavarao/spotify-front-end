////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// ESLITIZAÇÃO ///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNÇÃO PARA CRIAR ELEMENTOS HTML, PODENDO ADICIONAR TEXTO, CLASSES E ID
function criaElemento(element, texto, atributos) {
    // cria o elemento
    const elemento = document.createElement(element);
    // define o conteúdo do elemento, se especificado
    if (texto !== undefined && texto !== null) {
        elemento.textContent = texto;
    }
    // adiciona atributos ao elemento, se especificados
    if (atributos !== undefined && atributos !== null) {
        for (let chave in atributos) {
            elemento.setAttribute(chave, atributos[chave]);
        }
    }
    return elemento;
}

// FUNÇÃO DE ENCAPSULAMENTO DE ELEMENTOS HTML
function encapsular(pai, filhos) {
    // looping para cada elemento filho
    filhos.forEach(filho => {
        // encapsula o elemento filho dentro do elemento pai
        pai.appendChild(filho);
    });
    // retorna o elemento pai com todos os elementos filhos adicionados
    return pai;
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// FUNÇÕES DA API /////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNÇÃO PARA CHAMAR A API
async function fetchData(url,token,metodo,variaveis) {
    try {
        // cria a chamada da api
        const response = await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify(variaveis)
        });
        // se a resposta for sucesso
        if (response.ok) {
            // se o método for DELETE, não analisa a resposta
            if (metodo === 'DELETE') {
                return { success: true };
            }
            // cria a variavel data, adiciona os dados dentro dela
            let data = await response.json();
            // retorna a variavel
            return data;
        } else {
            throw new Error(`Falha de conexão com a API, status: ${response.status}`);
        }
    } catch (error) {
        throw error;
    }
}

// FUNÇÃO LOGIN
async function fazerLogin() {
    // pega as variaveis
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    // variaveis api
    let metodo = 'POST';
    let url = 'http://localhost:2595/api/v1/auth/login';
    let token = null;

    fetchData(url,token,metodo,{email,password})
        .then(data => {
            // se o token for valido
            if (data.token) {
                // salva o token em session storage para acessar outras paginas
                localStorage.setItem('token', data.token);
                // altera a pagina
                window.location.href = 'musica_listar.html';
            } else {
                alert('Credenciais inválidas. Tente novamente.');
            }
        }) .catch(error => {
            alert(`${error}`);
            console.error(error);
        });
}

// FUNÇÃO LOGOFF
function logoff() {
    // envia para pagina de login
    window.location.href = 'index.html';
    // apaga o token do session storage
    localStorage.clear();
    sessionStorage.clear();
}

//FUNÇÃO LISTAR MÚSICAS
async function listarMusicas() {
    // valida se o usuario está logado
    const token = localStorage.getItem('token');
    if (token === null) {
        alert('Por favor faça login');
        window.location.href = 'index.html';
    }
    // variaveis api
    let url = 'http://localhost:2595/musics';
    let metodo = 'GET';

    fetchData(url,token,metodo)
        .then(data => {
            // pega elemento html
            let musicList = document.getElementById('music-list');

            // cria um array para musicas
            let musicas = [];
            // adiciona as musicas da api dentro do array
            data.forEach(music => {
                musicas.push({
                    id: music.id,
                    trackName: music.trackName,
                    artistName: music.artistName
                });
            });

            // para cada musica no array, cria os elementos
            musicas.forEach(music => {
                let divMusic = criaElemento("div", null, { id: `${music.id}`, class: 'div-musica' });
                let musicNome = criaElemento("h3", `${music.trackName}`);
                let musicID = criaElemento("p", `ID: ${music.id}`);
                let musicArtista = criaElemento("p", `${music.artistName}`);
                encapsular(musicList, [divMusic]);
                encapsular(divMusic, [musicNome, musicArtista, musicID]);
            });

            // BARRA DE PESQUISA
            function searchMusic() {
                // pega o texto da pesquisa
                let searchSting = document.getElementById("searchInput").value.toLowerCase();
                let resultadoContainer = document.getElementById("music-list");

                // limpa os resultados anteriores
                resultadoContainer.innerHTML = "";

                // filtra as músicas com base na string de pesquisa
                const results = musicas.filter(music => {
                    return music.trackName.toLowerCase().includes(searchSting) || music.artistName.toLowerCase().includes(searchSting);
                });

                // se não for encontrada nenhuma música igual a string, exibe a mensagem de não encontrado
                if (results.length === 0) {
                    let resultDiv = document.createElement("div");
                    resultDiv.classList.add("search-result");
                    resultDiv.classList.add("div-musica-alinhar");
                    let p = document.createElement("p");
                    p.innerHTML = "Nenhuma música encontrada.";
                    resultDiv.appendChild(p);
                    resultadoContainer.appendChild(resultDiv);
                }
                // se encontrar, exibe as músicas
                else {
                    results.forEach(result => {
                        let resultDiv = document.createElement("div");
                        resultDiv.classList.add("search-result");
                        resultDiv.classList.add("div-musica");
                        resultDiv.id = `${result.id}`;
                        resultDiv.innerHTML = `<h3>${result.trackName}</h3><p>Artista: ${result.artistName}</p><p>ID: ${result.id}</p>`;
                        resultadoContainer.appendChild(resultDiv);
                    });
                }
            }
            // evento de ativação da barra de pesquisa
            document.getElementById("searchInput").addEventListener("input", searchMusic);

        }) .catch(error => {
            alert(`${error}`);
            console.error(error);
        });
}

// FUNÇÃO LISTAR ATRIBUTOS DA MÚSICA
async function abrirMusica() {
    // valida se o usuario está logado
    const token = localStorage.getItem('token');
    if (token === null) {
        alert('Por favor faça login');
        window.location.href = 'index.html';
    }
    // variaveis api
    let mscID = localStorage.getItem('musicID');
    let metodo = 'GET';
    let url = `http://localhost:2595/musics/${mscID}`;

    fetchData(url,token,metodo)
        .then(data => {
            document.getElementById('id').value = data.id;
            document.getElementById('trackName').value = data.trackName;
            document.getElementById('artistName').value = data.artistName;
            document.getElementById('artistCount').value = data.artistCount;
            document.getElementById('releasedYear').value = data.releasedYear;
            document.getElementById('releasedMonth').value = data.releasedMonth;
            document.getElementById('releasedDay').value = data.releasedDay;
            document.getElementById('inSpotifyPlaylists').value = data.inSpotifyPlaylists;
            document.getElementById('inSpotifyCharts').value = data.inSpotifyCharts;
            document.getElementById('streams').value = data.streams;
            document.getElementById('inApplePlaylists').value = data.inApplePlaylists;
            document.getElementById('inAppleCharts').value = data.inAppleCharts;
            document.getElementById('inDeezerPlaylists').value = data.inDeezerPlaylists;
            document.getElementById('inDeezerCharts').value = data.inDeezerCharts;
            document.getElementById('inShazamCharts').value = data.inShazamCharts;
            document.getElementById('bpm').value = data.bpm;
            document.getElementById('key').value = data.key;
            document.getElementById('mode').value = data.mode;
            document.getElementById('danceability').value = data.danceability;
            document.getElementById('valence').value = data.valence;
            document.getElementById('energy').value = data.energy;
            document.getElementById('acousticness').value = data.acousticness;
            document.getElementById('instrumentalness').value = data.instrumentalness;
            document.getElementById('liveness').value = data.liveness;
            document.getElementById('speechiness').value = data.speechiness;
        }) .catch(error => {
            alert(`${error}`);
            console.error(error);
        });
}

// FUNÇÃO EDITAR MÚSICA
async function editarMusica() {
    // pega as variaveis
    let id = document.getElementById('id').value;
    let trackName = document.getElementById('trackName').value;
    let artistName = document.getElementById('artistName').value;
    let artistCount = document.getElementById('artistCount').value;
    let releasedDay = document.getElementById('releasedDay').value;
    let releasedMonth = document.getElementById('releasedMonth').value;
    let releasedYear = document.getElementById('releasedYear').value;
    let inSpotifyPlaylists = document.getElementById('inSpotifyPlaylists').value;
    let inSpotifyCharts = document.getElementById('inSpotifyCharts').value;
    let streams = document.getElementById('streams').value;
    let inApplePlaylists = document.getElementById('inApplePlaylists').value;
    let inAppleCharts = document.getElementById('inAppleCharts').value;
    let inDeezerPlaylists = document.getElementById('inDeezerPlaylists').value;
    let inDeezerCharts = document.getElementById('inDeezerCharts').value;
    let inShazamCharts = document.getElementById('inShazamCharts').value;
    let bpm = document.getElementById('bpm').value;
    let key = document.getElementById('key').value;
    let mode = document.getElementById('mode').value;
    let danceability = document.getElementById('danceability').value;
    let valence = document.getElementById('valence').value;
    let energy = document.getElementById('energy').value;
    let acousticness = document.getElementById('acousticness').value;
    let instrumentalness = document.getElementById('instrumentalness').value;
    let liveness = document.getElementById('liveness').value;
    let speechiness = document.getElementById('speechiness').value;

    // valida se o usuario está logado
    const token = localStorage.getItem('token');
    if (token === null) {
        alert('Por favor faça login');
        window.location.href = 'index.html';
    }
    // variaveis api
    let mscID = localStorage.getItem('musicID');
    let metodo = 'PATCH';
    let url = `http://localhost:2595/musics/${mscID}`;

    fetchData(url,token,metodo,{id,trackName,artistName,artistCount,releasedDay,releasedMonth,releasedYear,inSpotifyPlaylists,inSpotifyCharts,streams,inApplePlaylists,inAppleCharts,inDeezerPlaylists,inDeezerCharts,inShazamCharts,bpm,key,mode,danceability,valence,energy,acousticness,instrumentalness,liveness,speechiness    })
        .then(data => {
            // se o token for valido
            alert('Alteração bem-sucedida!');
            // remove o id da música do session storage
            localStorage.removeItem(mscID)
            // redireciona para pagina de músicas
            window.location.href = 'musica_listar.html';

        }) .catch(error => {
            alert(`${error}`);
            console.error(error);
        });
}

// FUNÇÃO DELETAR MÚSICA
async function deletarMusica() {
    // pega os elementos html
    let trackName = document.getElementById('trackName').value;
    let resposta = confirm(`Tem certeza que deseja excluir ${trackName}?`);
    // confirma se o usuario realmente quer deletar
    if (resposta === true) {
        // valida se o usuario está logado
        const token = localStorage.getItem('token');
        if (token === null) {
            alert('Por favor faça login');
            window.location.href = 'index.html';
        }
        // variaveis api
        let mscID = localStorage.getItem('musicID');
        let metodo = 'DELETE';
        let url = `http://localhost:2595/musics/${mscID}`;

        // chama a função da api
        let response = await fetchData(url, token, metodo);
        // se a conexao com api der certo
        if (response.success) {
            // emite um alerta
            alert(`A música "${trackName}" foi excluída com sucesso`);
            // remove o id do session storage
            localStorage.removeItem('musicID');
            // retorna para pagina de listar musica
            window.location.href = 'musica_listar.html';
        } else {
            alert(`Erro! ${data.message}`);
            console.error(data.message);
        }

    }
    // cancela a operação caso clique em cancelar
    else {
      alert("Operação cancelada");
    }
}

// FUNÇÃO ADICIONAR MÚSICA
async function adicionarMusica() {
    // pega as variaveis
    let trackName = document.getElementById('trackName').value;
    let artistName = document.getElementById('artistName').value;
    let artistCount = document.getElementById('artistCount').value;
    let releasedDay = document.getElementById('releasedDay').value;
    let releasedMonth = document.getElementById('releasedMonth').value;
    let releasedYear = document.getElementById('releasedYear').value;
    let inSpotifyPlaylists = document.getElementById('inSpotifyPlaylists').value;
    let inSpotifyCharts = document.getElementById('inSpotifyCharts').value;
    let streams = document.getElementById('streams').value;
    let inApplePlaylists = document.getElementById('inApplePlaylists').value;
    let inAppleCharts = document.getElementById('inAppleCharts').value;
    let inDeezerPlaylists = document.getElementById('inDeezerPlaylists').value;
    let inDeezerCharts = document.getElementById('inDeezerCharts').value;
    let inShazamCharts = document.getElementById('inShazamCharts').value;
    let bpm = document.getElementById('bpm').value;
    let key = document.getElementById('key').value;
    let mode = document.getElementById('mode').value;
    let danceability = document.getElementById('danceability').value;
    let valence = document.getElementById('valence').value;
    let energy = document.getElementById('energy').value;
    let acousticness = document.getElementById('acousticness').value;
    let instrumentalness = document.getElementById('instrumentalness').value;
    let liveness = document.getElementById('liveness').value;
    let speechiness = document.getElementById('speechiness').value;

    // valida se o usuario está logado
    const token = localStorage.getItem('token');
    if (token === null) {
        alert('Por favor faça login');
        window.location.href = 'index.html';
    }
    // variaveis api
    let metodo = 'POST';
    let url = 'http://localhost:2595/musics';

    fetchData(url,token,metodo,{trackName,artistName,artistCount,releasedDay,releasedMonth,releasedYear,inSpotifyPlaylists,inSpotifyCharts,streams,inApplePlaylists,inAppleCharts,inDeezerPlaylists,inDeezerCharts,inShazamCharts,bpm,key,mode,danceability,valence,energy,acousticness,instrumentalness,liveness,speechiness    })
        .then(data => {
            // se o token for valido
            alert(`${trackName} adicionada com sucesso!`);
            // redireciona para pagina de músicas
            window.location.href = 'musica_listar.html';

        }) .catch(error => {
            alert(`${error}`);
            console.error(error);
        });
}

// FUNÇÃO LISTAR USUARIO
async function listarUsuarios() {
    // valida se o usuario está logado
    const token = localStorage.getItem('token');
    if (token === null) {
        alert('Por favor faça login');
        window.location.href = 'index.html';
    }
    // variaveis api
    let url = 'http://localhost:2595/users';
    let metodo = 'GET';

    fetchData(url,token,metodo)
        .then(data => {
            // pega o elemento html
            let userList = document.getElementById('container-user');
            // cria array para os usuarios
            let usuarios = [];
            data.forEach(user => {
                usuarios.push({
                    id: user.id,
                    name: user.name,
                    email: user.email
                });
            });
            // para cada usuario cria um elemento html
            usuarios.forEach(user => {
                let divUsers = criaElemento("div", null, {class: 'div-users', id:`${user.id}`});
                let div2Users = criaElemento("div", null, {class: 'div-users2'});
                let mensagem = criaElemento("h1",`Usuário #${user.id}`);
                let nome = criaElemento("p",`Nome: ${user.name}`);
                let email = criaElemento("p",`E-mail: ${user.email}`);
                let btnEditar = criaElemento("a",'Editar',{class: 'btn-editar'});
                let btnExcluir = criaElemento("a",'Excluir',{class: 'btn-excluir'});
                // encapsula os elementos html
                encapsular(userList, [divUsers]);
                encapsular(div2Users, [btnEditar,btnExcluir]);
                encapsular(divUsers, [mensagem, nome, email, div2Users]);
            });

        }) .catch(error => {
            console.error(error);
        });
}

// FUNÇÃO LISTAR ATRIBUTOS DO USUARIO
async function abrirUsuario() {
    // valida se o usuario está logado
    const token = localStorage.getItem('token');
    if (token === null) {
        alert('Por favor faça login');
        window.location.href = 'index.html';
    }
    // variaveis api
    let userID = localStorage.getItem('userID');
    let metodo = 'GET';
    let url = `http://localhost:2595/users/${userID}`;

    fetchData(url,token,metodo)
        .then(data => {
            // seta as variaveis
            document.getElementById('id').value = data.id;
            document.getElementById('name').value = data.name;
            document.getElementById('email').value = data.email;
            document.getElementById('password').value = data.password;
            document.getElementById('username').value = data.username;
            document.getElementById('authorities').value = data.authorities;
            // checkboxs
            let enabledValue = data.enabled;
            let accountNonExpired = data.accountNonExpired;
            let accountNonLocked = data.accountNonLocked;
            let credentialsNonExpired = data.credentialsNonExpired;

            // altera os bool nas checkboxs
            switch (enabledValue) {
                case true:
                  document.getElementById('enabled').checked = true;
                break;
                case false:
                  document.getElementById('enabled').checked = false;
                break;
            }
            switch (accountNonExpired) {
                case true:
                    document.getElementById('accountNonExpired').checked = true;
                break;
                case false:
                    document.getElementById('accountNonExpired').checked = false;
                break;
            }
            switch (accountNonLocked) {
                case true:
                    document.getElementById('accountNonLocked').checked = true;
                break;
                case false:
                    document.getElementById('accountNonLocked').checked = false;
                break;
            }
            switch (credentialsNonExpired) {
                case true:
                    document.getElementById('credentialsNonExpired').checked = true;
                break;
                case false:
                    document.getElementById('credentialsNonExpired').checked = false;
                break;
            }

        }) .catch(error => {
            alert(`${error}`);
            console.error(error);
        });
}

// FUNÇÃO EDITAR USUARIO
async function editarUsuario() {
    // seta as variaveis
    let id = document.getElementById('id').value;
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let username = document.getElementById('username').value;
    let authorities = document.getElementById('authorities').value;
    // checkboxs
    switch (document.getElementById('enabled').checked) {
        case true:
            var enabled = true;
        break;
        case false:
            var enabled = false;
        break;
    }
    switch (document.getElementById('accountNonExpired').checked) {
        case true:
            var accountNonExpired = true;
        break;
        case false:
            var accountNonExpired = false;
        break;
    }
    switch (document.getElementById('accountNonLocked').checked) {
        case true:
            var accountNonLocked = true;
        break;
        case false:
            var accountNonLocked = false;
        break;
    }
    switch (document.getElementById('credentialsNonExpired').checked) {
        case true:
            var credentialsNonExpired = true;
        break;
        case false:
            var credentialsNonExpired = false;
        break;
    }

    // valida se o usuario está logado
    const token = localStorage.getItem('token');
    if (token === null) {
        alert('Por favor faça login');
        window.location.href = 'index.html';
    }
    // variaveis api
    let userID = localStorage.getItem('userID');
    let metodo = 'PATCH';
    let url = `http://localhost:2595/users/${userID}`;

    fetchData(url,token,metodo,{id,name,email,password,enabled,username,authorities,accountNonExpired,accountNonLocked,credentialsNonExpired})
        .then(data => {
            // se o token for valido
            alert('Alteração bem-sucedida!');
            // remove o id da música do session storage
            localStorage.removeItem(userID)
            // redireciona para pagina de músicas
            window.location.href = 'user_listar.html';

        }) .catch(error => {
            alert(`${error}`);
            console.error(error);
        });
}

// FUNÇÃO ADICIONAR USUARIO
async function adicionarUsuario() {
    // pega as variaveis
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let username = document.getElementById('username').value;
    let authorities = document.getElementById('authorities').value;
    //checkboxs
    switch (document.getElementById('enabled').checked) {
        case true:
            var enabled = true;
        break;
        case false:
            var enabled = false;
        break;
    }
    switch (document.getElementById('accountNonExpired').checked) {
        case true:
            var accountNonExpired = true;
        break;
        case false:
            var accountNonExpired = false;
        break;
    }
    switch (document.getElementById('accountNonLocked').checked) {
        case true:
            var accountNonLocked = true;
        break;
        case false:
            var accountNonLocked = false;
        break;
    }
    switch (document.getElementById('credentialsNonExpired').checked) {
        case true:
            var credentialsNonExpired = true;
        break;
        case false:
            var credentialsNonExpired = false;
        break;
    }

    // valida se o usuario está logado
    const token = localStorage.getItem('token');
    if (token === null) {
        alert('Por favor faça login');
        window.location.href = 'index.html';
    }
    // variaveis api
    let metodo = 'POST';
    let url = 'http://localhost:2595/api/v1/auth/subscribe';

    fetchData(url,token,metodo,{name,email,password,enabled,username,authorities,accountNonExpired,accountNonLocked,credentialsNonExpired})
        .then(data => {
            // se o token for valido
            alert(`${name} adicionado com sucesso!`);
            // redireciona para pagina de músicas
            window.location.href = 'user_listar.html';

        }) .catch(error => {
            alert(`${error}`);
            console.error(error);
        });
}

// FUNÇÃO DELETAR USUARIO
async function deletarUsuario(id) {
    // pega os elementos html
    let resposta = confirm(`Tem certeza que deseja excluir o usuário ${id}?`);
    // confirma se o usuario realmente quer deletar
    if (resposta === true) {
        // valida se o usuario está logado
        const token = localStorage.getItem('token');
        if (token === null) {
            alert('Por favor faça login');
            window.location.href = 'index.html';
        }
        // variaveis api
        let metodo = 'DELETE';
        let url = `http://localhost:2595/users/${id}`;

        // chama a função da api
        let response = await fetchData(url, token, metodo);
        // se a conexao com api der certo
        if (response.success) {
            // emite um alerta
            alert(`O usuário ID ${id} foi excluído com sucesso`);
            // atualiza a pagina
            window.location.href = 'user_listar.html';
        } else {
            alert(`Erro! ${data.message}`);
            console.error(data.message);
        }

    }
    // cancela a operação caso clique em cancelar
    else {
      alert("Operação cancelada");
    }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////// CLIQUES /////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function() {
    // BOTÃO DE LOGIN
    let botaoLogin = document.getElementById('botaoLogin');
    // se clicar no botão de login, vai rodar a função fazerLogin
    if (botaoLogin) {
        botaoLogin.addEventListener('click', fazerLogin);
    }

    // USUÁRIO
    let userIcon = document.getElementById("userIcon");
    let optionsList = document.getElementById("optionsList");
    // se clicar no usuário, vai abrir a lista de opções
    if (userIcon) {
        userIcon.addEventListener("click", () => {
            if (optionsList.style.display === "none" || optionsList.style.display === "") {
                optionsList.style.display = "block";
            } else {
                optionsList.style.display = "none";
            }
        });
        // se clicar fora do painel de opções, some com o painel
        document.addEventListener("click", (e) => {
            if (!e.target.matches("#userIcon") && !e.target.matches("#optionsList li")) {
                optionsList.style.display = "none";
            }
        });
    }

    // ACESSAR UMA MUSICA CLICANDO NELA
    let musicList = document.getElementById('music-list');
    // verifica se foi clicado na div music-lista
    if (musicList) {
        musicList.addEventListener('click', function(event) {
            // verifica se o elemento clicado ou elemento pai tem a classe "div-musica"
            const divMusica = event.target.closest('.div-musica');

            if (divMusica) {
                // obtem o id da div do elemento clicado
                const id = divMusica.id;
                // armazena o id e altera para pagina de edição
                localStorage.setItem('musicID', id);
                window.location.href = 'musica_editar.html';
            }
        });
    }

    // BOTÃO EDITAR MÚSICA
    let btnEditar = document.getElementById('btnEditarMsc');
    // se clicar no botão de editar, vai rodar a função editarMusica
    if (btnEditar) {
        btnEditar.addEventListener('click', editarMusica);
    }

    // BOTÃO DELETAR MÚSICA
    let btnDeletar = document.getElementById('btnDelMsc');
    // se clicar no botão de editar, vai rodar a função deletarMusica
    if (btnDeletar) {
        btnDeletar.addEventListener('click', deletarMusica);
    }

    // BOTÃO VOLTAR MUSICA
    let btnVoltar = document.getElementById('btnVoltar');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', function(){
            window.location.href = 'musica_listar.html';
        });
    }

    // BOTÃO PAGINA ADICIONAR MUSICA
    let btnAddMusic = document.getElementById('addMusic');
    if (btnAddMusic) {
        btnAddMusic.addEventListener('click', function(){
            window.location.href = 'musica_adicionar.html';
        });
    }

    // BOTÃO ADICIONAR MÚSICA
    let btnAddMsc = document.getElementById('btnAddMsc');
    if (btnAddMsc) {
        btnAddMsc.addEventListener('click', adicionarMusica);
    }

    // ACESSAR UM USUARIO CLICANDO NELE
    let containerUser = document.getElementById('container-user');
    // verifica se foi clicado no container de usuario
    if (containerUser) {
        containerUser.addEventListener('click', function(event) {
            // se clicado no botão de editar usuario
            if (event.target.classList.contains('btn-editar')) {
                // pega o id da div ancestral
                let divAncestral = event.target.closest('.div-users');
                if (divAncestral) {
                    // armazena o id
                    let divId = divAncestral.id;
                    // salva em local storage
                    localStorage.setItem('userID', divId);
                    // passa para pagina de editar usuario
                    window.location.href = 'user_editar.html';
                }
            }
            // se clicado no botão de excluir
            else if (event.target.classList.contains('btn-excluir')) {
                console.log('Clicado no botão de excluir');
                // pega o id da div ancestral
                let divAncestral = event.target.closest('.div-users');
                if (divAncestral) {
                    // armazena o id
                    let divId = divAncestral.id;
                    // passa o id para exclusão
                    this.addEventListener('click', deletarUsuario(divId));
                }
            }
        });
    }


    // BOTÃO VOLTAR USUARIO
    let btnVoltarUser = document.getElementById('btnVoltarUser');
    if (btnVoltarUser) {
        btnVoltarUser.addEventListener('click', function(){
            window.location.href = 'user_listar.html';
        });
    }

    // BOTÃO ADICIONAR USUARIO
    let btnAddUser = document.getElementById('btnAddUser');
    if (btnAddUser) {
        btnAddUser.addEventListener('click', adicionarUsuario);
    }

    // BOTÃO PAGINA ADICIONAR USUARIO
    let btnAddUsuario = document.getElementById('addUser');
    if (btnAddUsuario) {
        btnAddUsuario.addEventListener('click', function(){
            window.location.href = 'user_adicionar.html';
        });
    }

    // BOTÃO EDITAR USUARIO
    let btnEditarUser = document.getElementById('btnEditarUser');
    // se clicar no botão de editar, vai rodar a função editarMusica
    if (btnEditarUser) {
        btnEditarUser.addEventListener('click', editarUsuario);
    }

});
