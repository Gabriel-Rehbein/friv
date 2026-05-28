const grid = document.getElementById("grid");
const player = document.getElementById("player");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const search = document.getElementById("search");
const homeBtn = document.getElementById("homeBtn");
const closeBtn = document.getElementById("closeBtn");
const resetBtn = document.getElementById("resetBtn");

const badge = document.getElementById("badge");
const gameTitle = document.getElementById("gameTitle");
const howto = document.getElementById("howto");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");

let current = null;

// ===== Utils =====
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

function setScore(v){
  scoreEl.textContent = String(v);
  if(!current) return;
  const key = `best_${current.id}`;
  const best = Number(localStorage.getItem(key) || 0);
  if(v > best){
    localStorage.setItem(key, String(v));
    bestEl.textContent = String(v);
  }
}
function loadBest(){
  if(!current) return;
  const key = `best_${current.id}`;
  bestEl.textContent = String(Number(localStorage.getItem(key) || 0));
}

function roundRect(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}

// ===== Registry (16 jogos) =====
const games = [
  // 8 antigos
  { id:"snake", title:"Cobrinha", badge:"Clássico", desc:"Coma, cresça e não bata!", tags:["teclado","arcade"],
    howto:"↑ ↓ ← →. Pegue a comida. Não encoste nas bordas/corpo. R reinicia.",
    create:()=>SnakeGame(canvas,ctx)},
  { id:"clickrush", title:"Clique Rápido", badge:"Reflexo", desc:"Clique nos alvos antes de sumirem.", tags:["mouse","tempo"],
    howto:"Clique nos círculos verdes. 30s. Cada acerto = 1.",
    create:()=>ClickRushGame(canvas,ctx)},
  { id:"memory", title:"Memória", badge:"Lógica", desc:"Encontre os pares.", tags:["mouse","memória"],
    howto:"Vire 2 cartas. Se for par, fica aberta. Termine o tabuleiro.",
    create:()=>MemoryGame(canvas,ctx)},
  { id:"pong", title:"Pong", badge:"Arcade", desc:"Raquete vs IA.", tags:["teclado","clássico"],
    howto:"W/S. Pontue quando a bola passar da IA.",
    create:()=>PongGame(canvas,ctx)},
  { id:"runner", title:"Runner", badge:"1 tecla", desc:"Pule obstáculos e sobreviva.", tags:["teclado","infinito"],
    howto:"ESPAÇO / ↑ para pular (ou clique).",
    create:()=>RunnerGame(canvas,ctx)},
  { id:"breakout", title:"Breakout", badge:"Clássico", desc:"Quebre blocos com a bola.", tags:["mouse","arcade"],
    howto:"Mova a barra com o mouse. Não deixe cair.",
    create:()=>BreakoutGame(canvas,ctx)},
  { id:"aim", title:"Aim Trainer", badge:"Mira", desc:"Clique 20 alvos.", tags:["mouse","tempo"],
    howto:"Clique no alvo. 20 alvos. Menor tempo é melhor (aqui o score mostra hits).",
    create:()=>AimTrainerGame(canvas,ctx)},
  { id:"dots", title:"Desvie", badge:"Hard", desc:"Sobreviva desviando.", tags:["teclado","survival"],
    howto:"WASD/Setas. Desvie dos vermelhos. Score = tempo.",
    create:()=>DotsDodgeGame(canvas,ctx)},

  // +8 novos (MUITO MAIS)
  { id:"tictactoe", title:"Jogo da Velha", badge:"Clássico", desc:"X vs O (vs IA simples).", tags:["mouse","lógica"],
    howto:"Clique nas casas. Você é X. IA joga O.",
    create:()=>TicTacToeGame(canvas,ctx)},
  { id:"connect4", title:"Connect 4", badge:"Lógica", desc:"Conecte 4 em linha (vs IA).", tags:["mouse","lógica"],
    howto:"Clique na coluna para soltar. Você é Amarelo. IA é Azul.",
    create:()=>Connect4Game(canvas,ctx)},
  { id:"flappy", title:"Flappy", badge:"Arcade", desc:"Passe pelos canos.", tags:["teclado","arcade"],
    howto:"ESPAÇO / clique para bater as asas. Não encoste nos canos.",
    create:()=>FlappyGame(canvas,ctx)},
  { id:"shooter", title:"Space Shooter", badge:"Arcade", desc:"Atire nos inimigos.", tags:["teclado","ação"],
    howto:"← → / A D para mover. Espaço atira. Score = abates.",
    create:()=>ShooterGame(canvas,ctx)},
  { id:"simon", title:"Simon", badge:"Memória", desc:"Repita a sequência.", tags:["mouse","memória"],
    howto:"Veja a sequência e clique nas cores na ordem. Errou, perde.",
    create:()=>SimonGame(canvas,ctx)},
  { id:"mole", title:"Whack-a-Mole", badge:"Reflexo", desc:"Bata nos alvos!", tags:["mouse","tempo"],
    howto:"Clique no alvo quando aparecer. 30s.",
    create:()=>WhackMoleGame(canvas,ctx)},
  { id:"mathrush", title:"Math Rush", badge:"Rápido", desc:"Conta rápida contra o tempo.", tags:["teclado","tempo"],
    howto:"Resolva e digite o resultado + Enter. 45s.",
    create:()=>MathRushGame(canvas,ctx)},
  { id:"colorcatch", title:"Color Catch", badge:"Arcade", desc:"Pegue as bolas certas.", tags:["teclado","arcade"],
    howto:"← → para mover. Pegue VERDE (+1) e evite VERMELHO (-1). 40s.",
    create:()=>ColorCatchGame(canvas,ctx)},
];

// ===== UI =====
function renderGrid(list){
  grid.innerHTML = "";
  list.forEach(g=>{
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="thumb"></div>
      <div class="body">
        <h4>${g.title}</h4>
        <p>${g.desc}</p>
        <div class="tagrow">${g.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
      </div>`;
    card.addEventListener("click", ()=>openGame(g.id));
    grid.appendChild(card);
  });
}

function openGame(id){
  const g = games.find(x=>x.id===id);
  if(!g) return;

  if(current?.instance?.stop) current.instance.stop();

  current = { ...g, instance: g.create() };
  badge.textContent = g.badge;
  gameTitle.textContent = g.title;
  howto.textContent = g.howto;

  setScore(0);
  loadBest();

  grid.classList.add("hidden");
  player.classList.remove("hidden");

  current.instance.start({ onScore: setScore, onBestRefresh: loadBest });
}

function goHome(){
  if(current?.instance?.stop) current.instance.stop();
  current = null;
  player.classList.add("hidden");
  grid.classList.remove("hidden");
  ctx.clearRect(0,0,canvas.width,canvas.height);
  scoreEl.textContent = "0";
  bestEl.textContent = "0";
}

closeBtn.addEventListener("click", goHome);
homeBtn.addEventListener("click", goHome);
resetBtn.addEventListener("click", ()=>{ if(current) openGame(current.id); });

search.addEventListener("input",(e)=>{
  const q = e.target.value.trim().toLowerCase();
  renderGrid(games.filter(g =>
    g.title.toLowerCase().includes(q) ||
    g.desc.toLowerCase().includes(q) ||
    g.tags.some(t=>t.toLowerCase().includes(q))
  ));
});

renderGrid(games);

// =======================================================
// ======================= GAMES ==========================
// =======================================================

// ===== 1) Snake =====
function SnakeGame(canvas, ctx){
  const W=canvas.width, H=canvas.height, size=16;
  let running=false, loopId=null;
  let dir={x:1,y:0}, nextDir={x:1,y:0};
  let snake, food, score=0, onScore=()=>{};

  function spawnFood(){
    const cols=Math.floor(W/size), rows=Math.floor(H/size);
    while(true){
      const p={x:randInt(0,cols-1), y:randInt(0,rows-1)};
      if(!snake.some(s=>s.x===p.x && s.y===p.y)) return p;
    }
  }
  function reset(){
    snake=[{x:10,y:10}]; dir={x:1,y:0}; nextDir={x:1,y:0};
    food=spawnFood(); score=0;
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.globalAlpha=0.12;
    ctx.beginPath();
    for(let x=0;x<=W;x+=size){ ctx.moveTo(x,0); ctx.lineTo(x,H); }
    for(let y=0;y<=H;y+=size){ ctx.moveTo(0,y); ctx.lineTo(W,y); }
    ctx.strokeStyle="#fff"; ctx.stroke(); ctx.globalAlpha=1;

    ctx.fillStyle="#ff4d6d";
    ctx.fillRect(food.x*size, food.y*size, size, size);

    snake.forEach((p,i)=>{
      ctx.fillStyle = (i===snake.length-1) ? "#45f3c2" : "#6d7dff";
      ctx.fillRect(p.x*size, p.y*size, size, size);
    });

    ctx.fillStyle="rgba(231,236,255,.9)";
    ctx.font="16px system-ui";
    ctx.fillText(`Pontuação: ${score}`, 14, 22);
  }
  function gameOver(){
    running=false; draw();
    ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#e7ecff"; ctx.font="bold 26px system-ui";
    ctx.fillText("Game Over", 14, 54);
    ctx.font="14px system-ui";
    ctx.fillText("R reinicia ou clique Reiniciar.", 14, 78);
  }
  function tick(){
    dir=nextDir;
    const head=snake[snake.length-1];
    const newHead={x:head.x+dir.x, y:head.y+dir.y};
    const cols=Math.floor(W/size), rows=Math.floor(H/size);

    if(newHead.x<0||newHead.y<0||newHead.x>=cols||newHead.y>=rows) return gameOver();
    if(snake.some(p=>p.x===newHead.x && p.y===newHead.y)) return gameOver();

    snake.push(newHead);

    if(newHead.x===food.x && newHead.y===food.y){
      score+=1; onScore(score); food=spawnFood();
    } else snake.shift();

    draw();
    loopId=setTimeout(tick,85);
  }
  function onKey(e){
    const k=e.key.toLowerCase();
    if(k==="r"){ reset(); onScore(0); draw(); if(!running){ running=true; tick(); } return; }
    if(!running) return;
    if(k==="arrowup"&&dir.y!==1) nextDir={x:0,y:-1};
    if(k==="arrowdown"&&dir.y!==-1) nextDir={x:0,y:1};
    if(k==="arrowleft"&&dir.x!==1) nextDir={x:-1,y:0};
    if(k==="arrowright"&&dir.x!==-1) nextDir={x:1,y:0};
  }
  return{
    start({onScore:os}){ onScore=os||onScore; reset(); draw(); running=true; window.addEventListener("keydown",onKey); tick(); },
    stop(){ running=false; if(loopId) clearTimeout(loopId); window.removeEventListener("keydown",onKey); }
  };
}

// ===== 2) Click Rush =====
function ClickRushGame(canvas, ctx){
  const W=canvas.width,H=canvas.height;
  let running=false, raf=null;
  let target=null, score=0, startTime=0;
  const duration=30000;
  let onScore=()=>{};

  function spawn(){
    const r=randInt(18,32);
    target={x:randInt(r+10,W-r-10), y:randInt(r+10,H-r-10), r, life:randInt(700,1100), born:performance.now()};
  }
  function draw(t){
    ctx.clearRect(0,0,W,H);
    const elapsed=t-startTime;
    const left=clamp(duration-elapsed,0,duration);

    ctx.fillStyle="rgba(231,236,255,.9)";
    ctx.font="16px system-ui";
    ctx.fillText(`Tempo: ${(left/1000).toFixed(1)}s`,14,22);
    ctx.fillText(`Pontuação: ${score}`,14,44);

    if(left<=0){
      running=false;
      ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#e7ecff"; ctx.font="bold 26px system-ui";
      ctx.fillText("Fim!",14,54);
      ctx.font="14px system-ui";
      ctx.fillText("Reiniciar para jogar de novo.",14,78);
      return;
    }

    if(!target) spawn();
    const age=t-target.born;
    const p=clamp(age/target.life,0,1);
    const rr=target.r + Math.sin(t/120)*2;

    ctx.globalAlpha=1-p*0.65;
    ctx.beginPath(); ctx.arc(target.x,target.y,rr,0,Math.PI*2);
    ctx.fillStyle="#45f3c2"; ctx.fill();
    ctx.globalAlpha=1;

    ctx.beginPath(); ctx.arc(target.x,target.y,rr+10,0,Math.PI*2);
    ctx.strokeStyle="rgba(109,125,255,.55)"; ctx.lineWidth=3; ctx.stroke();

    if(age>=target.life) spawn();
    raf=requestAnimationFrame(draw);
  }
  function onClick(ev){
    if(!running||!target) return;
    const rect=canvas.getBoundingClientRect();
    const mx=(ev.clientX-rect.left)*(canvas.width/rect.width);
    const my=(ev.clientY-rect.top)*(canvas.height/rect.height);
    const dx=mx-target.x, dy=my-target.y;
    if(Math.sqrt(dx*dx+dy*dy)<=target.r+2){ score+=1; onScore(score); spawn(); }
  }

  return{
    start({onScore:os}){ onScore=os||onScore; score=0; onScore(0); target=null; startTime=performance.now(); running=true; canvas.addEventListener("click",onClick); raf=requestAnimationFrame(draw); },
    stop(){ running=false; if(raf) cancelAnimationFrame(raf); canvas.removeEventListener("click",onClick); }
  };
}

// ===== 3) Memory =====
function MemoryGame(canvas, ctx){
  const W=canvas.width,H=canvas.height;
  const cols=4, rows=3, pad=14;
  let cards=[], first=null, lock=false, score=0;
  let onScore=()=>{};

  function makeDeck(){
    const total=cols*rows, pairs=total/2;
    const values=[];
    for(let i=0;i<pairs;i++) values.push(i,i);
    for(let i=values.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [values[i],values[j]]=[values[j],values[i]];
    }
    const cardW=Math.floor((W-pad*(cols+1))/cols);
    const cardH=Math.floor((H-pad*(rows+1))/rows);

    cards=values.map((v,idx)=>{
      const c=idx%cols, r=Math.floor(idx/cols);
      const x=pad + c*(cardW+pad);
      const y=pad + r*(cardH+pad);
      return {v,x,y,w:cardW,h:cardH,open:false,done:false};
    });
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="rgba(231,236,255,.9)";
    ctx.font="16px system-ui";
    ctx.fillText(`Pares: ${score}`,14,22);

    cards.forEach(card=>{
      ctx.fillStyle="rgba(255,255,255,.04)";
      ctx.strokeStyle="rgba(255,255,255,.10)";
      ctx.lineWidth=2;
      roundRect(ctx,card.x,card.y,card.w,card.h,14); ctx.fill(); ctx.stroke();

      if(card.open||card.done){
        ctx.fillStyle=card.done?"rgba(69,243,194,.18)":"rgba(109,125,255,.16)";
        roundRect(ctx,card.x,card.y,card.w,card.h,14); ctx.fill();

        ctx.fillStyle="rgba(231,236,255,.95)";
        ctx.font="bold 42px system-ui";
        ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText(String(card.v+1), card.x+card.w/2, card.y+card.h/2);
        ctx.textAlign="left"; ctx.textBaseline="alphabetic";
      }else{
        ctx.globalAlpha=0.9;
        ctx.strokeStyle="rgba(109,125,255,.35)";
        ctx.beginPath();
        ctx.moveTo(card.x+10,card.y+10); ctx.lineTo(card.x+card.w-10,card.y+card.h-10);
        ctx.moveTo(card.x+card.w-10,card.y+10); ctx.lineTo(card.x+10,card.y+card.h-10);
        ctx.stroke();
        ctx.globalAlpha=1;
      }
    });

    if(cards.every(c=>c.done)){
      ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#e7ecff"; ctx.font="bold 26px system-ui";
      ctx.fillText("Você venceu!",14,54);
      ctx.font="14px system-ui";
      ctx.fillText("Reiniciar para jogar de novo.",14,78);
    }
  }

  function pick(mx,my){
    return cards.find(c=>mx>=c.x&&mx<=c.x+c.w&&my>=c.y&&my<=c.y+c.h);
  }

  function onClick(ev){
    if(lock) return;
    const rect=canvas.getBoundingClientRect();
    const mx=(ev.clientX-rect.left)*(canvas.width/rect.width);
    const my=(ev.clientY-rect.top)*(canvas.height/rect.height);

    const card=pick(mx,my);
    if(!card||card.done||card.open) return;

    card.open=true; draw();
    if(!first){ first=card; return; }

    if(first.v===card.v){
      first.done=true; card.done=true; first=null;
      score+=1; onScore(score); draw();
    }else{
      lock=true;
      setTimeout(()=>{
        first.open=false; card.open=false; first=null; lock=false; draw();
      },650);
    }
  }

  return{
    start({onScore:os}){ onScore=os||onScore; score=0; onScore(0); first=null; lock=false; makeDeck(); draw(); canvas.addEventListener("click",onClick); },
    stop(){ canvas.removeEventListener("click",onClick); }
  };
}

// ===== 4) Pong =====
function PongGame(canvas, ctx){
  const W=canvas.width,H=canvas.height;
  let raf=null, onScore=()=>{};
  const p1={x:30,y:H/2-55,w:14,h:110,vy:0,score:0};
  const p2={x:W-44,y:H/2-55,w:14,h:110};
  let ball;

  function resetBall(dir=1){ ball={x:W/2,y:H/2,r:9,vx:6*dir,vy:randInt(-4,4)}; }
  function resetAll(){ p1.y=H/2-p1.h/2; p2.y=H/2-p2.h/2; p1.score=0; onScore(0); resetBall(randInt(0,1)?1:-1); }

  function collideRectCircle(rx,ry,rw,rh,cx,cy,cr){
    const x=clamp(cx,rx,rx+rw), y=clamp(cy,ry,ry+rh);
    const dx=cx-x, dy=cy-y;
    return dx*dx+dy*dy<=cr*cr;
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.globalAlpha=0.15;
    for(let y=0;y<H;y+=22){ ctx.fillStyle="#fff"; ctx.fillRect(W/2-2,y,4,12); }
    ctx.globalAlpha=1;

    ctx.fillStyle="#6d7dff"; ctx.fillRect(p1.x,p1.y,p1.w,p1.h);
    ctx.fillStyle="#45f3c2"; ctx.fillRect(p2.x,p2.y,p2.w,p2.h);

    ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);
    ctx.fillStyle="#ff4d6d"; ctx.fill();

    ctx.fillStyle="rgba(231,236,255,.9)";
    ctx.font="16px system-ui";
    ctx.fillText(`Você: ${p1.score}`,14,22);
  }

  function step(){
    p1.y=clamp(p1.y+p1.vy,10,H-p1.h-10);
    const targetY=ball.y-p2.h/2;
    p2.y+=clamp(targetY-p2.y,-5.2,5.2);
    p2.y=clamp(p2.y,10,H-p2.h-10);

    ball.x+=ball.vx; ball.y+=ball.vy;
    if(ball.y-ball.r<=0||ball.y+ball.r>=H) ball.vy*=-1;

    if(collideRectCircle(p1.x,p1.y,p1.w,p1.h,ball.x,ball.y,ball.r)){
      ball.vx=Math.abs(ball.vx);
      const hit=(ball.y-(p1.y+p1.h/2))/(p1.h/2);
      ball.vy=hit*6;
    }
    if(collideRectCircle(p2.x,p2.y,p2.w,p2.h,ball.x,ball.y,ball.r)){
      ball.vx=-Math.abs(ball.vx);
      const hit=(ball.y-(p2.y+p2.h/2))/(p2.h/2);
      ball.vy=hit*6;
    }

    if(ball.x<-30){ resetBall(1); }
    else if(ball.x>W+30){ p1.score+=1; onScore(p1.score); resetBall(-1); }

    draw();
    raf=requestAnimationFrame(step);
  }

  function onKeyDown(e){ const k=e.key.toLowerCase(); if(k==="w") p1.vy=-8; if(k==="s") p1.vy=8; }
  function onKeyUp(e){ const k=e.key.toLowerCase(); if(k==="w"&&p1.vy<0) p1.vy=0; if(k==="s"&&p1.vy>0) p1.vy=0; }

  return{
    start({onScore:os}){ onScore=os||onScore; resetAll(); window.addEventListener("keydown",onKeyDown); window.addEventListener("keyup",onKeyUp); raf=requestAnimationFrame(step); },
    stop(){ if(raf) cancelAnimationFrame(raf); window.removeEventListener("keydown",onKeyDown); window.removeEventListener("keyup",onKeyUp); p1.vy=0; }
  };
}

// ===== 5) Runner =====
function RunnerGame(canvas, ctx){
  const W=canvas.width,H=canvas.height;
  let raf=null, onScore=()=>{}, running=false;
  const groundY=H-90;
  const pl={x:90,y:groundY,w:36,h:54,vy:0,onGround:true};
  let obs=[], speed=6, score=0, lastSpawn=0, startT=0;

  function reset(){
    obs=[]; speed=6; score=0; onScore(0);
    pl.y=groundY; pl.vy=0; pl.onGround=true;
    lastSpawn=0; startT=performance.now();
  }
  function spawn(t){
    const w=randInt(20,34), h=randInt(30,60);
    obs.push({x:W+30,y:groundY+(54-h),w,h});
    lastSpawn=t;
  }
  function collide(a,b){ return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y; }

  function draw(t){
    ctx.clearRect(0,0,W,H);
    ctx.globalAlpha=0.12;
    for(let i=0;i<120;i++) ctx.fillRect((i*71)%W,(i*37)%H,2,2);
    ctx.globalAlpha=1;

    ctx.fillStyle="rgba(255,255,255,.08)"; ctx.fillRect(0,groundY+54,W,2);

    ctx.fillStyle="#45f3c2"; roundRect(ctx,pl.x,pl.y,pl.w,pl.h,10); ctx.fill();
    ctx.fillStyle="#ff4d6d"; obs.forEach(o=>ctx.fillRect(o.x,o.y,o.w,o.h));

    ctx.fillStyle="rgba(231,236,255,.9)"; ctx.font="16px system-ui";
    ctx.fillText(`Score: ${score}`,14,22);
  }

  function gameOver(){
    running=false; draw(performance.now());
    ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#e7ecff"; ctx.font="bold 26px system-ui";
    ctx.fillText("Você perdeu!",14,54);
    ctx.font="14px system-ui";
    ctx.fillText("Reiniciar para tentar de novo.",14,78);
  }

  function step(t){
    if(!running) return;

    pl.vy+=0.8; pl.y+=pl.vy;
    if(pl.y>=groundY){ pl.y=groundY; pl.vy=0; pl.onGround=true; }

    if(t-lastSpawn>randInt(780,1200)) spawn(t);

    obs.forEach(o=>o.x-=speed);
    obs=obs.filter(o=>o.x>-60);

    const newScore=Math.floor((t-startT)/200);
    if(newScore!==score){
      score=newScore; onScore(score);
      speed=6+Math.min(6,score/10);
    }

    const pbox={x:pl.x,y:pl.y,w:pl.w,h:pl.h};
    for(const o of obs){ if(collide(pbox,o)) return gameOver(); }

    draw(t);
    raf=requestAnimationFrame(step);
  }

  function jump(){ if(pl.onGround){ pl.vy=-14.5; pl.onGround=false; } }
  function onKey(e){ const k=e.key.toLowerCase(); if(k===" "||k==="arrowup") jump(); }
  function onClick(){ jump(); }

  return{
    start({onScore:os}){ onScore=os||onScore; reset(); running=true; window.addEventListener("keydown",onKey); canvas.addEventListener("click",onClick); raf=requestAnimationFrame(step); },
    stop(){ running=false; if(raf) cancelAnimationFrame(raf); window.removeEventListener("keydown",onKey); canvas.removeEventListener("click",onClick); }
  };
}

// ===== 6) Breakout =====
function BreakoutGame(canvas, ctx){
  const W=canvas.width,H=canvas.height;
  let raf=null, onScore=()=>{}, running=false;
  const paddle={w:130,h:14,x:W/2-65,y:H-44};
  let ball, bricks=[], score=0;

  function collideRectCircle(rx,ry,rw,rh,cx,cy,cr){
    const x=clamp(cx,rx,rx+rw), y=clamp(cy,ry,ry+rh);
    const dx=cx-x, dy=cy-y;
    return dx*dx+dy*dy<=cr*cr;
  }

  function reset(){
    score=0; onScore(0);
    ball={x:W/2,y:H-90,r:9,vx:6,vy:-6};
    bricks=[];
    const rows=5, cols=10, pad=10, top=60, left=30;
    const bw=Math.floor((W-left*2-pad*(cols-1))/cols), bh=22;
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      bricks.push({x:left+c*(bw+pad), y:top+r*(bh+pad), w:bw, h:bh, alive:true});
    }
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="#45f3c2"; roundRect(ctx,paddle.x,paddle.y,paddle.w,paddle.h,10); ctx.fill();

    ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);
    ctx.fillStyle="#ff4d6d"; ctx.fill();

    bricks.forEach(b=>{ if(b.alive){ ctx.fillStyle="rgba(109,125,255,.85)"; ctx.fillRect(b.x,b.y,b.w,b.h); } });

    ctx.fillStyle="rgba(231,236,255,.9)"; ctx.font="16px system-ui";
    ctx.fillText(`Score: ${score}`,14,22);
  }

  function end(msg){
    running=false; draw();
    ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#e7ecff"; ctx.font="bold 26px system-ui";
    ctx.fillText(msg,14,54);
    ctx.font="14px system-ui";
    ctx.fillText("Reiniciar para jogar de novo.",14,78);
  }

  function step(){
    if(!running) return;

    ball.x+=ball.vx; ball.y+=ball.vy;
    if(ball.x-ball.r<=0||ball.x+ball.r>=W) ball.vx*=-1;
    if(ball.y-ball.r<=0) ball.vy*=-1;

    if(collideRectCircle(paddle.x,paddle.y,paddle.w,paddle.h,ball.x,ball.y,ball.r)){
      ball.vy=-Math.abs(ball.vy);
      const hit=(ball.x-(paddle.x+paddle.w/2))/(paddle.w/2);
      ball.vx=hit*8;
    }

    for(const b of bricks){
      if(!b.alive) continue;
      if(collideRectCircle(b.x,b.y,b.w,b.h,ball.x,ball.y,ball.r)){
        b.alive=false; ball.vy*=-1;
        score+=1; onScore(score);
        break;
      }
    }

    if(ball.y-ball.r>H) return end("Você perdeu!");
    if(bricks.every(b=>!b.alive)) return end("Você venceu!");

    draw();
    raf=requestAnimationFrame(step);
  }

  function onMouseMove(e){
    const rect=canvas.getBoundingClientRect();
    const mx=(e.clientX-rect.left)*(canvas.width/rect.width);
    paddle.x=clamp(mx-paddle.w/2,10,W-paddle.w-10);
  }

  return{
    start({onScore:os}){ onScore=os||onScore; reset(); running=true; canvas.addEventListener("mousemove",onMouseMove); raf=requestAnimationFrame(step); },
    stop(){ running=false; if(raf) cancelAnimationFrame(raf); canvas.removeEventListener("mousemove",onMouseMove); }
  };
}

// ===== 7) Aim Trainer =====
function AimTrainerGame(canvas, ctx){
  const W=canvas.width,H=canvas.height;
  let raf=null, onScore=()=>{}, running=false;
  const total=20;
  let hits=0, startT=0, endT=0, target=null;

  function spawn(){
    const r=randInt(16,30);
    target={x:randInt(r+20,W-r-20), y:randInt(r+30,H-r-20), r};
  }
  function reset(){
    hits=0; onScore(0);
    startT=performance.now(); endT=0; spawn();
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    const now=performance.now();
    const t=endT?endT:now;
    const elapsed=(t-startT)/1000;

    ctx.fillStyle="rgba(231,236,255,.9)";
    ctx.font="16px system-ui";
    ctx.fillText(`Alvos: ${hits}/${total}`,14,22);
    ctx.fillText(`Tempo: ${elapsed.toFixed(2)}s`,14,44);

    if(endT){
      ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#e7ecff"; ctx.font="bold 26px system-ui";
      ctx.fillText("Concluído!",14,54);
      ctx.font="14px system-ui";
      ctx.fillText("Reiniciar para tentar menor tempo.",14,78);
      return;
    }

    ctx.beginPath(); ctx.arc(target.x,target.y,target.r+10,0,Math.PI*2);
    ctx.strokeStyle="rgba(109,125,255,.6)"; ctx.lineWidth=3; ctx.stroke();
    ctx.beginPath(); ctx.arc(target.x,target.y,target.r,0,Math.PI*2);
    ctx.fillStyle="#45f3c2"; ctx.fill();
  }

  function loop(){ if(!running) return; draw(); raf=requestAnimationFrame(loop); }

  function onClick(ev){
    if(endT) return;
    const rect=canvas.getBoundingClientRect();
    const mx=(ev.clientX-rect.left)*(canvas.width/rect.width);
    const my=(ev.clientY-rect.top)*(canvas.height/rect.height);
    const dx=mx-target.x, dy=my-target.y;

    if(Math.sqrt(dx*dx+dy*dy)<=target.r){
      hits+=1; onScore(hits);
      if(hits>=total) endT=performance.now();
      else spawn();
    }
  }

  return{
    start({onScore:os}){ onScore=os||onScore; reset(); running=true; canvas.addEventListener("click",onClick); raf=requestAnimationFrame(loop); },
    stop(){ running=false; if(raf) cancelAnimationFrame(raf); canvas.removeEventListener("click",onClick); }
  };
}

// ===== 8) Dots Dodge =====
function DotsDodgeGame(canvas, ctx){
  const W=canvas.width,H=canvas.height;
  let raf=null, onScore=()=>{}, running=false;
  const pl={x:W/2,y:H/2,r:12,vx:0,vy:0,speed:6};
  let enemies=[], startT=0, score=0;

  function spawnEnemy(i){
    const edge=randInt(0,3);
    let x,y;
    if(edge===0){x=-20;y=randInt(0,H);}
    if(edge===1){x=W+20;y=randInt(0,H);}
    if(edge===2){x=randInt(0,W);y=-20;}
    if(edge===3){x=randInt(0,W);y=H+20;}
    return {x,y,r:randInt(10,16),vx:randInt(-4,4)|| (i%2?3:-3),vy:randInt(-4,4)|| (i%2?-3:3)};
  }
  function reset(){
    pl.x=W/2; pl.y=H/2; pl.vx=0; pl.vy=0;
    enemies=[]; startT=performance.now(); score=0; onScore(0);
    for(let i=0;i<6;i++) enemies.push(spawnEnemy(i));
  }
  function dist(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return Math.sqrt(dx*dx+dy*dy); }
  function draw(){
    ctx.clearRect(0,0,W,H);
    enemies.forEach(e=>{ ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,Math.PI*2); ctx.fillStyle="#ff4d6d"; ctx.fill(); });
    ctx.beginPath(); ctx.arc(pl.x,pl.y,pl.r,0,Math.PI*2); ctx.fillStyle="#45f3c2"; ctx.fill();

    ctx.fillStyle="rgba(231,236,255,.9)";
    ctx.font="16px system-ui";
    ctx.fillText(`Tempo: ${score}s`,14,22);
  }
  function gameOver(){
    running=false; draw();
    ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#e7ecff"; ctx.font="bold 26px system-ui";
    ctx.fillText("Você perdeu!",14,54);
    ctx.font="14px system-ui";
    ctx.fillText("Reiniciar para tentar de novo.",14,78);
  }
  function step(t){
    if(!running) return;
    const s=Math.floor((t-startT)/1000);
    if(s!==score){
      score=s; onScore(score);
      if(score%5===0 && enemies.length<16) enemies.push(spawnEnemy(enemies.length));
    }

    pl.x=clamp(pl.x+pl.vx,pl.r,W-pl.r);
    pl.y=clamp(pl.y+pl.vy,pl.r,H-pl.r);

    enemies.forEach(e=>{
      e.x+=e.vx; e.y+=e.vy;
      if(e.x<e.r||e.x>W-e.r) e.vx*=-1;
      if(e.y<e.r||e.y>H-e.r) e.vy*=-1;
    });

    for(const e of enemies){ if(dist(pl,e)<=pl.r+e.r-2) return gameOver(); }

    draw();
    raf=requestAnimationFrame(step);
  }
  function onKeyDown(e){
    const k=e.key.toLowerCase();
    if(k==="arrowup"||k==="w") pl.vy=-pl.speed;
    if(k==="arrowdown"||k==="s") pl.vy=pl.speed;
    if(k==="arrowleft"||k==="a") pl.vx=-pl.speed;
    if(k==="arrowright"||k==="d") pl.vx=pl.speed;
  }
  function onKeyUp(e){
    const k=e.key.toLowerCase();
    if((k==="arrowup"||k==="w") && pl.vy<0) pl.vy=0;
    if((k==="arrowdown"||k==="s") && pl.vy>0) pl.vy=0;
    if((k==="arrowleft"||k==="a") && pl.vx<0) pl.vx=0;
    if((k==="arrowright"||k==="d") && pl.vx>0) pl.vx=0;
  }
  return{
    start({onScore:os}){ onScore=os||onScore; reset(); running=true; window.addEventListener("keydown",onKeyDown); window.addEventListener("keyup",onKeyUp); raf=requestAnimationFrame(step); },
    stop(){ running=false; if(raf) cancelAnimationFrame(raf); window.removeEventListener("keydown",onKeyDown); window.removeEventListener("keyup",onKeyUp); pl.vx=0; pl.vy=0; }
  };
}

// =======================================================
// ===================== NOVOS 8 ==========================
// =======================================================

// ===== 9) TicTacToe =====
function TicTacToeGame(canvas, ctx){
  const W=canvas.width,H=canvas.height;
  let board, turn, over=false, onScore=()=>{}, score=0;

  function reset(){
    board=Array(9).fill(0); // 0 empty, 1 X, 2 O
    turn=1; over=false; score=0; onScore(0);
    draw();
  }
  function lines(){
    return [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6],
    ];
  }
  function winner(){
    for(const [a,b,c] of lines()){
      if(board[a] && board[a]===board[b] && board[a]===board[c]) return board[a];
    }
    if(board.every(v=>v)) return 3; // draw
    return 0;
  }
  function aiMove(){
    // IA simples: ganha se puder, bloqueia, senão random
    const empty = board.map((v,i)=>v?null:i).filter(v=>v!==null);
    // win
    for(const i of empty){
      board[i]=2; if(winner()===2) return; board[i]=0;
    }
    // block
    for(const i of empty){
      board[i]=1; if(winner()===1){ board[i]=2; return; } board[i]=0;
    }
    board[empty[randInt(0,empty.length-1)]] = 2;
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    const s=Math.min(W,H)*0.7;
    const ox=(W-s)/2, oy=(H-s)/2;
    const cell=s/3;

    ctx.strokeStyle="rgba(255,255,255,.18)";
    ctx.lineWidth=6;
    for(let i=1;i<=2;i++){
      ctx.beginPath(); ctx.moveTo(ox+i*cell,oy); ctx.lineTo(ox+i*cell,oy+s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ox,oy+i*cell); ctx.lineTo(ox+s,oy+i*cell); ctx.stroke();
    }

    for(let i=0;i<9;i++){
      const x=ox+(i%3)*cell, y=oy+Math.floor(i/3)*cell;
      const v=board[i];
      if(v===1){
        ctx.strokeStyle="#45f3c2"; ctx.lineWidth=10;
        ctx.beginPath(); ctx.moveTo(x+30,y+30); ctx.lineTo(x+cell-30,y+cell-30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+cell-30,y+30); ctx.lineTo(x+30,y+cell-30); ctx.stroke();
      } else if(v===2){
        ctx.strokeStyle="#6d7dff"; ctx.lineWidth=10;
        ctx.beginPath(); ctx.arc(x+cell/2,y+cell/2,cell/2-30,0,Math.PI*2); ctx.stroke();
      }
    }

    ctx.fillStyle="rgba(231,236,255,.9)";
    ctx.font="16px system-ui";
    ctx.fillText("Você: X  |  IA: O", 14, 22);

    const w=winner();
    if(w){
      ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#e7ecff"; ctx.font="bold 26px system-ui";
      ctx.fillText(w===1?"Você venceu!":w===2?"IA venceu!":"Empate!", 14, 54);
      ctx.font="14px system-ui";
      ctx.fillText("Reiniciar para jogar novamente.", 14, 78);
    }
  }

  function clickToIndex(mx,my){
    const s=Math.min(W,H)*0.7;
    const ox=(W-s)/2, oy=(H-s)/2;
    const cell=s/3;
    if(mx<ox||mx>ox+s||my<oy||my>oy+s) return -1;
    const cx=Math.floor((mx-ox)/cell);
    const cy=Math.floor((my-oy)/cell);
    return cy*3+cx;
  }

  function onClick(ev){
    if(winner()) return;
    const rect=canvas.getBoundingClientRect();
    const mx=(ev.clientX-rect.left)*(canvas.width/rect.width);
    const my=(ev.clientY-rect.top)*(canvas.height/rect.height);
    const idx=clickToIndex(mx,my);
    if(idx<0||board[idx]) return;

    board[idx]=1; // X
    if(winner()) return draw();

    aiMove();
    // score: vitórias do player como “1”, empates “0”
    const w=winner();
    if(w===1){ score=1; onScore(score); }
    draw();
  }

  return{
    start({onScore:os}){ onScore=os||onScore; reset(); canvas.addEventListener("click",onClick); },
    stop(){ canvas.removeEventListener("click",onClick); }
  };
}

// ===== 10) Connect 4 =====
function Connect4Game(canvas, ctx){
  const W=canvas.width,H=canvas.height;
  const cols=7, rows=6;
  let grid, over=false, onScore=()=>{}, score=0;

  function reset(){
    grid=Array.from({length:rows},()=>Array(cols).fill(0)); // 0 empty, 1 player, 2 ia
    over=false; score=0; onScore(0);
    draw();
  }

  function drop(col, who){
    for(let r=rows-1;r>=0;r--){
      if(!grid[r][col]){ grid[r][col]=who; return true; }
    }
    return false;
  }

  function checkWin(who){
    // horizontal, vertical, diag
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        if(grid[r][c]!==who) continue;
        if(c+3<cols && grid[r][c+1]===who && grid[r][c+2]===who && grid[r][c+3]===who) return true;
        if(r+3<rows && grid[r+1][c]===who && grid[r+2][c]===who && grid[r+3][c]===who) return true;
        if(r+3<rows && c+3<cols && grid[r+1][c+1]===who && grid[r+2][c+2]===who && grid[r+3][c+3]===who) return true;
        if(r+3<rows && c-3>=0 && grid[r+1][c-1]===who && grid[r+2][c-2]===who && grid[r+3][c-3]===who) return true;
      }
    }
    return false;
  }

  function full(){
    return grid[0].every(v=>v!==0);
  }

  function aiMove(){
    // tenta ganhar, tenta bloquear, senão random válido
    const validCols = [...Array(cols)].map((_,i)=>i).filter(c=>grid[0][c]===0);

    // win
    for(const c of validCols){
      const copy=grid.map(r=>r.slice());
      simDrop(copy,c,2);
      if(simWin(copy,2)) return drop(c,2);
    }
    // block
    for(const c of validCols){
      const copy=grid.map(r=>r.slice());
      simDrop(copy,c,1);
      if(simWin(copy,1)) return drop(c,2);
    }
    // center preference
    validCols.sort((a,b)=>Math.abs(a-3)-Math.abs(b-3));
    const pick = validCols[0 + randInt(0, Math.min(2,validCols.length-1))];
    drop(pick,2);
  }

  function simDrop(g,c,w){
    for(let r=rows-1;r>=0;r--){
      if(!g[r][c]){ g[r][c]=w; return true; }
    }
    return false;
  }
  function simWin(g,who){
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        if(g[r][c]!==who) continue;
        if(c+3<cols && g[r][c+1]===who && g[r][c+2]===who && g[r][c+3]===who) return true;
        if(r+3<rows && g[r+1][c]===who && g[r+2][c]===who && g[r+3][c]===who) return true;
        if(r+3<rows && c+3<cols && g[r+1][c+1]===who && g[r+2][c+2]===who && g[r+3][c+3]===who) return true;
        if(r+3<rows && c-3>=0 && g[r+1][c-1]===who && g[r+2][c-2]===who && g[r+3][c-3]===who) return true;
      }
    }
    return false;
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    const bw=Math.min(W*0.9, H*0.9*1.2);
    const bh=bw*(rows/cols);
    const ox=(W-bw)/2, oy=(H-bh)/2;
    const cell=bw/cols;

    // board
    ctx.fillStyle="rgba(255,255,255,.06)";
    roundRect(ctx, ox, oy, bw, bh, 18); ctx.fill();

    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const cx=ox+c*cell + cell/2;
        const cy=oy+r*cell + cell/2;
        ctx.beginPath();
        ctx.arc(cx,cy,cell*0.38,0,Math.PI*2);
        const v=grid[r][c];
        ctx.fillStyle = v===1 ? "#ffd24a" : v===2 ? "#6d7dff" : "rgba(0,0,0,.35)";
        ctx.fill();
      }
    }

    ctx.fillStyle="rgba(231,236,255,.9)";
    ctx.font="16px system-ui";
    ctx.fillText("Você: Amarelo | IA: Azul", 14, 22);

    if(checkWin(1)||checkWin(2)||full()){
      ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#e7ecff"; ctx.font="bold 26px system-ui";
      const msg = checkWin(1) ? "Você venceu!" : checkWin(2) ? "IA venceu!" : "Empate!";
      ctx.fillText(msg, 14, 54);
      ctx.font="14px system-ui";
      ctx.fillText("Reiniciar para jogar novamente.", 14, 78);
    }
  }

  function onClick(ev){
    if(checkWin(1)||checkWin(2)||full()) return;
    const rect=canvas.getBoundingClientRect();
    const mx=(ev.clientX-rect.left)*(canvas.width/rect.width);
    const my=(ev.clientY-rect.top)*(canvas.height/rect.height);

    const bw=Math.min(W*0.9, H*0.9*1.2);
    const bh=bw*(rows/cols);
    const ox=(W-bw)/2, oy=(H-bh)/2;
    const cell=bw/cols;
    if(mx<ox||mx>ox+bw||my<oy||my>oy+bh) return;

    const col=Math.floor((mx-ox)/cell);
    if(!drop(col,1)) return;

    if(checkWin(1)){
      score=1; onScore(score);
      draw(); return;
    }
    if(full()){ draw(); return; }

    aiMove();
    draw();
  }

  return{
    start({onScore:os}){ onScore=os||onScore; reset(); canvas.addEventListener("click",onClick); },
    stop(){ canvas.removeEventListener("click",onClick); }
  };
}

// ===== 11) Flappy =====
function FlappyGame(canvas, ctx){
  const W=canvas.width,H=canvas.height;
  let raf=null, running=false, onScore=()=>{};
  let bird, pipes, score=0;

  function reset(){
    bird={x:W*0.28,y:H/2,vy:0,r:14};
    pipes=[];
    score=0; onScore(0);
  }
  function spawnPipe(){
    const gap=150;
    const top=randInt(60, H-60-gap);
    pipes.push({x:W+40, top, gap, w:70, passed:false});
  }
  function draw(){
    ctx.clearRect(0,0,W,H);

    // bird
    ctx.beginPath(); ctx.arc(bird.x,bird.y,bird.r,0,Math.PI*2);
    ctx.fillStyle="#45f3c2"; ctx.fill();

    // pipes
    ctx.fillStyle="#6d7dff";
    for(const p of pipes){
      ctx.fillRect(p.x, 0, p.w, p.top);
      ctx.fillRect(p.x, p.top+p.gap, p.w, H-(p.top+p.gap));
    }

    ctx.fillStyle="rgba(231,236,255,.9)";
    ctx.font="16px system-ui";
    ctx.fillText(`Score: ${score}`, 14, 22);
  }
  function gameOver(){
    running=false; draw();
    ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#e7ecff"; ctx.font="bold 26px system-ui";
    ctx.fillText("Você perdeu!", 14, 54);
    ctx.font="14px system-ui";
    ctx.fillText("Reiniciar para tentar de novo.", 14, 78);
  }
  function hitPipe(p){
    const bx=bird.x, by=bird.y, r=bird.r;
    const inX = bx+r > p.x && bx-r < p.x+p.w;
    if(!inX) return false;
    const hitTop = by-r < p.top;
    const hitBot = by+r > p.top+p.gap;
    return hitTop || hitBot;
  }

  function step(){
    if(!running) return;

    bird.vy += 0.6;
    bird.y += bird.vy;

    if(bird.y-bird.r<0 || bird.y+bird.r>H) return gameOver();

    if(pipes.length===0 || pipes[pipes.length-1].x < W-320) spawnPipe();
    pipes.forEach(p=>p.x -= 4.2);
    pipes = pipes.filter(p=>p.x > -120);

    for(const p of pipes){
      if(hitPipe(p)) return gameOver();
      if(!p.passed && p.x+p.w < bird.x){
        p.passed=true;
        score += 1; onScore(score);
      }
    }

    draw();
    raf=requestAnimationFrame(step);
  }

  function flap(){ bird.vy = -9.5; }
  function onKey(e){ if(e.key===" "||e.key==="ArrowUp") flap(); }
  function onClick(){ flap(); }

  return{
    start({onScore:os}){ onScore=os||onScore; reset(); running=true; window.addEventListener("keydown",onKey); canvas.addEventListener("click",onClick); raf=requestAnimationFrame(step); },
    stop(){ running=false; if(raf) cancelAnimationFrame(raf); window.removeEventListener("keydown",onKey); canvas.removeEventListener("click",onClick); }
  };
}

// ===== 12) Space Shooter =====
function ShooterGame(canvas, ctx){
  const W=canvas.width,H=canvas.height;
  let raf=null, running=false, onScore=()=>{};
  let ship, bullets, enemies, score=0, cool=0;

  function reset(){
    ship={x:W/2,y:H-70,w:42,h:22,vx:0};
    bullets=[];
    enemies=[];
    score=0; onScore(0);
    cool=0;
  }
  function spawnEnemy(){
    enemies.push({x:randInt(30,W-30), y:-30, r:14, vy:randInt(2,4)});
  }
  function draw(){
    ctx.clearRect(0,0,W,H);

    // ship
    ctx.fillStyle="#45f3c2";
    roundRect(ctx, ship.x-ship.w/2, ship.y-ship.h/2, ship.w, ship.h, 10);
    ctx.fill();

    // bullets
    ctx.fillStyle="#ffd24a";
    bullets.forEach(b=>ctx.fillRect(b.x-2,b.y-10,4,12));

    // enemies
    enemies.forEach(e=>{
      ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,Math.PI*2);
      ctx.fillStyle="#ff4d6d"; ctx.fill();
    });

    ctx.fillStyle="rgba(231,236,255,.9)";
    ctx.font="16px system-ui";
    ctx.fillText(`Abates: ${score}`, 14, 22);
  }
  function gameOver(){
    running=false; draw();
    ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#e7ecff"; ctx.font="bold 26px system-ui";
    ctx.fillText("Você perdeu!", 14, 54);
    ctx.font="14px system-ui";
    ctx.fillText("Reiniciar para tentar de novo.", 14, 78);
  }
  function step(){
    if(!running) return;

    if(Math.random()<0.045) spawnEnemy();

    ship.x = clamp(ship.x + ship.vx, 30, W-30);

    cool = Math.max(0, cool-1);

    bullets.forEach(b=>b.y -= 10);
    bullets = bullets.filter(b=>b.y>-30);

    enemies.forEach(e=>e.y += e.vy);
    // colisão inimigo com nave
    for(const e of enemies){
      const dx=e.x-ship.x, dy=e.y-ship.y;
      if(Math.sqrt(dx*dx+dy*dy) < e.r + 18) return gameOver();
      if(e.y>H+40) return gameOver();
    }

    // colisões bala x inimigo
    for(const b of bullets){
      for(const e of enemies){
        const dx=e.x-b.x, dy=e.y-b.y;
        if(Math.sqrt(dx*dx+dy*dy) < e.r + 6){
          e.dead=true; b.dead=true;
          score += 1; onScore(score);
        }
      }
    }
    bullets = bullets.filter(b=>!b.dead);
    enemies = enemies.filter(e=>!e.dead);

    draw();
    raf=requestAnimationFrame(step);
  }

  function shoot(){
    if(cool>0) return;
    bullets.push({x:ship.x,y:ship.y-20});
    cool=8;
  }

  function onKeyDown(e){
    const k=e.key.toLowerCase();
    if(k==="arrowleft"||k==="a") ship.vx=-8;
    if(k==="arrowright"||k==="d") ship.vx=8;
    if(k===" ") shoot();
  }
  function onKeyUp(e){
    const k=e.key.toLowerCase();
    if((k==="arrowleft"||k==="a") && ship.vx<0) ship.vx=0;
    if((k==="arrowright"||k==="d") && ship.vx>0) ship.vx=0;
  }

  return{
    start({onScore:os}){ onScore=os||onScore; reset(); running=true; window.addEventListener("keydown",onKeyDown); window.addEventListener("keyup",onKeyUp); raf=requestAnimationFrame(step); },
    stop(){ running=false; if(raf) cancelAnimationFrame(raf); window.removeEventListener("keydown",onKeyDown); window.removeEventListener("keyup",onKeyUp); }
  };
}

// ===== 13) Simon =====
function SimonGame(canvas, ctx){
  const W=canvas.width,H=canvas.height;
  let onScore=()=>{}, seq=[], user=[], playing=false, locked=true, score=0;
  const pads = [
    {id:0,x:W/2-220,y:H/2-220,w:200,h:200,c:"#6d7dff"},
    {id:1,x:W/2+20,y:H/2-220,w:200,h:200,c:"#45f3c2"},
    {id:2,x:W/2-220,y:H/2+20,w:200,h:200,c:"#ffd24a"},
    {id:3,x:W/2+20,y:H/2+20,w:200,h:200,c:"#ff4d6d"},
  ];
  let flashId=null;

  function reset(){
    seq=[]; user=[]; score=0; onScore(0);
    next();
  }
  function next(){
    user=[];
    seq.push(randInt(0,3));
    playSequence();
  }
  function playSequence(){
    locked=true;
    let i=0;
    const timer = setInterval(()=>{
      flashId = seq[i];
      draw();
      setTimeout(()=>{ flashId=null; draw(); }, 220);
      i++;
      if(i>=seq.length){
        clearInterval(timer);
        setTimeout(()=>{ locked=false; draw(); }, 320);
      }
    }, 520);
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    pads.forEach(p=>{
      ctx.globalAlpha = (flashId===p.id) ? 1 : 0.85;
      ctx.fillStyle = p.c;
      roundRect(ctx,p.x,p.y,p.w,p.h,22); ctx.fill();
      ctx.globalAlpha = 1;
    });

    ctx.fillStyle="rgba(231,236,255,.9)";
    ctx.font="16px system-ui";
    ctx.fillText(`Nível: ${score}`, 14, 22);
    ctx.font="12px system-ui";
    ctx.fillText(locked ? "Observe..." : "Sua vez!", 14, 42);
  }
  function gameOver(){
    locked=true; draw();
    ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#e7ecff"; ctx.font="bold 26px system-ui";
    ctx.fillText("Errou!", 14, 54);
    ctx.font="14px system-ui";
    ctx.fillText("Reiniciar para tentar de novo.", 14, 78);
  }
  function onClick(ev){
    if(locked) return;
    const rect=canvas.getBoundingClientRect();
    const mx=(ev.clientX-rect.left)*(canvas.width/rect.width);
    const my=(ev.clientY-rect.top)*(canvas.height/rect.height);

    const pad = pads.find(p => mx>=p.x && mx<=p.x+p.w && my>=p.y && my<=p.y+p.h);
    if(!pad) return;

    user.push(pad.id);
    const idx = user.length-1;
    if(user[idx] !== seq[idx]) return gameOver();

    if(user.length === seq.length){
      score += 1; onScore(score);
      setTimeout(next, 420);
    }
  }

  return{
    start({onScore:os}){ onScore=os||onScore; draw(); reset(); canvas.addEventListener("click",onClick); },
    stop(){ canvas.removeEventListener("click",onClick); }
  };
}

// ===== 14) Whack-a-Mole =====
function WhackMoleGame(canvas, ctx){
  const W=canvas.width,H=canvas.height;
  let raf=null, running=false, onScore=()=>{};
  let score=0, startT=0;
  const duration=30000;
  let target=null;

  function spawn(){
    const r=randInt(18,30);
    target={x:randInt(r+30,W-r-30), y:randInt(r+60,H-r-30), r, until:performance.now()+randInt(450,750)};
  }

  function reset(){
    score=0; onScore(0);
    startT=performance.now();
    spawn();
  }

  function draw(t){
    ctx.clearRect(0,0,W,H);
    const left = clamp(duration-(t-startT),0,duration);

    ctx.fillStyle="rgba(231,236,255,.9)";
    ctx.font="16px system-ui";
    ctx.fillText(`Tempo: ${(left/1000).toFixed(1)}s`,14,22);
    ctx.fillText(`Score: ${score}`,14,44);

    if(left<=0){
      running=false;
      ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#e7ecff"; ctx.font="bold 26px system-ui";
      ctx.fillText("Fim!",14,54);
      ctx.font="14px system-ui";
      ctx.fillText("Reiniciar para jogar novamente.",14,78);
      return;
    }

    if(!target || t>target.until) spawn();

    ctx.beginPath(); ctx.arc(target.x,target.y,target.r+10,0,Math.PI*2);
    ctx.strokeStyle="rgba(109,125,255,.55)"; ctx.lineWidth=4; ctx.stroke();

    ctx.beginPath(); ctx.arc(target.x,target.y,target.r,0,Math.PI*2);
    ctx.fillStyle="#45f3c2"; ctx.fill();

    raf=requestAnimationFrame(draw);
  }

  function onClick(ev){
    if(!running||!target) return;
    const rect=canvas.getBoundingClientRect();
    const mx=(ev.clientX-rect.left)*(canvas.width/rect.width);
    const my=(ev.clientY-rect.top)*(canvas.height/rect.height);
    const dx=mx-target.x, dy=my-target.y;

    if(Math.sqrt(dx*dx+dy*dy)<=target.r){
      score+=1; onScore(score);
      spawn();
    }
  }

  return{
    start({onScore:os}){ onScore=os||onScore; reset(); running=true; canvas.addEventListener("click",onClick); raf=requestAnimationFrame(draw); },
    stop(){ running=false; if(raf) cancelAnimationFrame(raf); canvas.removeEventListener("click",onClick); }
  };
}

// ===== 15) Math Rush =====
function MathRushGame(canvas, ctx){
  const W=canvas.width,H=canvas.height;
  let onScore=()=>{}, running=false;
  let t0=0, duration=45000;
  let a=0,b=0,op="+",ans=0;
  let input="", score=0;

  function newQ(){
    a=randInt(1,20); b=randInt(1,20);
    const ops=["+","-","*"];
    op=ops[randInt(0,ops.length-1)];
    ans = (op==="+") ? a+b : (op==="-") ? a-b : a*b;
    input="";
  }

  function reset(){
    score=0; onScore(0);
    t0=performance.now();
    newQ();
    draw();
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    const now=performance.now();
    const left=clamp(duration-(now-t0),0,duration);

    ctx.fillStyle="rgba(231,236,255,.9)";
    ctx.font="16px system-ui";
    ctx.fillText(`Tempo: ${(left/1000).toFixed(1)}s`, 14, 22);
    ctx.fillText(`Score: ${score}`, 14, 44);

    if(left<=0){
      running=false;
      ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#e7ecff"; ctx.font="bold 26px system-ui";
      ctx.fillText("Fim!", 14, 54);
      ctx.font="14px system-ui";
      ctx.fillText("Reiniciar para jogar de novo.", 14, 78);
      return;
    }

    ctx.font="bold 62px system-ui";
    ctx.fillText(`${a} ${op} ${b} = ?`, W/2-180, H/2);

    ctx.font="bold 40px system-ui";
    ctx.fillStyle="#45f3c2";
    ctx.fillText(input || "…", W/2-60, H/2+70);

    requestAnimationFrame(draw);
  }

  function onKey(e){
    if(!running) return;
    if(e.key>="0" && e.key<="9"){
      if(input.length<6) input += e.key;
    }else if(e.key==="-" && input.length===0){
      input = "-";
    }else if(e.key==="Backspace"){
      input = input.slice(0,-1);
    }else if(e.key==="Enter"){
      const val = Number(input);
      if(Number.isFinite(val) && val === ans){
        score += 1; onScore(score);
      }else{
        score = Math.max(0, score-1);
        onScore(score);
      }
      newQ();
    }
  }

  return{
    start({onScore:os}){ onScore=os||onScore; running=true; reset(); window.addEventListener("keydown",onKey); },
    stop(){ running=false; window.removeEventListener("keydown",onKey); }
  };
}

// ===== 16) Color Catch =====
function ColorCatchGame(canvas, ctx){
  const W=canvas.width,H=canvas.height;
  let raf=null, running=false, onScore=()=>{};
  let t0=0, duration=40000;
  let score=0;
  const basket={x:W/2,y:H-60,w:140,h:18,vx:0};
  let drops=[];

  function reset(){
    score=0; onScore(0);
    drops=[];
    basket.x=W/2;
    t0=performance.now();
  }

  function spawn(){
    const good = Math.random() < 0.62;
    drops.push({
      x: randInt(30,W-30),
      y: -20,
      r: randInt(10,16),
      vy: randInt(3,6),
      good
    });
  }

  function draw(t){
    ctx.clearRect(0,0,W,H);
    const left=clamp(duration-(t-t0),0,duration);

    ctx.fillStyle="rgba(231,236,255,.9)";
    ctx.font="16px system-ui";
    ctx.fillText(`Tempo: ${(left/1000).toFixed(1)}s`,14,22);
    ctx.fillText(`Score: ${score}`,14,44);

    // basket
    ctx.fillStyle="#6d7dff";
    roundRect(ctx, basket.x-basket.w/2, basket.y, basket.w, basket.h, 10);
    ctx.fill();

    // drops
    for(const d of drops){
      ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
      ctx.fillStyle = d.good ? "#45f3c2" : "#ff4d6d";
      ctx.fill();
    }

    if(left<=0){
      running=false;
      ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#e7ecff"; ctx.font="bold 26px system-ui";
      ctx.fillText("Fim!",14,54);
      ctx.font="14px system-ui";
      ctx.fillText("Reiniciar para jogar de novo.",14,78);
      return;
    }

    raf=requestAnimationFrame(step);
  }

  function step(t){
    if(!running) return;

    if(Math.random()<0.09) spawn();

    basket.x = clamp(basket.x + basket.vx, basket.w/2+10, W-basket.w/2-10);

    drops.forEach(d=>d.y += d.vy);
    // colisões
    for(const d of drops){
      if(d.y + d.r >= basket.y && d.y - d.r <= basket.y + basket.h){
        if(d.x >= basket.x-basket.w/2 && d.x <= basket.x+basket.w/2){
          // pegou
          score += d.good ? 1 : -1;
          score = Math.max(0, score);
          onScore(score);
          d.dead=true;
        }
      }
      if(d.y > H+40) d.dead=true;
    }
    drops = drops.filter(d=>!d.dead);

    draw(t);
  }

  function onKeyDown(e){
    const k=e.key.toLowerCase();
    if(k==="arrowleft"||k==="a") basket.vx=-9;
    if(k==="arrowright"||k==="d") basket.vx=9;
  }
  function onKeyUp(e){
    const k=e.key.toLowerCase();
    if((k==="arrowleft"||k==="a") && basket.vx<0) basket.vx=0;
    if((k==="arrowright"||k==="d") && basket.vx>0) basket.vx=0;
  }

  return{
    start({onScore:os}){ onScore=os||onScore; reset(); running=true; window.addEventListener("keydown",onKeyDown); window.addEventListener("keyup",onKeyUp); raf=requestAnimationFrame(step); },
    stop(){ running=false; if(raf) cancelAnimationFrame(raf); window.removeEventListener("keydown",onKeyDown); window.removeEventListener("keyup",onKeyUp); basket.vx=0; }
  };
}