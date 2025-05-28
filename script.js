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
const semanaAtual = getWeekNumber(hoje);

function abrirImagem(setor, ponto) {
  setorAtual = setor; pontoAtual = ponto; imagemAtual = null; ultimoToken++;
  verificarEmptyOuBuscar(ultimoToken);
}

function verificarEmptyOuBuscar(token) {
  const emptyPath = `pontos/${setorAtual}${pontoAtual}/empty.jpg`;
  const emptyTest = new window.Image();
  emptyTest.onload = function() {
    if (token !== ultimoToken) return;
    document.getElementById('setorImagem').src = emptyPath;
    document.getElementById('setorImagem').alt = 'Imagem não disponível';
    document.getElementById('navButtons').style.display = 'none';
    document.getElementById('legendaImagem').textContent = 'Nenhuma imagem encontrada';
  };
  emptyTest.onerror = function() {
    if (token !== ultimoToken) return;
    buscarPrimeiraImagem(semanaAtual, token);
  };
  emptyTest.src = emptyPath;
}

function buscarPrimeiraImagem(numero, token) {
  if (numero < 22) {
    document.getElementById('setorImagem').src = '';
    document.getElementById('setorImagem').alt = 'Imagem não disponível';
    document.getElementById('navButtons').style.display = 'none';
    document.getElementById('legendaImagem').textContent = 'Nenhuma imagem encontrada';
    return;
  }

  const caminho = `pontos/${setorAtual}${pontoAtual}/w${numero}.jpg`;
  const teste = new window.Image();
  teste.onload = function() {
    if (token !== ultimoToken) return;
    imagemAtual = numero;
    exibirImagemAtual();
    document.getElementById('navButtons').style.display = 'flex';
  };
  teste.onerror = function() {
    if (token !== ultimoToken) return;
    buscarPrimeiraImagem(numero - 1, token);
  };
  teste.src = caminho;
}

function exibirImagemAtual() {
  const caminho = `pontos/${setorAtual}${pontoAtual}/w${imagemAtual}.jpg`;
  document.getElementById('setorImagem').src = caminho;
  document.getElementById('setorImagem').alt = `Ponto ${pontoAtual} do Setor ${setorAtual.toUpperCase()} - w${imagemAtual}`;
  document.getElementById('legendaImagem').textContent = `SETOR ${setorAtual.toUpperCase()} - PONTO ${pontoAtual} - SEMANA ${imagemAtual}`;
}

function navegarImagem(direcao) {
  if (imagemAtual === null) return;
  const proximoNumero = imagemAtual + direcao;
  if (proximoNumero < 22 || proximoNumero > 99) return;
  verificarImagem(proximoNumero, direcao, ultimoToken);
}

function verificarImagem(numero, direcao, token) {
  const caminho = `pontos/${setorAtual}${pontoAtual}/w${numero}.jpg`;
  const teste = new window.Image();
  teste.onload = function() {
    if (token !== ultimoToken) return;
    imagemAtual = numero;
    exibirImagemAtual();
  };
  teste.onerror = function() {
    if (token !== ultimoToken) return;
    verificarImagem(numero + direcao, direcao, token);
  };
  teste.src = caminho;
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
