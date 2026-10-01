const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

const CANAL = 'https://ssconpavbkp-boop.github.io/ssconpav-software/';
const PROGRAMA_VERSAO = require('./package.json').version;

const pastaDados = () => app.getPath('userData');
const arquivoSistema = () => path.join(pastaDados(), 'sistema.html');
const arquivoStatus  = () => path.join(pastaDados(), 'casca-status.json');

function baixarTexto(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'cache-control': 'no-cache' } }, (res) => {
      if (res.statusCode !== 200) { reject(new Error('HTTP ' + res.statusCode)); return; }
      let dados = '';
      res.on('data', (c) => dados += c);
      res.on('end', () => resolve(dados));
    }).on('error', reject);
  });
}

function versaoEmbutida(html) {
  const m = /SYSTEM_VERSION\s*=\s*'([^']+)'/.exec(html);
  return m ? m[1] : null;
}

/** Garante que existe um sistema.html na pasta de dados do usuário (a
 *  primeira vez, copia o que veio dentro do instalador) e tenta trazer uma
 *  versão mais nova da publicação. Sempre grava um status.json que o
 *  preload lê antes da tela carregar -- é como o TESTE_CASCA chega ao HTML. */
async function prepararSistema() {
  if (!fs.existsSync(pastaDados())) fs.mkdirSync(pastaDados(), { recursive: true });

  let conteudo = 'instalador';
  if (!fs.existsSync(arquivoSistema())) {
    const origem = path.join(__dirname, 'www', 'sistema.html');
    fs.copyFileSync(origem, arquivoSistema());
  } else {
    conteudo = 'instalador';
    const status = lerStatus();
    if (status && status.conteudo === 'atualizado') conteudo = 'atualizado';
  }

  try {
    const publicado = await baixarTexto(CANAL + 'versao-sistema.json?t=' + Date.now());
    const versaoPublicada = JSON.parse(publicado).systemVersion;
    const atual = versaoEmbutida(fs.readFileSync(arquivoSistema(), 'utf8'));
    if (versaoPublicada && versaoPublicada !== atual) {
      const htmlNovo = await baixarTexto(CANAL + 'sistema.html?t=' + Date.now());
      if (versaoEmbutida(htmlNovo)) {
        fs.writeFileSync(arquivoSistema(), htmlNovo, 'utf8');
        conteudo = 'atualizado';
      }
    }
  } catch (e) {
    console.warn('Sem nuvem para procurar atualização agora:', e.message);
    /* Sem internet ou GitHub Pages fora do ar -- segue com o que já tem local. */
  }

  fs.writeFileSync(arquivoStatus(), JSON.stringify({ versao: PROGRAMA_VERSAO, conteudo }), 'utf8');
}

function lerStatus() {
  try { return JSON.parse(fs.readFileSync(arquivoStatus(), 'utf8')); }
  catch (e) { return null; }
}

async function criarJanela() {
  await prepararSistema();

  const win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    title: 'SSCONPAV',
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: false,
    },
  });
  win.setMenuBarVisibility(false);
  win.loadFile(arquivoSistema());
}

ipcMain.on('pedir-status-casca', (event) => {
  event.returnValue = lerStatus() || { versao: PROGRAMA_VERSAO, conteudo: 'instalador' };
});

/* A tela pede isto quando descobre uma versão publicada mais nova e a pessoa
   está parada na Mesa: baixa o sistema.html novo e recarrega a janela -- sem
   fechar o programa, sem instalar nada. */
let atualizando = false;
ipcMain.on('atualizar-sistema', async (event) => {
  if (atualizando) return;
  atualizando = true;
  try {
    await prepararSistema();
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.loadFile(arquivoSistema());
  } catch (e) {
    console.warn('Não deu para atualizar agora:', e.message);
  } finally { atualizando = false; }
});

app.whenReady().then(() => {
  criarJanela();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) criarJanela();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
