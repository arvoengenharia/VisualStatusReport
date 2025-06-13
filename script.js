// Login
const senhaHash = "8199b228676aa754234f6be42dfe1def9589dcb784a934592fd290b386d4ac64";

document.getElementById("loginForm").addEventListener("submit", function(e){
  e.preventDefault();
  const senha = document.getElementById("senhaInput").value.trim();
  document.getElementById("loginError").textContent = "";
  const hashDigitado = CryptoJS.SHA256(senha).toString(CryptoJS.enc.Hex);
  if (hashDigitado === senhaHash) {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("appContent").style.display = "flex";
    setTimeout(()=>{document.getElementById("senhaInput").value = "";}, 200);
  } else {
    document.getElementById("loginError").textContent = "Senha incorreta.";
  }
});
document.getElementById("appContent").style.display = "none";

// Sistema principal
const pontosSetores = { a: 13, b: 4, c: 8, d: 9 };
let setorAtual = null, pontoAtual = null, botaoSelecionado = null, ultimoToken = 0;

// Variáveis para navegação de imagens com a nova lógica
let semanaAtual = null;
let imagensSemanaAtual = [];
let indiceImagemSemanaAtual = 0;

function trocarImagem(setor, botao) {
  if (setorAtual === setor) return;
  if (botaoSelecionado) botaoSelecionado.classList.remove('ativo');
  botao.classList.add('ativo'); botaoSelecionado = botao;
  setorAtual = setor; pontoAtual = null; semanaAtual = null; imagensSemanaAtual = []; indiceImagemSemanaAtual = 0;
  document.getElementById('setorImagem').src = `setores/${setor}.png`;
  document.getElementById('setorImagem').alt = `Imagem do Setor ${setor.toUpperCase()}`;
  document.getElementById('legendaImagem').textContent = '';
  document.getElementById('navButtons').style.display = 'none';
  gerarPontos(setor);
}

function gerarPontos(setor) {
  const container = document.getElementById('pontosContainer');
  container.innerHTML = '';
  document.getElementById('tituloPontos').style.display = 'block';
  for (let i = 1; i <= pontosSetores[setor]; i++) {
    const ponto = document.createElement('div');
    ponto.classList.add('ponto');
    ponto.innerText = i;
    ponto.onclick = () => {
      document.querySelectorAll('.ponto').forEach(p => p.classList.remove('ativo'));
      ponto.classList.add('ativo');
      abrirImagem(setor, i);
    };
    container.appendChild(ponto);
  }
}

// Função para obter o número da semana do ano
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}
const hoje = new Date();
const semanaReferencia = getWeekNumber(hoje);

// Função que carrega imagens da semana conforme lógica: tenta sem sufixo, se não houver tenta com sufixos 'a' e 'b'
function carregarImagensDaSemana(semana, callback) {
  if (semana < 22 || semana > 99) {
    callback(false);
    return;
  }
  const caminhoSemSufixo = `pontos/${setorAtual}${pontoAtual}/w${semana}.jpg`;
  const imgSemSufixo = new Image();
  imgSemSufixo.onload = () => {
    // Imagem sem sufixo existe, só ela será usada
    imagensSemanaAtual = [caminhoSemSufixo];
    semanaAtual = semana;
    indiceImagemSemanaAtual = 0;
    callback(true);
  };
  imgSemSufixo.onerror = () => {
    // Tentar versões com sufixos 'a' e 'b'
    const sufixos = ['a', 'b'];
    let imagensEncontradas = [];
    let carregados = 0;

    sufixos.forEach(sufixo => {
      const caminho = `pontos/${setorAtual}${pontoAtual}/w${semana}${sufixo}.jpg`;
      const img = new Image();
      img.onload = () => {
        imagensEncontradas.push(caminho);
        carregados++;
        if (carregados === sufixos.length) finalizar();
      };
      img.onerror = () => {
        carregados++;
        if (carregados === sufixos.length) finalizar();
      };
      img.src = caminho;
    });

    function finalizar() {
      if (imagensEncontradas.length > 0) {
        imagensEncontradas.sort(); // ordena a, depois b
        imagensSemanaAtual = imagensEncontradas;
        semanaAtual = semana;
        // Começar pelo último índice (b se existir, depois a)
        indiceImagemSemanaAtual = imagensSemanaAtual.length - 1;
        callback(true);
      } else {
        callback(false);
      }
    }
  };
  imgSemSufixo.src = caminhoSemSufixo;
}

function exibirImagemAtual() {
  if (!imagensSemanaAtual.length) return;
  const caminho = imagensSemanaAtual[indiceImagemSemanaAtual];
  const regex = /w(\d+)([ab]?)\.jpg$/;
  const match = caminho.match(regex);
  let semanaStr = match ? match[1] : '';
  let sufixo = match ? match[2] : '';
  const sufixoDisplay = sufixo ? sufixo.toUpperCase() : '';

  document.getElementById('setorImagem').src = caminho;
  document.getElementById('setorImagem').alt = `Ponto ${pontoAtual} do Setor ${setorAtual.toUpperCase()} - w${semanaStr}${sufixo}`;
  document.getElementById('legendaImagem').textContent = `SETOR ${setorAtual.toUpperCase()} - PONTO ${pontoAtual} - SEMANA ${semanaStr}${sufixoDisplay}`;
  document.getElementById('navButtons').style.display = 'flex';
}

// Navegação entre imagens, direcao: -1 para voltar, +1 para avançar
function navegarImagem(direcao) {
  if (semanaAtual === null) return;

  indiceImagemSemanaAtual += direcao;

  if (indiceImagemSemanaAtual < 0) {
    // ir para semana anterior
    carregarImagensDaSemana(semanaAtual - 1, (achou) => {
      if (achou) {
        indiceImagemSemanaAtual = imagensSemanaAtual.length - 1;
        exibirImagemAtual();
      } else {
        // não encontrou semana anterior, mantém índice
        indiceImagemSemanaAtual = 0;
      }
    });
  } else if (indiceImagemSemanaAtual >= imagensSemanaAtual.length) {
    // ir para próxima semana
    carregarImagensDaSemana(semanaAtual + 1, (achou) => {
      if (achou) {
        indiceImagemSemanaAtual = 0;
        exibirImagemAtual();
      } else {
        indiceImagemSemanaAtual = imagensSemanaAtual.length - 1;
      }
    });
  } else {
    exibirImagemAtual();
  }
}

// Abrir imagem ao clicar no ponto
function abrirImagem(setor, ponto) {
  setorAtual = setor;
  pontoAtual = ponto;
  ultimoToken++;
  const tokenAtual = ultimoToken;
  let tentativaSemana = 99; // começar pelo maior número possível

  function tentarBuscarSemana() {
    if (tentativaSemana < 22) {
      if (tokenAtual !== ultimoToken) return;
      document.getElementById('setorImagem').src = '';
      document.getElementById('legendaImagem').textContent = 'Nenhuma imagem encontrada';
      document.getElementById('navButtons').style.display = 'none';
      return;
    }
    carregarImagensDaSemana(tentativaSemana, (achou) => {
      if (tokenAtual !== ultimoToken) return;
      if (achou) {
        exibirImagemAtual();
      } else {
        tentativaSemana--;
        tentarBuscarSemana();
      }
    });
  }
  tentarBuscarSemana();
}

window.onload = function() {
  document.getElementById("appContent").style.display = "none";
  document.getElementById("loginPage").style.display = "flex";
  const botaoA = document.getElementById('setorA');
  botaoA.classList.add('ativo');
  botaoSelecionado = botaoA;
  setorAtual = 'a';
  document.getElementById('setorImagem').src = 'setores/a.png';
  document.getElementById('setorImagem').alt = 'Imagem do Setor A';
  gerarPontos('a');
};
