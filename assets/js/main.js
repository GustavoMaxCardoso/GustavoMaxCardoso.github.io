(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Borda do topo só aparece depois de rolar */
  const bar = document.querySelector('.topbar');
  const onScroll = () => bar.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Topologia: pacotes trafegando entre o escritório e as lojas ----------
     Verde = sincronização do ERP (loja para o escritório)
     Laranja = ferramentas internas (escritório para a loja) */
  const svg = document.querySelector('.topology svg');
  const layer = svg && svg.querySelector('.packets');
  const links = svg ? [...svg.querySelectorAll('.links path')] : [];
  const NS = 'http://www.w3.org/2000/svg';
  let running = false;
  let timer = null;
  const live = new Set();

  function sendPacket() {
    const path = links[Math.floor(Math.random() * links.length)];
    const len = path.getTotalLength();
    const toOffice = Math.random() < 0.62;
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('r', '5');
    dot.setAttribute('class', toOffice ? 'p-green' : 'p-orange');
    layer.appendChild(dot);

    const duration = 1500 + Math.random() * 700;
    const start = performance.now();
    const item = { dot, frame: 0 };
    live.add(item);

    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      // os caminhos começam no escritório; volta ao contrário quando o pacote vem da loja
      const at = toOffice ? len * (1 - eased) : len * eased;
      const p = path.getPointAtLength(at);
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      dot.style.opacity = t < 0.08 ? t / 0.08 : t > 0.9 ? (1 - t) / 0.1 : 1;
      if (t < 1 && running) {
        item.frame = requestAnimationFrame(step);
      } else {
        dot.remove();
        live.delete(item);
      }
    };
    item.frame = requestAnimationFrame(step);
  }

  function loop() {
    if (!running) return;
    sendPacket();
    timer = setTimeout(loop, 380 + Math.random() * 520);
  }

  function startPackets() {
    if (running || !layer || reduceMotion.matches) return;
    running = true;
    loop();
  }

  function stopPackets() {
    running = false;
    clearTimeout(timer);
    live.forEach(({ dot, frame }) => { cancelAnimationFrame(frame); dot.remove(); });
    live.clear();
  }

  if (svg) {
    // espera a sequência de abertura terminar antes do tráfego começar
    const delay = reduceMotion.matches ? 0 : 1500;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !document.hidden) startPackets();
      else stopPackets();
    }, { threshold: 0.15 });
    setTimeout(() => io.observe(svg), delay);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopPackets();
      else if (svg.getBoundingClientRect().bottom > 0) startPackets();
    });
    reduceMotion.addEventListener('change', (e) => { if (e.matches) stopPackets(); });
  }

  /* ---------- Diagrama do HUB: mostra o caminho de cada fluxo ---------- */
  const flows = {
    login: {
      nodes: ['nav', 'nginx', 'api', 'db'],
      edges: ['nav-nginx', 'nginx-api', 'api-db'],
      note: 'O Nginx repassa o pedido para o FastAPI, que confere a senha com Argon2id no PostgreSQL e devolve a sessão num cookie httpOnly assinado.'
    },
    tool: {
      nodes: ['nav', 'nginx', 'api', 'tool'],
      edges: ['nav-nginx', 'nginx-api', 'api-tool'],
      note: 'O FastAPI confere se o perfil tem acesso à ferramenta e gera um token assinado. O FarmaCompare abre já autenticado, sem pedir login de novo.'
    },
    page: {
      nodes: ['nav', 'nginx', 'react'],
      edges: ['nav-nginx', 'nginx-react'],
      note: 'O Nginx entrega a interface em React. Os dados de cada tela vêm depois pela API, que confere a permissão de novo em toda rota.'
    }
  };

  const frame = document.querySelector('.frame');
  if (frame) {
    const buttons = [...frame.querySelectorAll('[data-flow]')];
    const note = frame.querySelector('.arch-note');
    const nodeEls = Object.fromEntries([...frame.querySelectorAll('[data-node]')].map(n => [n.dataset.node, n]));
    const edgeEls = Object.fromEntries([...frame.querySelectorAll('[data-edge]')].map(e => {
      e.style.setProperty('--len', Math.ceil(e.getTotalLength()));
      return [e.dataset.edge, e];
    }));
    let timers = [];

    function play(name) {
      const flow = flows[name];
      timers.forEach(clearTimeout);
      timers = [];
      Object.values(nodeEls).forEach(n => n.classList.remove('on'));
      Object.values(edgeEls).forEach(e => e.classList.remove('on', 'run'));
      buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.flow === name)));
      note.textContent = flow.note;

      const stepTime = reduceMotion.matches ? 0 : 320;
      flow.nodes.forEach((id, i) => {
        timers.push(setTimeout(() => {
          nodeEls[id].classList.add('on');
          const edge = edgeEls[flow.edges[i]];
          if (edge) {
            edge.classList.add('on');
            if (stepTime) {
              edge.classList.remove('run');
              void edge.getBoundingClientRect();
              edge.classList.add('run');
            }
          }
        }, i * stepTime));
      });
    }

    buttons.forEach(b => b.addEventListener('click', () => play(b.dataset.flow)));
  }
})();
