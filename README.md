# Currículo online — Gustavo Cardoso

Site pessoal publicado em **[gustavomaxcardoso.github.io](https://gustavomaxcardoso.github.io)**.

Feito à mão em HTML, CSS e JavaScript, sem framework e sem etapa de build. O GitHub Pages serve os arquivos como estão (o `.nojekyll` desativa o Jekyll).

## O que tem no site

- **Topologia animada** da rede que administro: escritório central e 7 lojas, com o tráfego de sincronização do ERP e das ferramentas internas.
- **Diagrama interativo do HUB Fazfarma**: escolha um fluxo (login, abrir ferramenta, carregar tela) e veja o caminho da requisição entre Nginx, React, FastAPI e PostgreSQL.
- Projetos, experiência, habilidades, formação e contato, com download dos currículos em PDF.
- Modo escuro automático, layout para celular, navegação por teclado e respeito à preferência de reduzir animações.

As cores seguem os pares do padrão de cabeamento T568B (laranja, verde, azul e marrom), cada uma marcando uma área: desenvolvimento, dados e ERP, infraestrutura e suporte.

## Estrutura

```
index.html                 página única
assets/css/style.css       estilos e temas claro/escuro
assets/js/main.js          animação da topologia e diagrama do HUB
assets/favicon.svg         ícone da aba (com versões PNG ao lado)
assets/cv/                 currículos em PDF
assets/documents/          diploma
images/                    foto de perfil e grade da pós
```

## Rodar localmente

Qualquer servidor estático funciona:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Contato

- LinkedIn: [linkedin.com/in/gustavo-mcardoso](https://www.linkedin.com/in/gustavo-mcardoso)
- E-mail: [guhh.cardoso1@gmail.com](mailto:guhh.cardoso1@gmail.com)
- GitHub: [@GustavoMaxCardoso](https://github.com/GustavoMaxCardoso)
