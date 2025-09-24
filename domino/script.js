// --- LÓGICA DO JOGO ---

const CabecaPeca = {
    BRANCO: 0, PIO: 1, DUQUE: 2, TERNO: 3, QUADRA: 4, QUINA: 5, SENA: 6
};

class Peca {
    constructor(esquerda, direita) {
        this.esquerda = esquerda;
        this.direita = direita;
    }
    inverter() {
        const temp = this.esquerda;
        this.esquerda = this.direita;
        this.direita = temp;
    }
}

class CasaTabuleiro {
    constructor(peca = null, proximo = null, anterior = null) {
        this.peca = peca;
        this.proximo = proximo;
        this.anterior = anterior;
    }
}

class Tabuleiro {
    constructor() {
        this.inicio = null;
        this.fim = null;
        this.tamanho = 0;
    }
    
    clone() {
        const novoTabuleiro = new Tabuleiro();
        let atual = this.inicio;
        while (atual) {
            const novaPeca = new Peca(atual.peca.esquerda, atual.peca.direita);
            const novaCasa = new CasaTabuleiro(novaPeca);
            if (novoTabuleiro.tamanho === 0) {
                novoTabuleiro.inicio = novoTabuleiro.fim = novaCasa;
            } else {
                novaCasa.anterior = novoTabuleiro.fim;
                novoTabuleiro.fim.proximo = novaCasa;
                novoTabuleiro.fim = novaCasa;
            }
            novoTabuleiro.tamanho++;
            atual = atual.proximo;
        }
        return novoTabuleiro;
    }

    // ##### MÉTODOS DE JOGADA CORRIGIDOS #####

    // Estes métodos agora trabalham com cópias da peça para evitar bugs
    // e a lógica da primeira peça foi corrigida.
    
    tentarNoInicio(peca) {
        const pecaCopia = new Peca(peca.esquerda, peca.direita);
        if (this.tamanho === 0) {
            const novaCasa = new CasaTabuleiro(pecaCopia);
            this.inicio = this.fim = novaCasa;
            this.tamanho++;
            return { pontuacao: 0, local: 'início' };
        }
        const pontaEsquerda = this.inicio.peca.esquerda;
        if (pecaCopia.esquerda === pontaEsquerda || pecaCopia.direita === pontaEsquerda) {
            if (pecaCopia.esquerda === pontaEsquerda) pecaCopia.inverter();
            const novaCasa = new CasaTabuleiro(pecaCopia);
            novaCasa.proximo = this.inicio;
            this.inicio.anterior = novaCasa;
            this.inicio = novaCasa;
            this.tamanho++;
            return { pontuacao: 2, local: 'início' };
        }
        return null;
    }

    tentarNoFim(peca) {
        if (this.tamanho === 0) {
            // Se o tabuleiro está vazio, jogar no fim é o mesmo que jogar no início.
            return this.tentarNoInicio(peca);
        }
        const pecaCopia = new Peca(peca.esquerda, peca.direita);
        const pontaDireita = this.fim.peca.direita;
        if (pecaCopia.esquerda === pontaDireita || pecaCopia.direita === pontaDireita) {
            if (pecaCopia.direita === pontaDireita) pecaCopia.inverter();
            const novaCasa = new CasaTabuleiro(pecaCopia);
            novaCasa.anterior = this.fim;
            this.fim.proximo = novaCasa;
            this.fim = novaCasa;
            this.tamanho++;
            return { pontuacao: 1, local: 'fim' };
        }
        return null;
    }

    tentarNoMeio(peca) {
        if (this.tamanho <= 1) return null;
        const pecaCopia = new Peca(peca.esquerda, peca.direita);
        let atual = this.inicio;
        let pecasAndadas = 0;
        while (atual && atual.proximo) {
            const pecaSeguinte = atual.proximo;
            if ((pecaCopia.esquerda === atual.peca.direita && pecaCopia.direita === pecaSeguinte.peca.esquerda) ||
                (pecaCopia.direita === atual.peca.direita && pecaCopia.esquerda === pecaSeguinte.peca.esquerda)) {
                if (pecaCopia.direita === atual.peca.direita) pecaCopia.inverter();
                const novaCasa = new CasaTabuleiro(pecaCopia);
                novaCasa.anterior = atual;
                novaCasa.proximo = pecaSeguinte;
                atual.proximo = novaCasa;
                pecaSeguinte.anterior = novaCasa;
                this.tamanho++;
                return { pontuacao: this.tamanho - pecasAndadas - 1, local: 'meio' };
            }
            atual = atual.proximo;
            pecasAndadas++;
        }
        return null;
    }
}

function createPecas() {
    const pilhaPecas = [];
    const valores = Object.values(CabecaPeca);
    for (let i = 0; i < valores.length; i++) {
        for (let j = i; j < valores.length; j++) {
            pilhaPecas.push(new Peca(valores[i], valores[j]));
        }
    }
    return pilhaPecas;
}

class Jogador {
    constructor(nome) {
        this.nome = nome;
        this.pontuacao = 0;
    }
}

// --- CONTROLE DA INTERFACE E DO JOGO ---

class BurrinhoInteligente {
    constructor(nomeJogador1 = "Jogador 1", nomeJogador2 = "Jogador 2") {
        this.jogador1 = new Jogador(nomeJogador1);
        this.jogador2 = new Jogador(nomeJogador2);
        this.modo = null;
        this.intervaloSimulacao = null;
        this.dom = {
            btnSimulacao: document.getElementById('btn-simulacao'),
            btnJogador: document.getElementById('btn-jogador'),
            placar: { pontos1: document.getElementById('pontos-jogador1'), pontos2: document.getElementById('pontos-jogador2') },
            mensagemVez: document.getElementById('mensagem-vez'),
            pecasRestantes: document.getElementById('pecas-restantes'),
            controlesJogador: document.getElementById('controles-jogador'),
            btnJogarInicio: document.getElementById('btn-jogar-inicio'),
            btnJogarFim: document.getElementById('btn-jogar-fim'),
            tabuleiro: document.getElementById('tabuleiro'),
            logJogo: document.getElementById('log-jogo'),
        };
        this.vincularEventos();
    }

    iniciarJogo(modo) {
        clearInterval(this.intervaloSimulacao);
        this.modo = modo;
        this.pecas = createPecas();
        this.tabuleiro = new Tabuleiro();
        this.jogador1.pontuacao = 0;
        this.jogador2.pontuacao = 0;
        this.rodada = 1;
        this.dom.btnSimulacao.disabled = true;
        this.dom.btnJogador.disabled = true;
        this.dom.logJogo.innerHTML = '';
        this.adicionarLog("Jogo iniciado no modo: " + modo);
        this.atualizarInterface();
        if (this.modo === 'simulacao') {
            this.jogarSimulacao();
        } else {
            this.prepararTurnoJogador();
        }
    }

    vincularEventos() {
        this.dom.btnSimulacao.addEventListener('click', () => this.iniciarJogo('simulacao'));
        this.dom.btnJogador.addEventListener('click', () => this.iniciarJogo('jogador'));
    }
    
     atualizarInterface() {
        this.dom.placar.pontos1.textContent = this.jogador1.pontuacao;
        this.dom.placar.pontos2.textContent = this.jogador2.pontuacao;
        this.dom.pecasRestantes.textContent = this.pecas.length;
        this.dom.tabuleiro.innerHTML = '';
        let atual = this.tabuleiro.inicio;
        while (atual != null) {
            const pecaDiv = document.createElement('div');
            pecaDiv.className = 'peca';
            pecaDiv.innerHTML = `<span class="peca-valor">${atual.peca.esquerda}</span><span class="peca-valor">${atual.peca.direita}</span>`;
            this.dom.tabuleiro.appendChild(pecaDiv);
            atual = atual.proximo;
        }
    }

    adicionarLog(mensagem) {
        this.dom.logJogo.innerHTML += `<p>${mensagem}</p>`;
        this.dom.logJogo.scrollTop = this.dom.logJogo.scrollHeight;
    }

    definirJogador() {
        return (this.rodada % 2 !== 0) ? this.jogador1 : this.jogador2;
    }

    verificarFimDeJogo() {
        if (this.pecas.length === 0) {
            this.encerrarJogo("Todas as peças foram jogadas.");
            return true;
        }
        let jogadaPossivel = false;
        for (const peca of this.pecas) {
            const tabuleiroTeste = this.tabuleiro.clone();
            if (tabuleiroTeste.tentarNoInicio(peca) || tabuleiroTeste.tentarNoFim(peca) || tabuleiroTeste.tentarNoMeio(peca)) {
                jogadaPossivel = true;
                break;
            }
        }
        if (!jogadaPossivel) {
            this.encerrarJogo("Jogo fechado! Nenhuma peça restante pode ser jogada.");
            return true;
        }
        return false;
    }
    
     encerrarJogo(motivo) {
        clearInterval(this.intervaloSimulacao);
        this.adicionarLog(`---------------- FIM DE JOGO ----------------`);
        this.adicionarLog(motivo);
        let vencedor = "";
        if (this.jogador1.pontuacao > this.jogador2.pontuacao) {
            vencedor = `${this.jogador1.nome} venceu!`;
        } else if (this.jogador2.pontuacao > this.jogador1.pontuacao) {
            vencedor = `${this.jogador2.nome} venceu!`;
        } else {
            vencedor = "O jogo empatou!";
        }
        this.adicionarLog(vencedor);
        this.dom.mensagemVez.textContent = "Fim de Jogo!";
        this.dom.btnSimulacao.disabled = false;
        this.dom.btnJogador.disabled = false;
        this.dom.controlesJogador.classList.add('hidden');
    }

    executarTurno(preferencia) {
        if (this.verificarFimDeJogo()) return;
        const jogadorVez = this.definirJogador();
        const indice = Math.floor(Math.random() * this.pecas.length);
        const pecaAtual = this.pecas.splice(indice, 1)[0];
        
        let resultado = null;

        if (preferencia === 'inicio') {
            resultado = this.tabuleiro.tentarNoInicio(pecaAtual) || 
                        this.tabuleiro.tentarNoMeio(pecaAtual) || 
                        this.tabuleiro.tentarNoFim(pecaAtual);
        } else { // preferencia === 'fim'
            resultado = this.tabuleiro.tentarNoFim(pecaAtual) || 
                        this.tabuleiro.tentarNoMeio(pecaAtual) || 
                        this.tabuleiro.tentarNoInicio(pecaAtual);
        }

        if (resultado) {
            this.adicionarLog(`Rodada ${this.rodada}: ${jogadorVez.nome} jogou |${pecaAtual.esquerda}|${pecaAtual.direita}| no ${resultado.local} e ganhou ${resultado.pontuacao} pontos.`);
            jogadorVez.pontuacao += resultado.pontuacao;
        } else {
            this.adicionarLog(`Rodada ${this.rodada}: ${jogadorVez.nome}, a peça |${pecaAtual.esquerda}|${pecaAtual.direita}| não encaixou. A peça voltou para o monte.`);
            this.pecas.push(pecaAtual);
        }
        
        this.rodada++;
        this.atualizarInterface();
    }

    jogarSimulacao() {
        this.intervaloSimulacao = setInterval(() => {
            const preferencia = Math.random() < 0.5 ? 'inicio' : 'fim';
            this.executarTurno(preferencia);
        }, 1000);
    }
    
    prepararTurnoJogador() {
        if (this.verificarFimDeJogo()) return;
        const jogadorVez = this.definirJogador();
        this.dom.mensagemVez.textContent = `É a sua vez, ${jogadorVez.nome}! Escolha onde priorizar a jogada.`;
        this.dom.controlesJogador.classList.remove('hidden');

        const acaoDoBotao = (preferencia) => {
            this.dom.btnJogarInicio.onclick = null;
            this.dom.btnJogarFim.onclick = null;
            this.dom.controlesJogador.classList.add('hidden');
            
            this.executarTurno(preferencia);
            
            if(this.pecas.length > 0 && this.modo === 'jogador') { // Garante que não continue se o jogo acabou
                 setTimeout(() => this.prepararTurnoJogador(), 500);
            }
        };

        this.dom.btnJogarInicio.onclick = () => acaoDoBotao('inicio');
        this.dom.btnJogarFim.onclick = () => acaoDoBotao('fim');
    }
}

// Inicia o controlador do jogo
const jogo = new BurrinhoInteligente();