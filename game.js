/* =====================================================
   لعبة "التحويل الذكي"
   إعداد: إيمان الزهراني
   ===================================================== */

const $  = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const screens = {
  start: $('#start-screen'),
  game:  $('#game-screen'),
  end:   $('#end-screen'),
};

const ui = {
  level: $('#level'),
  score: $('#score'),
  time:  $('#time'),
  qText: $('#question-text'),
  choices: $('#choices'),
  feedback: $('#feedback'),
  progress: $('#progress-bar'),

  endTitle: $('#end-title'),
  endSummary: $('#end-summary'),
  btnNext: $('#btn-next-level'),
  btnRestart: $('#btn-restart'),
  btnStart: $('#btn-start'),
  btnCert: $('#btn-certificate'),

  unitSelect: $('#unit-select'),
  rangeSelect: $('#range-select'),
  qPerLevel: $('#questions-per-level'),
};

const Game = {
  level: 1,
  maxLevel: 3,
  score: 0,
  timeLeft: 60,
  timerId: null,
  asked: 0,
  questions: [],
  questionsPerLevel: 5,
  unit: 'm',
  prefixRange: 'common',
};

const PREFIXES = [
  { symbol:'n', exp:-9  },
  { symbol:'µ', exp:-6  },
  { symbol:'m', exp:-3  },
  { symbol:'',  exp:0   },
  { symbol:'k', exp:3   },
  { symbol:'M', exp:6   },
  { symbol:'G', exp:9   },
];

const rnd = (min,max)=> Math.floor(Math.random()*(max-min+1))+min;
const pick = arr => arr[Math.floor(Math.random()*arr.length)];

function getPrefixPool(){
  return PREFIXES;
}

function makeQuestion(){
  const p1 = pick(PREFIXES);
  let p2 = pick(PREFIXES);
  while(p1.exp === p2.exp) p2 = pick(PREFIXES);

  const baseVal = rnd(1,100);
  const v_base = baseVal * Math.pow(10, p1.exp);
  const correct = v_base / Math.pow(10, p2.exp);

  return {
    text: `حوّل ${baseVal} ${p1.symbol}${Game.unit} إلى ${p2.symbol}${Game.unit}`,
    options: shuffle([
      correct,
      correct*10,
      correct/10,
      baseVal
    ]).map(x=>Number(x.toFixed(3))),
    answer: Number(correct.toFixed(3))
  };
}

function shuffle(arr){
  return arr.sort(()=>Math.random()-0.5);
}

function startGame(){
  Game.level = 1;
  Game.score = 0;
  Game.unit = ui.unitSelect.value;
  Game.questionsPerLevel = +ui.qPerLevel.value;

  swapScreen('game');
  ui.level.textContent = Game.level;
  ui.score.textContent = Game.score;
  loadLevel();
}

function loadLevel(){
  Game.questions = [];
  Game.asked = 0;

  for(let i=0;i<Game.questionsPerLevel;i++){
    Game.questions.push(makeQuestion());
  }

  startTimer(60);
  askNext();
}

function startTimer(seconds){
  Game.timeLeft = seconds;
  ui.time.textContent = Game.timeLeft;

  clearInterval(Game.timerId);
  Game.timerId = setInterval(()=>{
    Game.timeLeft--;
    ui.time.textContent = Game.timeLeft;
    if(Game.timeLeft<=0){
      clearInterval(Game.timerId);
      endLevel(false);
    }
  },1000);
}

function askNext(){
  const q = Game.questions[Game.asked];
  if(!q){
    endLevel(true);
    return;
  }

  ui.qText.textContent = q.text;
  ui.choices.innerHTML = '';

  q.options.forEach(opt=>{
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = opt;
    btn.onclick = ()=>handleAnswer(opt, q.answer);
    ui.choices.appendChild(btn);
  });

  ui.progress.style.width =
    (Game.asked/Game.questions.length*100)+'%';
}

function handleAnswer(val, correct){
  if(val === correct){
    Game.score += 10;
    ui.score.textContent = Game.score;
    Game.asked++;
    askNext();
  }else{
    alert("خطأ حاول مرة أخرى");
  }
}

function endLevel(won){
  swapScreen('end');
  ui.endTitle.textContent = won ? "أحسنت!" : "انتهى الوقت";
  ui.endSummary.textContent = "نقاطك: " + Game.score;

  ui.btnNext.style.display =
    (won && Game.level<Game.maxLevel) ? 'inline-block':'none';
}

function nextLevel(){
  Game.level++;
  swapScreen('game');
  ui.level.textContent = Game.level;
  loadLevel();
}

function restartGame(){
  swapScreen('start');
}

function swapScreen(name){
  Object.values(screens).forEach(s=>s.classList.remove('active'));
  screens[name].classList.add('active');
}

ui.btnStart.onclick = startGame;
ui.btnNext.onclick = nextLevel;
ui.btnRestart.onclick = restartGame;
