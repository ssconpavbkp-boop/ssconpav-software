/* Preload roda ANTES dos scripts do sistema.html -- é aqui que window.TESTE_CASCA
   precisa existir, porque a própria tela lê isso já na primeira função que roda. */
const { ipcRenderer } = require('electron');

let status = { versao: '?', conteudo: 'instalador' };
try {
  status = ipcRenderer.sendSync('pedir-status-casca') || status;
} catch (e) { /* mantém o padrão acima se o processo principal não responder */ }

window.TESTE_CASCA = status;
/* a tela chama isto para a casca baixar a versão nova e recarregar na hora */
window.TESTE_CASCA.atualizar = () => ipcRenderer.send('atualizar-sistema');
