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
let imagemAtual = null, setorAtual = null, pontoAtual = null, botaoSelecionado = null, ultimoToken = 0;

function trocarImagem(setor, botao) {
  if (setorAtual === setor) return;
  if (botaoSelecionado) botaoSelecionado.classList.remove('ativo');
  botao.classList.add('ativo'); botaoSelecionado = botao;
  setorAtual = setor; pontoAtual = null; imagemAtual = null;
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

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}
const hoje = new Date();
const semanaAtualReal = getWeekNumber(hoje);
let semanaAtual = null;
let imagensSemanaAtual = [];
let indiceImagemSemanaAtual = 0;

function abrirImagem(setor, ponto) {
  setorAtual = setor;
  pontoAtual = ponto;
  imagemAtual = null;
  ultimoToken++;
  buscarUltimaSemanaComImagem(semanaAtualReal, ultimoToken);
}

function buscarUltimaSemanaComImagem(semana, token) {
  if (semana < 22) {
    document.getElementById('setorImagem').src = '';
    document.getElementById('setorImagem').alt = 'Imagem não disponível';
    document.getElementById('navButtons').style.display = 'none';
    document.getElementById('legendaImagem').textContent = 'Nenhuma imagem encontrada';
    return;
  }

  carregarImagensDaSemana(semana, (encontrou) => {
    if (token !== ultimoToken) return;
    if (encontrou) {
      exibirImagemAtual();
      document.getElementById('navButtons').style.display = 'flex';
    } else {
      buscarUltimaSemanaComImagem(semana - 1, token);
    }
  });
}

// 🔧 Função modificada para otimização
function carregarImagensDaSemana(semana, callback) {
  if (semana < 22 || semana > 99) {
    callback(false);
    return;
  }

  const caminhoSemSufixo = `pontos/${setorAtual}${pontoAtual}/w${semana}.jpg`;
  const img = new Image();
  img.onload = () => {
    imagensSemanaAtual = [caminhoSemSufixo];
    semanaAtual = semana;
    indiceImagemSemanaAtual = 0;
    callback(true);
  };
  img.onerror = () => {
    // Tenta as versões com sufixo apenas se a sem sufixo não existir
    const sufixos = ['a', 'b'];
    const encontrados = [];
    let carregados = 0;

    sufixos.forEach(sufixo => {
      const caminho = `pontos/${setorAtual}${pontoAtual}/w${semana}${sufixo}.jpg`;
      const imgSuf = new Image();
      imgSuf.onload = () => {
        encontrados.push(caminho);
        carregados++;
        if (carregados === sufixos.length) finalizar();
      };
      imgSuf.onerror = () => {
        carregados++;
        if (carregados === sufixos.length) finalizar();
      };
      imgSuf.src = caminho;
    });

    function finalizar() {
      if (encontrados.length > 0) {
        encontrados.sort(); // garante ordem: a, b
        imagensSemanaAtual = encontrados;
        semanaAtual = semana;
        indiceImagemSemanaAtual = imagensSemanaAtual.length - 1;
        callback(true);
      } else {
        callback(false);
      }
    }
  };
  img.src = caminhoSemSufixo;
}

function exibirImagemAtual() {
  const caminho = imagensSemanaAtual[indiceImagemSemanaAtual];
  const nome = caminho.split('/').pop().replace('.jpg', '');
  imagemAtual = nome;
  document.getElementById('setorImagem').src = caminho;
  document.getElementById('setorImagem').alt = `Ponto ${pontoAtual} do Setor ${setorAtual.toUpperCase()} - ${nome}`;
  document.getElementById('legendaImagem').textContent = `SETOR ${setorAtual.toUpperCase()} - PONTO ${pontoAtual} - SEMANA ${nome}`;
}

function navegarImagem(direcao) {
  if (imagemAtual === null) return;
  if ((direcao === -1 && indiceImagemSemanaAtual > 0) || (direcao === 1 && indiceImagemSemanaAtual < imagensSemanaAtual.length - 1)) {
    indiceImagemSemanaAtual += direcao;
    exibirImagemAtual();
  } else {
    buscarNovaSemana(semanaAtual + direcao, direcao, ultimoToken);
  }
}

function buscarNovaSemana(semana, direcao, token) {
  if (semana < 22 || semana > 99) return;

  carregarImagensDaSemana(semana, (encontrou) => {
    if (token !== ultimoToken || !encontrou) return;
    indiceImagemSemanaAtual = (direcao === 1) ? 0 : imagensSemanaAtual.length - 1;
    exibirImagemAtual();
  });
}

window.onload = function() {
  document.getElementById("appContent").style.display = "none";
  document.getElementById("loginPage").style.display = "flex";
  const botaoA = document.getElementById('setorA');
  botaoA.classList.add('ativo');
  botaoSelecionado = botaoA;
  setorAtual = 'a';
  document.getElementById('setorImagem').src = `setores/a.png`;
  document.getElementById('setorImagem').alt = `Imagem do Setor A`;
  gerarPontos('a');
};
