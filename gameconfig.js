
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
                    peca.inverter()
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
            
            while(atual != null) {
                let pecasAndadas = 0;
                const pecaCasa = atual.peca;

                //* Inserir logo no início
                if(atual === this.inicio) {
                    const pontaEsquerda = pecaCasa.esquerda;

                    if(peca.direita == pontaEsquerda || peca.esquerda === pontaEsquerda){
                        if(peca.esquerda === pontaEsquerda){
                            peca.inverter()
                        }

                        novaCasa.proximo = this.inicio;
                        this.inicio.anterior = novaCasa;
                        this.inicio = novaCasa;
                        this.tamanho ++;

                        return 2
                    }

                }

                //* Inserir no meio em caso de carroça
                else if(pecaCasa.isCarroca() && atual !== this.inicio && this.fim){
                    if(peca.esquerda === pecaCasa.esquerda || peca.direita === pecaCasa.esquerda){
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
                            peca.inverter()
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

        return 0;

    }

    incluirDoFim(peca){
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
            const pontaDireita = this.inicio.peca.direita;

            if(peca.direita === pontaDireita || peca.esquerda === pontaDireita) {
                if(peca.direita === pontaDireita) {
                    peca.inverter()
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
            
            while(atual != null) {
                let pecasAndadas = 0;
                const pecaCasa = atual.peca;

                //* Inserir logo no fim
                if(atual === this.fim) {
                    const pontaDireita = pecaCasa.direita;

                    if(peca.direita == pontaDireita || peca.esquerda === pontaDireita){
                        if(peca.direita === pontaDireita){
                            peca.inverter()
                        }

                        novaCasa.anterior = this.fim;
                        this.fim.proximo = novaCasa;
                        this.fim = novaCasa;
                        this.tamanho ++;

                        return 2
                    }

                }

                //* Inserir no meio em caso de carroça
                else if(pecaCasa.isCarroca() && atual !== this.inicio && atual !== this.fim){
                    if(peca.esquerda === pecaCasa.esquerda || peca.direita === pecaCasa.esquerda){
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

                    if(peca.esquerda == pontaEsquerda || peca.direita === pontaDireita){
                        if(peca.esquerda === pontaEsquerda){
                            peca.inverter()
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

        return 0;

    }

    
}

function createPecas(){
    const valores = Object.values(CabecaPeca);
    let pilhaPecas = []

    for (let i = 0; i < valores.length; i++) {
        for (let j = i; j < valores.length; j++) {
            let novaPeca = new Peca(valores[i], valores[j])
            pilhaPecas.push()
        }
    }

    return pilhaPecas
}

class Jogador {
    constructor(nome){
        this.nome = nome
        this.pontuacao = 0
    }
}


class BurrinhoInteligente {
    constructor(nomeJogador1, nomeJogador2){
        this.pecas = createPecas();
        this.tabuleiro = new Tabuleiro();
        this.jogador1 = new Jogador(nomeJogador1);
        this.jogador2 = new Jogador(nomeJogador2)
    }

    tirarPeca(){
        let indice = Math.floor(Math.random() * this.pecas.length);
        return this.pecas.splice(indice, 1)[0];
    }

    jogar(){
        while(this.pecas.length > 0){
            pecaAtual = this.tirarPeca();

            
        }
    }


}