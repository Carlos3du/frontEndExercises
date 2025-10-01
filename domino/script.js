
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


class BurrinhoInteligente {
    constructor(nomeJogador1 = "Jogador 1", nomeJogador2 = "Jogador 2") {
        this.jogador1 = new Jogador(nomeJogador1);
        this.jogador2 = new Jogador(nomeJogador2);
        this.modo = null;
        this.dom = {
            secaoConfiguracao: document.getElementById('secao-configuracao'),
            areaJogoPrincipal: document.getElementById('area-jogo-principal'),
            numRodadas: document.getElementById('num-rodadas'),
            btnIniciarJogo: document.getElementById('btn-iniciar-jogo'),
            btnNovaPartida: document.getElementById('btn-nova-partida'),
            placar: { pontos1: document.getElementById('pontos-jogador1'), pontos2: document.getElementById('pontos-jogador2') },
            mensagemVez: document.getElementById('mensagem-vez'),
            pecasRestantes: document.getElementById('pecas-restantes'),
            controlesJogador: document.getElementById('controles-jogador'),
            fasePuxar: document.getElementById('fase-puxar'),
            faseJogar: document.getElementById('fase-jogar'),
            btnPuxarPeca: document.getElementById('btn-puxar-peca'),
            pecaAtual: document.getElementById('peca-atual'),
            btnJogarInicio: document.getElementById('btn-jogar-inicio'),
            btnJogarFim: document.getElementById('btn-jogar-fim'),
            tabuleiro: document.getElementById('tabuleiro'),
            montePecas: document.getElementById('monte-pecas'),
            tabelaJogadasBody: document.getElementById('tabela-jogadas-body'),
        };
        
        this.pecaAtualJogador = null; 
        this.vincularEventos();
    }

    iniciarJogo() {
        const numRodadas = parseInt(this.dom.numRodadas.value);
        
        if (!numRodadas || numRodadas < 1 || numRodadas > 100) {
            this.mostrarErro('Por favor, insira um número válido de rodadas (1-100).');
            return;
        }
        
        this.maxRodadas = numRodadas;
        this.modo = 'jogador';
        this.pecas = createPecas();
        this.tabuleiro = new Tabuleiro();
        this.jogador1.pontuacao = 0;
        this.jogador2.pontuacao = 0;
        this.rodada = 1;
        
        this.dom.secaoConfiguracao.classList.add('hidden');
        this.dom.areaJogoPrincipal.classList.remove('hidden');
        
        this.dom.tabelaJogadasBody.innerHTML = '';
        this.adicionarJogadaNaTabela('--', '--', { esquerda: '--', direita: '--' }, `Jogo iniciado - ${this.maxRodadas} rodadas`, '--');
        this.atualizarInterface();
        this.prepararTurnoJogador();
    }

    vincularEventos() {
        this.dom.btnIniciarJogo.addEventListener('click', () => this.iniciarJogo());
        this.dom.btnNovaPartida.addEventListener('click', () => this.novaPartida());
        this.dom.btnPuxarPeca.addEventListener('click', () => this.puxarPeca());
        this.dom.btnJogarInicio.addEventListener('click', () => this.jogarPeca('inicio'));
        this.dom.btnJogarFim.addEventListener('click', () => this.jogarPeca('fim'));
        
        this.dom.numRodadas.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.iniciarJogo();
            }
        });
        
        this.dom.numRodadas.addEventListener('input', (e) => {
            const valor = parseInt(e.target.value);
            if (valor < 1) e.target.value = 1;
            if (valor > 100) e.target.value = 100;
        });
    }
    
    novaPartida() {
        this.dom.areaJogoPrincipal.classList.add('hidden');
        this.dom.secaoConfiguracao.classList.remove('hidden');
        this.dom.controlesJogador.classList.add('hidden');
    }
    
    mostrarErro(mensagem) {
        const alertaAnterior = document.querySelector('.alerta-erro');
        if (alertaAnterior) {
            alertaAnterior.remove();
        }
        
        const alerta = document.createElement('div');
        alerta.className = 'alerta-erro';
        alerta.innerHTML = `<span>⚠️ ${mensagem}</span>`;
        
        const cardConfiguracao = document.getElementById('card-configuracao');
        cardConfiguracao.insertBefore(alerta, cardConfiguracao.firstChild);
        
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.remove();
            }
        }, 5000);
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
        
        this.atualizarMontePecas();
    }

    atualizarMontePecas() {
        this.dom.montePecas.innerHTML = '';
        
        const pecasOrdenadas = [...this.pecas].sort((a, b) => {
            if (a.esquerda !== b.esquerda) {
                return a.esquerda - b.esquerda;
            }
            return a.direita - b.direita;
        });
        
        pecasOrdenadas.forEach(peca => {
            const pecaDiv = document.createElement('div');
            pecaDiv.className = 'peca-monte';
            pecaDiv.innerHTML = `<span class="peca-valor">${peca.esquerda}</span><span class="peca-valor">${peca.direita}</span>`;
            this.dom.montePecas.appendChild(pecaDiv);
        });
    }

    adicionarJogadaNaTabela(rodada, jogador, peca, direcao, pontos) {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${rodada}</td>
            <td>${jogador}</td>
            <td>|${peca.esquerda}|${peca.direita}|</td>
            <td>${direcao}</td>
            <td>${pontos}</td>
        `;
        this.dom.tabelaJogadasBody.appendChild(linha);
    }

    prepararTurnoJogador() {
        if (this.verificarFimDeJogo()) return;
        
        const jogadorVez = this.definirJogador();
        this.dom.mensagemVez.textContent = `É a vez de ${jogadorVez.nome}!`;
        
        this.dom.controlesJogador.classList.remove('hidden');
        this.dom.fasePuxar.classList.remove('hidden');
        this.dom.faseJogar.classList.add('hidden');
        this.pecaAtualJogador = null;
    }
    
    puxarPeca() {
        if (this.pecas.length === 0) {
            this.verificarFimDeJogo();
            return;
        }
        
        const indice = Math.floor(Math.random() * this.pecas.length);
        this.pecaAtualJogador = this.pecas.splice(indice, 1)[0];
        
        this.dom.pecaAtual.innerHTML = `
            <div class="peca-puxada">
                <span class="peca-valor">${this.pecaAtualJogador.esquerda}</span>
                <span class="peca-valor">${this.pecaAtualJogador.direita}</span>
            </div>
        `;
        
        this.dom.fasePuxar.classList.add('hidden');
        this.dom.faseJogar.classList.remove('hidden');
        
        this.atualizarInterface();
    }
    
    jogarPeca(preferencia) {
        if (!this.pecaAtualJogador) return;
        
        const jogadorVez = this.definirJogador();
        let resultado = null;
        
        if (preferencia === 'inicio') {
            resultado = this.tabuleiro.tentarNoInicio(this.pecaAtualJogador) || 
                        this.tabuleiro.tentarNoMeio(this.pecaAtualJogador) || 
                        this.tabuleiro.tentarNoFim(this.pecaAtualJogador);
        } else { // preferencia === 'fim'
            resultado = this.tabuleiro.tentarNoFim(this.pecaAtualJogador) || 
                        this.tabuleiro.tentarNoMeio(this.pecaAtualJogador) || 
                        this.tabuleiro.tentarNoInicio(this.pecaAtualJogador);
        }
        
        if (resultado) {
            jogadorVez.pontuacao += resultado.pontuacao;
            
            const direcaoEscolhida = preferencia === 'inicio' ? 'Início' : 'Final';
            this.adicionarJogadaNaTabela(this.rodada, jogadorVez.nome, this.pecaAtualJogador, direcaoEscolhida, resultado.pontuacao);
        } else {
            this.pecas.push(this.pecaAtualJogador);
            
            const direcaoEscolhida = preferencia === 'inicio' ? 'Início' : 'Final';
            this.adicionarJogadaNaTabela(this.rodada, jogadorVez.nome, this.pecaAtualJogador, `${direcaoEscolhida} (Não encaixou)`, 0);
        }
        
        this.rodada++;
        this.atualizarInterface();
        
        this.dom.controlesJogador.classList.add('hidden');
        this.pecaAtualJogador = null;
        
        if (!this.verificarFimDeJogo()) {
            setTimeout(() => this.prepararTurnoJogador(), 1000);
        }
    }

    definirJogador() {
        return (this.rodada % 2 !== 0) ? this.jogador1 : this.jogador2;
    }

    verificarFimDeJogo() {
        if (this.maxRodadas && this.rodada > this.maxRodadas) {
            this.encerrarJogo(`Limite de ${this.maxRodadas} rodadas atingido.`);
            return true;
        }
        
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
        let vencedor = "";
        if (this.jogador1.pontuacao > this.jogador2.pontuacao) {
            vencedor = `${this.jogador1.nome} venceu!`;
        } else if (this.jogador2.pontuacao > this.jogador1.pontuacao) {
            vencedor = `${this.jogador2.nome} venceu!`;
        } else {
            vencedor = "O jogo empatou!";
        }
        
        this.adicionarJogadaNaTabela('--', 'RESULTADO', { esquerda: '--', direita: '--' }, motivo, '--');
        this.adicionarJogadaNaTabela('--', 'VENCEDOR', { esquerda: '--', direita: '--' }, vencedor, '--');
        
        this.dom.mensagemVez.textContent = "Fim de Jogo!";
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
            jogadorVez.pontuacao += resultado.pontuacao;
            
            const direcaoEscolhida = preferencia === 'inicio' ? 'Início' : 'Final';
            this.adicionarJogadaNaTabela(this.rodada, jogadorVez.nome, pecaAtual, direcaoEscolhida, resultado.pontuacao);
        } else {
            this.pecas.push(pecaAtual);
            
            const direcaoEscolhida = preferencia === 'inicio' ? 'Início' : 'Final';
            this.adicionarJogadaNaTabela(this.rodada, jogadorVez.nome, pecaAtual, `${direcaoEscolhida} (Não encaixou)`, 0);
        }
        
        this.rodada++;
        this.atualizarInterface();
    }

    prepararTurnoJogador() {
        if (this.verificarFimDeJogo()) return;
        
        const jogadorVez = this.definirJogador();
        this.dom.mensagemVez.textContent = `É a vez de ${jogadorVez.nome}!`;
        
        this.dom.controlesJogador.classList.remove('hidden');
        this.dom.fasePuxar.classList.remove('hidden');
        this.dom.faseJogar.classList.add('hidden');
        this.pecaAtualJogador = null;
    }
    
    puxarPeca() {
        if (this.pecas.length === 0) {
            this.verificarFimDeJogo();
            return;
        }
        
        const indice = Math.floor(Math.random() * this.pecas.length);
        this.pecaAtualJogador = this.pecas.splice(indice, 1)[0];
        
        this.dom.pecaAtual.innerHTML = `
            <div class="peca-puxada">
                <span class="peca-valor">${this.pecaAtualJogador.esquerda}</span>
                <span class="peca-valor">${this.pecaAtualJogador.direita}</span>
            </div>
        `;
        
        this.dom.fasePuxar.classList.add('hidden');
        this.dom.faseJogar.classList.remove('hidden');
        
        this.atualizarInterface();
    }
    
    jogarPeca(preferencia) {
        if (!this.pecaAtualJogador) return;
        
        const jogadorVez = this.definirJogador();
        let resultado = null;
        
        if (preferencia === 'inicio') {
            resultado = this.tabuleiro.tentarNoInicio(this.pecaAtualJogador) || 
                        this.tabuleiro.tentarNoMeio(this.pecaAtualJogador) || 
                        this.tabuleiro.tentarNoFim(this.pecaAtualJogador);
        } else { // preferencia === 'fim'
            resultado = this.tabuleiro.tentarNoFim(this.pecaAtualJogador) || 
                        this.tabuleiro.tentarNoMeio(this.pecaAtualJogador) || 
                        this.tabuleiro.tentarNoInicio(this.pecaAtualJogador);
        }
        
        if (resultado) {
            jogadorVez.pontuacao += resultado.pontuacao;
            
            const direcaoEscolhida = preferencia === 'inicio' ? 'Início' : 'Final';
            this.adicionarJogadaNaTabela(this.rodada, jogadorVez.nome, this.pecaAtualJogador, direcaoEscolhida, resultado.pontuacao);
        } else {
            this.pecas.push(this.pecaAtualJogador);
            
            const direcaoEscolhida = preferencia === 'inicio' ? 'Início' : 'Final';
            this.adicionarJogadaNaTabela(this.rodada, jogadorVez.nome, this.pecaAtualJogador, `${direcaoEscolhida} (Não encaixou)`, 0);
        }
        
        this.rodada++;
        this.atualizarInterface();
        
        this.dom.controlesJogador.classList.add('hidden');
        this.pecaAtualJogador = null;
        
        if (!this.verificarFimDeJogo()) {
            setTimeout(() => this.prepararTurnoJogador(), 1000);
        }
    }
}

const jogo = new BurrinhoInteligente();
