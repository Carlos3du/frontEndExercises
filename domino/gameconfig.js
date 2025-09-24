
const CabecaPeca = {
  BRANCO: 0,
  PIO: 1,
  DUQUE: 2,
  TERNO: 3,
  QUADRA: 4,
  QUINA: 5,
  SENA: 6
};


class Peca {
    constructor(esquerda, direita) {
        this.esquerda = esquerda;
        this.direita = direita
    }

    inverter(){
        const temp = this.esquerda;
        this.esquerda = this.direita;
        this.direita = temp
    }

    eCarroca(){
        return this.esquerda === this.direita
    }
}

class CasaTabuleiro {
    constructor(peca = null, proximo = null, anterior = null) {
        this.peca = peca;
        this.proximo = proximo;
        this.anterior = anterior
    }
}

class Tabuleiro {
    constructor() {
        this.inicio = null;
        this.fim = null;
        this.tamanho = 0
    }


    incluirDoInicio(peca) {
        const novaCasa = new CasaTabuleiro(peca)

        //* Nenhuma peça
        if(this.tamanho === 0) {
            this.inicio = novaCasa;
            this.fim = novaCasa;
            this.tamanho ++;

            return 0
        }

        //* Uma peça
        else if(this.tamanho === 1){
            const pontaEsquerda = this.inicio.peca.esquerda;

            if(peca.direita === pontaEsquerda || peca.esquerda === pontaEsquerda) {
                if(peca.esquerda === pontaEsquerda) {
                    novaCasa.peca.inverter()
                }

                novaCasa.proximo = this.inicio;
                this.inicio.anterior = novaCasa;
                this.inicio = novaCasa;
                this.tamanho ++;

                return 1;
            }

        }

        //* Mais de uma peça (percorrer o tabuleiro)
        else{
            let atual = this.inicio;
            let pecasAndadas = 0;

            while(atual != null) {
                const pecaCasa = atual.peca;

                //* Inserir logo no início
                if(atual === this.inicio) {
                    const pontaEsquerda = pecaCasa.esquerda;

                    if(peca.direita == pontaEsquerda || peca.esquerda === pontaEsquerda){
                        if(peca.esquerda === pontaEsquerda){
                            novaCasa.peca.inverter()
                        }

                        novaCasa.proximo = this.inicio;
                        this.inicio.anterior = novaCasa;
                        this.inicio = novaCasa;
                        this.tamanho ++;
                        
                        return 2
                    }

                }

                //* Inserir no meio em caso de carroça
                else if(pecaCasa.eCarroca() && atual !== this.inicio && atual !== this.fim){
                    if(peca.esquerda === pecaCasa.esquerda && peca.direita === pecaCasa.direita){
                        const casaSeguinte = atual.proximo;

                        novaCasa.proximo = casaSeguinte;
                        novaCasa.anterior = atual;

                        atual.proximo = novaCasa;
                        casaSeguinte.anterior = novaCasa;

                        this.tamanho ++;

                        return (this.tamanho - pecasAndadas - 1)


                    }
                }

                //* Inserir no fim
                else if(atual === this.fim) {
                    const pontaDireita = pecaCasa.direita;

                    if(peca.esquerda == pontaDireita || peca.direita === pontaDireita){
                        if(peca.direita === pontaDireita){
                            novaCasa.peca.inverter()
                        }

                        this.fim.proximo = novaCasa;
                        novaCasa.anterior = this.fim;
                        this.fim = novaCasa;
                        this.tamanho++;
                        
                        return 1
                    }

                }
                atual = atual.proximo;
                pecasAndadas++
            }
        }

        return -1;
    }

    incluirDoFim(peca){
        let novaCasa = new CasaTabuleiro(peca)

        //* Nenhuma peça
        if(this.tamanho === 0) {
            this.inicio = novaCasa;
            this.fim = novaCasa;
            this.tamanho ++;

            return 0
        }

        //* Uma peça
        else if(this.tamanho === 1){
            const pontaDireita = this.inicio.peca.direita;

            if(peca.direita === pontaDireita || peca.esquerda === pontaDireita) {
                if(peca.direita === pontaDireita) {
                    novaCasa.peca.inverter()
                }

                novaCasa.anterior = this.inicio;
                this.inicio.proximo = novaCasa;
                this.fim = novaCasa;
                this.tamanho ++;

                return 1;
            }

        }

        //* Mais de uma peça (percorrer o tabuleiro)
        else{
            let atual = this.fim;
            let pecasAndadas = 0;

            while(atual != null) {    
                const pecaCasa = atual.peca;

                //* Inserir logo no fim
                if(atual === this.fim) {
                    const pontaDireita = pecaCasa.direita;

                    if(peca.direita == pontaDireita || peca.esquerda === pontaDireita){
                        if(peca.direita === pontaDireita){
                            novaCasa.peca.inverter()
                        }

                        novaCasa.anterior = this.fim;
                        this.fim.proximo = novaCasa;
                        this.fim = novaCasa;
                        this.tamanho ++;
                        
                        return 2
                    }

                }

                //* Inserir no meio em caso de carroça
                else if(pecaCasa.eCarroca() && atual !== this.inicio && atual !== this.fim){
                    if(peca.esquerda === pecaCasa.esquerda && peca.direita === pecaCasa.direita){
                        const casaSeguinte = atual.proximo;

                        novaCasa.proximo = casaSeguinte;
                        novaCasa.anterior = atual;

                        atual.proximo = novaCasa;
                        casaSeguinte.anterior = novaCasa;

                        this.tamanho ++;
                        
                        return (this.tamanho - pecasAndadas - 1)


                    }
                }

                //* Inserir no inicio
                else if(atual === this.inicio) {
                    const pontaEsquerda = pecaCasa.esquerda;

                    if(peca.esquerda == pontaEsquerda || peca.direita === pontaEsquerda){
                        if(peca.esquerda === pontaEsquerda){
                            novaCasa.peca.inverter()
                        }

                        this.inicio.anterior = novaCasa;
                        novaCasa.proximo = this.inicio;
                        this.inicio = novaCasa;
                        this.tamanho++;
                        
                        return 1
                    }

                }

                atual = atual.anterior;
                pecasAndadas++

            }
        }

        return -1;
    }
}



function createPecas(pilhaPecas){
    const valores = Object.values(CabecaPeca);

    for (let i = 0; i < valores.length; i++) {
        for (let j = i; j < valores.length; j++) {
            let novaPeca = new Peca(valores[i], valores[j])
            pilhaPecas.push(novaPeca)
        }
    }
}

function checarPeca(tabuleiro, peca) {
    const novaCasa = new CasaTabuleiro(peca)

    if(tabuleiro.tamanho === 0) {
        return true
    }

    else if(tabuleiro.tamanho === 1){
        const pontaEsquerda = tabuleiro.inicio.peca.esquerda;
        if(peca.direita === pontaEsquerda || peca.esquerda === pontaEsquerda) {
            return true
        }

    }

    else{
        let atual = tabuleiro.inicio;
        while(atual != null) {
            const pecaCasa = atual.peca;

            if(atual === tabuleiro.inicio) {
                const pontaEsquerda = pecaCasa.esquerda;

                if(peca.direita == pontaEsquerda || peca.esquerda === pontaEsquerda){
                    return true
                }

            }

            else if(pecaCasa.eCarroca() && atual !== tabuleiro.inicio && atual !== tabuleiro.fim){
                if(peca.esquerda === pecaCasa.esquerda && peca.direita === pecaCasa.direita){
                    return true
                }
            }

            else if(atual === tabuleiro.fim) {
                const pontaDireita = pecaCasa.direita;

                if(peca.esquerda == pontaDireita || peca.direita === pontaDireita){
                    return true
                }

            }
            atual = atual.proximo;
        }
    }
    return false
}

class Jogador {
    constructor(nome){
        this.nome = nome
        this.pontuacao = 0
    }
}


class BurrinhoInteligente {
    constructor(nomeJogador1 = "Jogador 1", nomeJogador2 = "Jogador 2"){
        this.pecas = [];
        this.tabuleiro = new Tabuleiro();
        this.jogador1 = new Jogador(nomeJogador1);
        this.jogador2 = new Jogador(nomeJogador2)
    }

    exibirPlacar(){
        console.log("\n|========== PLACAR =============|\n| Jogador 1: " + this.jogador1.pontuacao +
            "\n| Jogador 2: " + this.jogador2.pontuacao + "\n|===============================|\n"
        )
    }

    mostrarTabuleiro(){
        if(this.tabuleiro.tamanho !== 0){
            let atual = this.tabuleiro.inicio;
            let linhaPecas = ""
        
            while(atual != null){
                linhaPecas += `|${atual.peca.esquerda}|${atual.peca.direita}|  `
                atual = atual.proximo;
            }
            console.log(linhaPecas)
        }
    }

    tirarPeca(){
        let indice = Math.floor(Math.random() * this.pecas.length);
        let retirada =  this.pecas[indice];
        this.pecas = this.pecas.filter((_, i) => i !== indice);
        console.log("Peca tirada: |" + retirada.esquerda + "|" + retirada.direita + "|");
        return retirada
    }

    definirJogador(rodada){
        if(rodada % 2 === 0){
            return this.jogador2;
        }
        else{
            return this.jogador1;
        }
    }

    verificarJogoFechou(){
        for(let i=0; i < this.pecas.length; i++){
            let pecaSelecionada = this.pecas[i];

            let retorno = checarPeca(this.tabuleiro, pecaSelecionada)
            if(retorno === true){
                return false
            }
        }

        return true
    }

    jogarSimulacao(){
        createPecas(this.pecas);

        console.log("\nJOGANDO NO MODO SIMULACAO")
        let rodada = 1;
        let pontuacao = 0;
        
        while(this.pecas.length > 0){
            if(this.verificarJogoFechou() === true){
                console.log("\n-------------------------------------------\nJogo fechou")
                this.mostrarTabuleiro();
                this.exibirPlacar();
                return -1
            }

            console.log("-------------------------------------------");
            console.log("\nRodada " + rodada + "\n");
            this.mostrarTabuleiro();

            let jogadorVez = this.definirJogador(rodada);
            console.log("\nVez de " + jogadorVez.nome);

            let pecaAtual = this.tirarPeca();
            let lugarPeca = Math.floor(Math.random() * 2) + 1;
            
 

            if(lugarPeca === 1){
                console.log("\nJogando a partir do inicio do tabuleiro...")
                pontuacao = this.tabuleiro.incluirDoInicio(pecaAtual)
            }
            else{
                console.log("\nJogando a partir do inicio do tabuleiro...")
                pontuacao = this.tabuleiro.incluirDoFim(pecaAtual)
            }

            //* Se nao colocar a peça, retorna para a pilha
            if(pontuacao === -1){
                console.log("Peca nao inserida...")
                console.log("Pecas restantes: " + (this.pecas.length));
                this.pecas.push(pecaAtual)
            }
            else{
                console.log("Pontuacao obtida: " + pontuacao)
                console.log("Pecas restantes: " + (this.pecas.length));
                jogadorVez.pontuacao += pontuacao;
            }
            
            this.exibirPlacar();
            
            rodada++;
        }

        console.log("-------------------------------------------\nFim de jogo")
    }


}


jogoSimulado = new BurrinhoInteligente()
jogoSimulado.jogarSimulacao()



