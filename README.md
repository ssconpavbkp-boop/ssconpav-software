# SSCONPAV · Software (escritório)

Sistema de acompanhamento de execução de serviços da SSCONPAV Construtora — base do sistema Funchal, com interface estilo macOS (mesa, janelas e dock).

- `sistema.html` — o sistema inteiro, em um arquivo só. Publicado em GitHub Pages: `https://ssconpavbkp-boop.github.io/ssconpav-software/sistema.html`
- `index.html` — só redireciona para `sistema.html`.
- `versao-sistema.json` — versão publicada; o sistema aberto compara com a sua e avisa quando há uma nova. Mude `systemVersion` junto com `SYSTEM_VERSION` dentro de `sistema.html` a cada publicação.
- `supabase_ssconpav.sql` — cria a tabela `ssconpav_registros` e o bucket `ssconpav-fotos` no projeto Supabase da SSCONPAV.

Primeiro acesso: usuário `ssconpav`, senha `Ssconpav` (perfil Gestor). Troque a senha em Equipes e Funcionários → Usuários.

Nuvem: URL e chave publishable do projeto SSCONPAV ficam em `const SYNC_PADRAO` dentro de `sistema.html` (e podem ser trocadas em Configurações → Sincronização).
