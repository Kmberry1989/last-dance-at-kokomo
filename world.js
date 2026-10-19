/* Original sprite-sheet artwork, story scenes, and small beat-'em-up interludes. */
(() => {
  'use strict';
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion = reducedQuery.matches;
  let spriteMap = null;
  const art = {};
  const paths = ['hero-him','hero-her','enemies','band-enemies','world-exterior','world-lobby','world-garage','world-banquet','world-auction','prop-chair','prop-frame','prop-tray','prop-extinguisher'];
  let loadProblem = false;
  const preload = paths.map(name => new Promise(resolve => {
    const img = new Image(); art[name] = img;
    img.onload = () => resolve(true);
    img.onerror = () => { loadProblem = true; resolve(false); };
    img.src = `assets/${name}.webp?v=3`;
  }));
  const ready = Promise.all([...preload, fetch('assets/sprites.json?v=3').then(r => {
    if (!r.ok) throw new Error('Sprite metadata unavailable'); return r.json();
  }).then(data => { spriteMap = data; }).catch(() => { loadProblem = true; })]);

  const stageHero = $('stage-hero');
  const worldCanvas = document.createElement('canvas');
  worldCanvas.id = 'world-canvas'; worldCanvas.setAttribute('role','img');
  worldCanvas.setAttribute('aria-label','The couple moves through the conference center as the story changes with the music.');
  stageHero.prepend(worldCanvas);
  const worldAction = document.createElement('span'); worldAction.className = 'world-action';
  stageHero.append(worldAction);
  const artLabel = document.createElement('div'); artLabel.className = 'story-art-label';
  $('story').append(artLabel);
  const speaker = document.createElement('div'); speaker.className = 'story-speaker';
  $('story-title').before(speaker);
  $('story-desc').setAttribute('aria-live','polite');
  const toolsRow = document.createElement('div'); toolsRow.className = 'topline';
  toolsRow.innerHTML = '<button class="route-button" id="chapters-btn">CHAPTER SELECT</button><button class="motion-button" id="motion-btn" aria-pressed="false">REDUCE MOTION</button>';
  document.querySelector('.home-controls').append(toolsRow);
  $('motion-btn').onclick = () => { reduceMotion = !reduceMotion; applyMotion(); };
  function applyMotion() {
    $('app').classList.toggle('reduce-motion', reduceMotion);
    $('motion-btn').setAttribute('aria-pressed', String(reduceMotion));
    $('motion-btn').textContent = reduceMotion ? 'MOTION REDUCED' : 'REDUCE MOTION';
  }
  reducedQuery.addEventListener?.('change',e => {reduceMotion=e.matches;applyMotion();});
  applyMotion();

  // Each phrase advances the location and the action, rather than looping one still.
  const beats = [
    [
      ['world-garage','THE EVENING BEGINS','They follow the elevator signs, still laughing about the drive.','walk'],
      ['world-garage','FOOTSTEPS ABOVE','A figure follows on the level above. Neither of them looks up.','walk'],
      ['world-exterior','AFTER YOU','He opens the door. Warm light spills out into the night.','idle'],
      ['world-lobby','FOLLOW THE MUSIC','They step inside together. Somewhere ahead, the band starts.','walk']
    ],
    [
      ['world-lobby','WELCOME TO THE GALA','They fall into step beneath the chandeliers.','idle'],
      ['world-lobby','SAME STEPS','Her shoulder brushes his. For a moment, the whole room feels right.','idle'],
      ['world-lobby','THE EMPTY DESK','Nobody is at registration. A glass rolls across the floor.','walk'],
      ['world-auction','GOING UP','Applause carries them toward the art auction.','walk']
    ],
    [
      ['world-auction','LOT 217','An older guest raises his paddle. The painting is already sold.','idle'],
      ['world-auction','GOING ONCE','He raises it again. His eyes never move.','idle'],
      ['world-auction','GOING TWICE','The gavel falls. Every head turns toward the couple.','block'],
      ['world-banquet','DINNER IS READY','They slip into the banquet hall. The music follows.','walk']
    ],
    [
      ['world-banquet','A TOAST','One last ordinary moment: a smile, a glass, a song.','idle'],
      ['world-banquet','THE FIRST SCREAM','A server drops a tray. A guest lunges across the table.','hurt'],
      ['world-banquet','STAY CLOSE','They duck as a chair crashes behind them.','duck'],
      ['world-banquet','MAKE SOME ROOM','The aisle is blocked. They have to push through together.','punch']
    ],
    [
      ['band','DEAD AIR','They reach the stage. The musicians keep playing through the chaos.','block'],
      ['band','THE WRONG ENCORE','The singer steps down. The microphone cable drags behind him.','kick'],
      ['world-banquet','KEEP MOVING','A clear beat cuts through the noise. They use it to move as one.','walk'],
      ['world-banquet','UP ON THE TABLES','The exit is blocked. She points to a path above the crowd.','jump']
    ],
    [
      ['escape','OVER THE TABLES','They climb above the crowd. Plates slide beneath their feet.','jump'],
      ['world-banquet','DUCK AND RUN','They spring between tables as hands reach from below.','walk'],
      ['escape','HOLD ON','A chair gives way. Their hands begin to slip apart.','hurt'],
      ['apart','FIND EACH OTHER','They land on opposite sides of the crowd. She calls his name.','block']
    ]
  ];
  const speakers = ['THE TWO OF YOU','UNDER THE CHANDELIERS','AT THE AUCTION','THE NIGHT TURNS','THE BAND PLAYS ON','DON’T LET GO'];
  let visualAction = null, visualUntil = 0, visualAt = 0;
  let lastPhase = -1;
  function gesture(action, seconds=.48) { visualAction=action;visualAt=performance.now()/1000;visualUntil=visualAt+seconds; }

  const oldPaintPanel = paintPanel;
  paintPanel = function() {
    oldPaintPanel();
    speaker.textContent = finaleMode ? 'TOGETHER AGAIN' : speakers[level];
    artLabel.textContent = finaleMode ? ['ACROSS THE BALLROOM','THROUGH THE LOBBY','OUT INTO THE DAWN'][panel] : STAGES[level].track;
    $('story-art').setAttribute('role','img');
    $('story-art').setAttribute('aria-label', $('story-title').textContent + '. ' + $('story-desc').textContent);
    $('story-content')?.scrollTo?.(0,0);
  };
  const oldStartStage = startStage;
  startStage = function() {
    visualAction=null;lastPhase=-1;oldStartStage();
    $('stage-subtitle').textContent=beats[level][0][2];
    $('stage-title').textContent=beats[level][0][1];
    worldAction.textContent='KEEP IN STEP';
    $('pause-screen').querySelector('.modal-help').textContent='Tap matching arrows on the line. Hold long tails; press two arrows for paired notes. Your steps move the story forward. Misses never stop the adventure.';
    if(loadProblem) showAssetWarning(stageHero);
  };
  const oldHit = applyHit;
  applyHit = function(note, rating) {
    oldHit(note,rating);
    gesture(level<2 ? ['walk','duck','jump','idle'][note.lane] : ['block','duck','jump',note.kind==='star'?'kick':'punch'][note.lane],note.kind==='hold'?.7:.45);
    worldAction.textContent = level<2 ? ['SIDE STEP','STAY LOW','A LITTLE LIFT','IN STEP'][note.lane] : ['GUARD','DUCK','JUMP','STRIKE'][note.lane];
  };
  const oldMiss = applyMiss;
  applyMiss = function() { oldMiss(); if(level>=3)gesture('hurt',.3); };
  const oldEndStage = endStage;
  endStage = function() {
    oldEndStage();
    const lines = ['They reach the lobby. The night still feels like theirs.','They follow the applause upstairs. The empty desk disappears behind them.','The gavel falls one last time. Dinner is about to go very wrong.','The aisle is full of reaching hands. Time to stand their ground.','The stage is lost. The only way out is over the tables.','The crowd pulls them apart. This is where they fight their way back.'];
    $('result-note').textContent=lines[level];
    $('continue-btn').textContent=(level===3||level===5)?'▶ STAND YOUR GROUND':'▶ NEXT CINEMATIC';
  };

  function contextFor(canvas) {
    const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return null;
    const scale=Math.min(devicePixelRatio||1,2),w=Math.round(r.width*scale),h=Math.round(r.height*scale);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    const ctx=canvas.getContext('2d');ctx.setTransform(scale,0,0,scale,0,0);ctx.imageSmoothingEnabled=false;
    return {ctx,w:r.width,h:r.height};
  }
  function background(ctx,key,w,h,position=.5,zoom=1.12) {
    const img=art[key];
    const fallback=Object.values(art).find(x=>x.complete&&x.naturalWidth);
    const source=img?.complete&&img.naturalWidth?img:fallback;
    if(!source){ctx.fillStyle='#141c31';ctx.fillRect(0,0,w,h);return;}
    const scale=Math.max(w/source.naturalWidth,h/source.naturalHeight)*zoom;
    const dw=source.naturalWidth*scale,dh=source.naturalHeight*scale;
    ctx.drawImage(source,-(dw-w)*position,-(dh-h)*.42,dw,dh);
    const shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#05091610');shade.addColorStop(.55,'#05091608');shade.addColorStop(1,'#0509169c');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
  }
  for(const key of ['band','escape','apart']) { const i=new Image();i.src=ASSETS[key];art[key]=i; }
  function sprite(ctx,which,action,x,feet,height,t,flip=false,opacity=1) {
    const img=art[which],groups=spriteMap?.[which];
    if(!img?.complete||!img.naturalWidth||!groups)return;
    const frames=groups[action]||groups.idle||Object.values(groups)[0];if(!frames?.length)return;
    const index=frames[reduceMotion?0:Math.floor(Math.max(0,t)*7)%frames.length];
    const width=height*192/224;
    ctx.save();ctx.globalAlpha=opacity;ctx.translate(x,feet);if(flip)ctx.scale(-1,1);
    ctx.drawImage(img,(index%8)*192,Math.floor(index/8)*224,192,224,-width/2,-height,width,height);ctx.restore();
  }
  function prop(ctx,name,x,y,size,rotation=0) {
    const img=art[name];if(!img?.complete||!img.naturalWidth)return;
    ctx.save();ctx.translate(x,y);ctx.rotate(rotation);const scale=size/Math.max(img.naturalWidth,img.naturalHeight);ctx.drawImage(img,-img.naturalWidth*scale/2,-img.naturalHeight*scale/2,img.naturalWidth*scale,img.naturalHeight*scale);ctx.restore();
  }
  function showAssetWarning(parent) {
    if(parent.querySelector('.asset-warning'))return;
    const el=document.createElement('div');el.className='asset-warning';el.textContent='Some artwork could not load. Refresh to try again; the game still works.';parent.append(el);
  }
  function drawRhythm(t) {
    const c=contextFor(worldCanvas);if(!c)return;const {ctx,w,h}=c;
    const p=Math.max(0,Math.min(.999,elapsed/(32*beatLen))),phase=Math.min(3,Math.floor(p*4)),event=beats[level][phase];
    background(ctx,event[0],w,h,reduceMotion?.5:.15+p*.7,1.15);
    if(phase!==lastPhase){lastPhase=phase;$('stage-title').textContent=event[1];$('stage-subtitle').textContent=event[2];worldCanvas.setAttribute('aria-label',event[2]);}
    const action=t<visualUntil?visualAction:event[3];
    const isApart=level===5&&phase===3,base=h*.80;
    const run=level>=3&&!reduceMotion?Math.sin(t*10)*2:0;
    const jump=action==='jump'&&!reduceMotion?Math.sin((t-visualAt)*Math.PI/.5)*h*.10:0;
    const animTime=t<visualUntil?t-visualAt:t;
    sprite(ctx,'hero-him',action,w*(isApart?.22:.34),base+run-Math.max(0,jump),h*.77,animTime);
    sprite(ctx,'hero-her',action,w*(isApart?.77:.57),base-run-Math.max(0,jump),h*.77,animTime+.18,isApart);
    if(level>=2){
      const type=level===4?'singer':level===2?'auction':'guest';
      sprite(ctx,level===4?'band-enemies':'enemies',type+'-'+(phase>=2?'attack':'walk'),w*(.9-p*.06),base,h*.72,t,true);
    }
    if(level>=3){
      const travel=reduceMotion?.12:((p*2)%1);
      prop(ctx,'prop-chair',w*(1.1-travel*1.4),h*.88,h*.22,reduceMotion?0:-.18);
      if(level===5)prop(ctx,'prop-tray',w*(.88-travel*.5),h*(.45+Math.sin(travel*Math.PI)*.12),h*.19,reduceMotion?0:t*.6);
    }
  }

  // A short brawler: three buttons, no combos to memorize and no game-over wall.
  const fightScreen=document.createElement('section');fightScreen.className='screen';fightScreen.id='fight';
  fightScreen.innerHTML=`<div class="fight-bar"><div class="topline"><span class="brand" id="fight-chapter">INTERLUDE · MAKE A PATH</span><button id="fight-pause" class="pause" aria-label="Pause fight">Ⅱ</button></div><h2 id="fight-title">STAND YOUR GROUND</h2><div class="fight-status"><span id="fight-player">PLAYING AS HER</span><span id="fight-count">0 / 3 CLEARED</span></div><div class="fight-health" role="progressbar" aria-label="Team energy" aria-valuemin="0" aria-valuemax="4" aria-valuenow="4"><span id="fight-energy"></span></div></div><div id="fight-progress"></div><div class="fight-scene"><canvas id="fight-canvas" role="img" aria-label="The couple fights a path through zombie gala guests."></canvas><div class="fight-cue"><strong id="fight-cue">READY WHEN YOU ARE</strong><small id="fight-enemy-name">THE BANQUET HALL</small></div><div class="fight-intro" id="fight-intro"><span class="brand" id="fight-intro-label">A CHANGE OF PACE · SIMPLE BRAWLER</span><h3 id="fight-intro-title">MAKE A PATH.</h3><p id="fight-intro-text">The aisle is blocked. Strike to push a zombie back. Hold block when it winds up. Switch characters whenever you like. Your partner covers you if you get overwhelmed.</p><button id="fight-begin" class="big-btn">▶ READY · LET’S GO</button><button id="fight-skip" class="fight-skip">CONTINUE THE STORY WITHOUT FIGHTING</button><div class="secondary">J = strike · K = hold block · L = switch</div></div></div><div class="fight-dialogue" id="fight-dialogue" aria-live="polite">“Stay behind me.” “How about beside you?”</div><div class="fight-controls"><button class="fight-button" id="fight-block">BLOCK<small>HOLD · K</small></button><button class="fight-button strike" id="fight-strike">STRIKE<small>TAP · J</small></button><button class="fight-button" id="fight-switch">SWITCH<small>HER / HIM · L</small></button></div>`;
  $('pause-screen').before(fightScreen);screens.push('fight');
  const fightCanvas=$('fight-canvas');
  let fight=null,afterFight=null,blockPointers=new Set();
  const enemyNames={guest:'GALA GENTLEMAN',server:'BANQUET SERVER',auction:'GUEST WITH PADDLE 217',gallery:'GALLERY GUEST',singer:'THE LEAD SINGER',drummer:'THE DRUMMER'};
  const fightOrders=[['server','guest','gallery'],['auction','drummer','singer']];
  function openFight(which=0,next=()=>{level++;openCinematic();}) {
    active=false;paused=false;afterFight=next;visualAction=null;blockPointers.clear();
    fight={which,hero:which===0?1:0,state:'intro',time:0,last:0,cleared:0,hp:4,enemyHP:3,enemyX:.92,enemyPhase:'approach',phaseTime:0,action:'idle',actionUntil:0,lastStrike:-1,blocking:false,enemyHitUntil:0,enemyDownUntil:0,coverUntil:0,beat:0,ready:false};
    $('fight-title').textContent=which?'BACK TO EACH OTHER':'STAND YOUR GROUND';
    $('fight-chapter').textContent=which?'FINAL INTERLUDE · REUNION':'INTERLUDE · BANQUET HALL';
    $('fight-intro-title').textContent=which?'THROUGH THE CROWD.':'MAKE A PATH.';
    $('fight-intro-text').textContent=which?'They are on opposite sides of the ballroom. Clear three zombies to reach each other. Tap strike, hold block when an enemy winds up, and switch between them. They leave together.':'The aisle is blocked. Strike to push a zombie back. Hold block when it winds up. Switch characters whenever you like. Your partner covers you if you get overwhelmed.';
    $('fight-intro-label').textContent='A CHANGE OF PACE · SIMPLE BRAWLER';
    $('fight-begin').textContent='▶ READY · LET’S GO';$('fight-skip').hidden=false;
    $('fight-intro').hidden=false;$('fight-pause').disabled=false;
    $('fight-dialogue').textContent=which?'“I can see you! Keep coming!”':'“Stay behind me.” “How about beside you?”';
    $('fight-block').classList.remove('held');updateFightHUD();display('fight');
    ready.then(()=>{if(fight){fight.ready=true;if(loadProblem)showAssetWarning(document.querySelector('.fight-scene'));}});
  }
  function enemyType(){return fightOrders[fight.which][Math.min(2,fight.cleared)];}
  function updateFightHUD(){
    if(!fight)return;
    $('fight-player').textContent='PLAYING AS '+(fight.hero?'HER':'HIM');
    $('fight-count').textContent=`${fight.cleared} / 3 CLEARED`;
    $('fight-energy').style.width=(fight.hp/4*100)+'%';
    $('fight-energy').parentElement.setAttribute('aria-valuenow',String(fight.hp));
    $('fight-progress').style.width=(fight.cleared/3*100)+'%';
  }
  function fightSound(kind){if(!soundOn)return;ensureAudio();audio?.resume().catch(()=>{});if(!audio)return;tone(kind==='block'?195:kind==='clear'?659:95,audio.currentTime,.12,kind==='strike'?'sawtooth':'triangle',.13,sfxBus);}
  $('fight-begin').onclick=()=>{
    if(!fight)return;
    if(fight.state==='won'){const callback=afterFight;fight=null;callback?.();return;}
    ensureAudio();audio?.resume().catch(()=>{});fight.state='play';fight.last=performance.now()/1000;
    $('fight-intro').hidden=true;$('fight-dialogue').textContent='Tap STRIKE to make room. Hold BLOCK when the enemy raises its arms.';
  };
  $('fight-skip').onclick=()=>{const callback=afterFight;fight=null;blockPointers.clear();callback?.();};
  function strike(){
    if(screen!=='fight'||!fight||fight.state!=='play'||paused)return;
    if(fight.time-fight.lastStrike<.30)return;
    fight.lastStrike=fight.time;fight.action=(fight.time%1>.55)?'kick':'punch';fight.actionUntil=fight.time+.38;
    if(fight.enemyPhase==='defeated')return;
    if(fight.enemyX>.73){$('fight-dialogue').textContent='Let them come closer. Your partner is watching your back.';return;}
    fightSound('strike');fight.enemyHP--;fight.enemyHitUntil=fight.time+.34;fight.enemyX=Math.min(.78,fight.enemyX+.045);
    $('fight-dialogue').textContent=fight.hero?'She drives the guest back. “Still beside you!”':'He makes a little room. “Your turn!”';
    if(fight.enemyHP<=0){fight.enemyPhase='defeated';fight.enemyDownUntil=fight.time+.8;fightSound('clear');}
  }
  function setBlock(value){
    if(!fight)return;fight.blocking=value;$('fight-block').classList.toggle('held',value);
    if(value&&fight.state==='play'){$('fight-dialogue').textContent='Guard up. Release block and strike when there is an opening.';}
  }
  $('fight-strike').onclick=strike;
  $('fight-switch').onclick=()=>{if(!fight||fight.state!=='play'||paused)return;fight.hero=1-fight.hero;fight.action='walk';fight.actionUntil=fight.time+.35;updateFightHUD();$('fight-dialogue').textContent=fight.hero?'“I’ve got this. Stay close.”':'“Right here. Keep moving.”';};
  const guard=$('fight-block');
  guard.addEventListener('click',e=>{if(e.detail===0&&screen==='fight'&&fight?.state==='play'&&!paused)setBlock(!fight.blocking);});
  guard.addEventListener('pointerdown',e=>{e.preventDefault();if(screen!=='fight'||paused||fight?.state!=='play')return;guard.setPointerCapture(e.pointerId);blockPointers.add(e.pointerId);setBlock(true);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])guard.addEventListener(event,e=>{blockPointers.delete(e.pointerId);if(!blockPointers.size)setBlock(false);});
  document.addEventListener('keydown',e=>{
    if(screen!=='fight')return;
    if(['j','k','l','Escape'].includes(e.key.toLowerCase())||e.key==='Escape')e.preventDefault();
    if(e.repeat)return;
    if(e.key==='Escape'){if(paused)resumeGame();else pauseGame();return;}
    if(e.key.toLowerCase()==='j')strike();
    if(e.key.toLowerCase()==='k'&&fight?.state==='play'&&!paused)setBlock(true);
    if(e.key.toLowerCase()==='l')$('fight-switch').click();
  });
  document.addEventListener('keyup',e=>{if(e.key.toLowerCase()==='k'&&screen==='fight')setBlock(false);});
  window.addEventListener('blur',()=>{if(screen==='fight'&&fight?.state==='play'&&!paused)pauseGame();});
  function winFight(){
    fight.state='won';fight.blocking=false;setBlock(false);$('fight-pause').disabled=true;
    totalScore+=3000;
    $('fight-intro-label').textContent='PATH CLEAR · +3,000';
    $('fight-intro-title').textContent=fight.which?'FOUND YOU.':'SIDE BY SIDE.';
    $('fight-intro-text').textContent=fight.which?'The last zombie stumbles aside. They reach across the gap, catch each other’s hands, and run. The night ends with both of them.':'She catches his sleeve. He rights the fallen chair. The band is still playing, and they have a path toward the stage.';
    $('fight-begin').textContent=fight.which?'▶ REUNION FINALE':'▶ KEEP GOING';
    $('fight-skip').hidden=true;$('fight-intro').hidden=false;
    $('fight-dialogue').textContent=fight.which?'“There you are.” “I wasn’t leaving without you.”':'“Beside you, then.” “Always.”';
  }
  function tickFight(dt){
    if(!fight||fight.state!=='play'||paused)return;
    fight.time+=dt;fight.phaseTime+=dt;
    if(fight.enemyPhase==='approach'){
      fight.enemyX=Math.max(.65,fight.enemyX-dt*.13);
      if(fight.enemyX<=.65){fight.enemyPhase='windup';fight.phaseTime=0;}
    }else if(fight.enemyPhase==='windup'&&fight.phaseTime>1.35){
      fight.enemyPhase='recover';fight.phaseTime=0;
      if(fight.blocking){fightSound('block');fight.enemyHP--;fight.enemyHitUntil=fight.time+.3;$('fight-dialogue').textContent='BLOCKED! The zombie staggers. Strike while it is off balance.';if(fight.enemyHP<=0){fight.enemyPhase='defeated';fight.enemyDownUntil=fight.time+.7;}}
      else{fight.hp--;fight.action='hurt';fight.actionUntil=fight.time+.35;$('fight-dialogue').textContent='A glancing hit. Hold BLOCK when the enemy winds up.';if(fight.hp<=0){fight.hp=4;fight.coverUntil=fight.time+.8;$('fight-dialogue').textContent='Your partner pulls you clear. Catch your breath—keep going together.';}updateFightHUD();}
    }else if(fight.enemyPhase==='recover'&&fight.phaseTime>1.1){fight.enemyPhase='approach';fight.phaseTime=0;}
    else if(fight.enemyPhase==='defeated'&&fight.time>fight.enemyDownUntil){
      fight.cleared++;updateFightHUD();if(fight.cleared>=3){winFight();return;}
      fight.enemyHP=3;fight.enemyX=.95;fight.enemyPhase='approach';fight.phaseTime=0;
      $('fight-dialogue').textContent=['','One down. They move past the fallen table.','Two down. The exit is almost within reach.'][fight.cleared];
    }
    $('fight-cue').textContent=fight.enemyPhase==='windup'?'WINDING UP · HOLD BLOCK':fight.enemyPhase==='recover'?'OPENING · STRIKE!':fight.enemyPhase==='defeated'?'PATH CLEAR':fight.enemyX>.73?'LET THEM COME CLOSER':'STRIKE TO MAKE ROOM';
    $('fight-enemy-name').textContent=enemyNames[enemyType()]+' · '+Math.max(0,fight.enemyHP)+' / 3';
  }
  function drawFight(t){
    if(!fight)return;const c=contextFor(fightCanvas);if(!c)return;const {ctx,w,h}=c;
    background(ctx,'world-banquet',w,h,reduceMotion?.5:.15+fight.cleared*.2,1.1);
    const base=h*.83,height=Math.min(340,h*.75),run=reduceMotion?0:Math.sin(t*6)*2;
    const action=fight.state==='won'?'victory':fight.blocking?'block':fight.time<fight.actionUntil?fight.action:'idle';
    sprite(ctx,fight.hero?'hero-her':'hero-him',action,w*.32,base+run,height,t);
    const partnerX=fight.which&&fight.state!=='won'?.88:.16;
    sprite(ctx,fight.hero?'hero-him':'hero-her',fight.time<fight.coverUntil?'punch':fight.state==='won'?'victory':'idle',w*partnerX,base-10,height*.82,t+.2,fight.which&&fight.state!=='won',.92);
    if(fight.cleared<3){
      const type=enemyType(),sheet=['singer','drummer'].includes(type)?'band-enemies':'enemies';
      const enemyAction=fight.enemyPhase==='defeated'?'defeat':fight.time<fight.enemyHitUntil?'hit':fight.enemyPhase==='windup'?'attack':fight.enemyPhase==='approach'?'walk':'idle';
      const lunge=fight.enemyPhase==='windup'&&!reduceMotion?Math.sin(fight.phaseTime*12)*.01:0;
      sprite(ctx,sheet,type+'-'+enemyAction,w*(fight.enemyX-lunge),base,height*.96,t,true);
    }
    prop(ctx,'prop-chair',w*.075,h*.88,h*.22,-.2);
    prop(ctx,fight.which?'prop-frame':'prop-tray',w*.86,h*.9,h*.17,.2);
  }
  const oldPause=pauseGame,oldResume=resumeGame;
  pauseGame=function(){
    if(screen!=='fight'){oldPause();return;}
    if(!fight||fight.state!=='play'||paused)return;
    paused=true;setBlock(false);blockPointers.clear();audio?.suspend();
    $('pause-screen').querySelector('.modal-help').textContent='Take your time. Tap STRIKE to push back. Hold BLOCK when the zombie winds up. SWITCH changes which partner you control. Your partner covers you if your energy runs out.';
    $('pause-screen').style.display='flex';
  };
  resumeGame=function(){
    if(screen!=='fight'){oldResume();return;}
    if(!paused)return;paused=false;if(fight)fight.last=performance.now()/1000;audio?.resume().catch(()=>{});$('pause-screen').style.display='none';
  };
  $('pause-btn').onclick=pauseGame;$('fight-pause').onclick=pauseGame;$('resume-btn').onclick=resumeGame;
  $('restart-btn').onclick=()=>{if(screen==='fight'&&fight){const which=fight.which,next=afterFight;paused=false;$('pause-screen').style.display='none';openFight(which,next);}else{paused=false;startStage();}};
  $('home-btn').onclick=()=>{active=false;paused=false;fight=null;blockPointers.clear();audio?.suspend();$('pause-screen').style.display='none';display('home');};
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&screen==='fight'&&fight?.state==='play'&&!paused)pauseGame();});
  $('continue-btn').onclick=()=>{
    if(level===3)openFight(0,()=>{level=4;openCinematic();});
    else if(level===5)openFight(1,()=>openCinematic(true));
    else{level++;openCinematic();}
  };
  $('start-btn').onclick=()=>{fight=null;totalScore=0;level=0;openCinematic();};
  $('replay-btn').onclick=()=>{fight=null;totalScore=0;level=0;openCinematic();};
  $('how-btn').onclick=()=>{
    $('chapter-dialog').showModal();$('chapter-dialog-title').textContent='HOW TO PLAY';
    $('chapter-help').textContent='Rhythm: tap the arrow when a note meets the line. Hold long notes and press two arrows for paired beats. Your steps animate the story above. Brawls: tap J / STRIKE, hold K / BLOCK when the enemy winds up, and use L / SWITCH to change partners. Every chapter continues, even if you miss. Choose a chapter below to replay.';
  };

  const chapterDialog=document.createElement('dialog');chapterDialog.id='chapter-dialog';
  chapterDialog.innerHTML='<div class="topline"><span class="brand">REPLAY THE NIGHT</span><button id="chapter-close" class="text-btn">CLOSE</button></div><h2 id="chapter-dialog-title">CHOOSE A CHAPTER</h2><p id="chapter-help">Start with the cinematic, then play the rhythm stage. Fighting interludes are available below.</p><div class="chapter-list" id="chapter-list"></div>';
  document.body.append(chapterDialog);
  STAGES.forEach((stage,index)=>{
    const button=document.createElement('button');button.className='chapter-link';
    button.innerHTML=`<img src="${ASSETS[stage.image]}" alt=""><div><span>0${index+1}</span> ${stage.title}<small>Cinematic + rhythm · ${stage.track.toLowerCase()}</small></div>`;
    button.onclick=()=>{chapterDialog.close();fight=null;totalScore=0;level=index;openCinematic();};$('chapter-list').append(button);
  });
  ['BANQUET BRAWL','FIGHT FOR THE REUNION','REUNION CINEMATIC'].forEach((name,index)=>{
    const button=document.createElement('button');button.className='chapter-link';button.textContent=name;
    button.onclick=()=>{chapterDialog.close();totalScore=0;level=index===0?3:5;if(index===2)openCinematic(true);else openFight(index,()=>{if(index===0){level=4;openCinematic();}else openCinematic(true);});};$('chapter-list').append(button);
  });
  $('chapters-btn').onclick=()=>{$('chapter-dialog-title').textContent='CHOOSE A CHAPTER';$('chapter-help').textContent='Replay any cinematic and rhythm stage, or jump into a fighting interlude.';chapterDialog.showModal();};
  $('chapter-close').onclick=()=>chapterDialog.close();
  chapterDialog.addEventListener('click',e=>{if(e.target===chapterDialog){const b=chapterDialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)chapterDialog.close();}});

  // Use a single visual loop. Gameplay pauses do not advance the fight clock.
  let lastVisual=performance.now()/1000;
  function animate(ms){
    const t=ms/1000,dt=Math.min(.5,Math.max(0,t-lastVisual));lastVisual=t;
    if(screen==='game'&&!paused)drawRhythm(t);
    if(screen==='fight'){if(!paused)tickFight(dt);drawFight(reduceMotion?0:t);}
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();
