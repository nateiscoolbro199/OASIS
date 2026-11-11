const app=document.getElementById("app");
let screen="home",questionIndex=0,selectedAnswer=null,currentLevel=1;
const SHOP_ITEMS=[
{id:"skip",name:"Question Skip",category:"Power-ups",type:"power",price:150,icon:"⏭️",description:"Skip one question."},
{id:"hint",name:"Smart Hint",category:"Power-ups",type:"power",price:75,icon:"💡",description:"Reveal a helpful clue."},
{id:"double",name:"Double XP",category:"Power-ups",type:"power",price:250,icon:"⚡",description:"Double XP on your next correct answer."},
{id:"second",name:"Second Chance",category:"Power-ups",type:"power",price:100,icon:"🔁",description:"Retry once after a wrong answer."},
{id:"shield",name:"XP Shield",category:"Power-ups",type:"power",price:200,icon:"🛡️",description:"Earn 10 bonus XP if you answer incorrectly."},
{id:"frame_gold",name:"Explorer Frame",category:"Customisation",type:"cosmetic",price:300,icon:"🏅",description:"Unlock a special profile frame."},
{id:"theme_purple",name:"Cosmic Theme",category:"Customisation",type:"cosmetic",price:350,icon:"🟣",description:"Unlock Cosmic Purple."},
{id:"theme_blue",name:"Sky Theme",category:"Customisation",type:"cosmetic",price:350,icon:"🔵",description:"Unlock Sky Blue."},
{id:"title_researcher",name:"Master Researcher",category:"Collections",type:"cosmetic",price:500,icon:"📚",description:"Unlock a profile title."},
{id:"mystery",name:"Mystery Box",category:"Collections",type:"cosmetic",price:400,icon:"🎁",description:"A random cosmetic reward only."}
];
let activeShopCategory="All",powerUps={double:false,second:false,shield:false},hintVisible=false;


const PROFILE_KEY="oasisPlayerProfile";
const avatarChoices=["🧑🏾‍🚀","👩🏽‍🔬","🧑🏻‍⚕️","👨🏽‍🎓","👩🏾‍🚀","🧑🏽‍💻","🦊","🐼","🦁","🐸","🦉","🐢"];
const themeChoices=[
  {id:"teal",name:"Ocean Teal",swatch:"#69e0ba"},
  {id:"purple",name:"Cosmic Purple",swatch:"#b69cff"},
  {id:"blue",name:"Sky Blue",swatch:"#76bfff"},
  {id:"sunset",name:"Sunset Coral",swatch:"#ff9b83"}
];
function loadProfile(){
  try{
    const saved=JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}");
    return {
      name:typeof saved.name==="string"&&saved.name.trim()?saved.name.trim():"Explorer",
      avatar:avatarChoices.includes(saved.avatar)?saved.avatar:avatarChoices[0],
      theme:themeChoices.some(t=>t.id===saved.theme)?saved.theme:"teal"
    };
  }catch(e){return {name:"Explorer",avatar:avatarChoices[0],theme:"teal"};}
}
let PlayerProfile=loadProfile();
function saveProfile(){
  localStorage.setItem(PROFILE_KEY,JSON.stringify(PlayerProfile));
}
function applyTheme(){
  document.querySelectorAll(".app-shell").forEach(el=>el.dataset.theme=PlayerProfile.theme);
}
function nav(title,back="home"){return `<header class="topbar"><button class="icon-btn" data-screen="${back}">‹</button><div class="top-title">${title}</div><div class="mini-xp">⭐ ${GameState.xp} XP</div></header>`}
function render(){screen==="home"?home():screen==="map"?map():screen==="level"?levelScreen():screen==="journal"?journal():screen==="shop"?shop():profile();applyTheme()}
function home(){app.innerHTML=`<main class="app-shell" data-theme="${PlayerProfile.theme}"><section class="hero"><div class="logo">O</div><div><small>EDUCATIONAL ADVENTURE</small><h1>OASIS</h1><p>Explore. Learn. Discover.</p></div><b>80% BUILD</b></section><section class="player"><div class="avatar">${PlayerProfile.avatar}</div><div><strong>${escapeHTML(PlayerProfile.name)}</strong><span>Level ${GameState.level} • ${GameState.xp} XP</span><div class="progress"><i style="width:${GameState.xp%100}%"></i></div></div></section><button class="primary" data-screen="map">▶ CONTINUE ADVENTURE</button><div class="grid"><button data-screen="shop">🛒<strong>XP Shop</strong><small>Spend your XP</small></button><button data-screen="journal">📖<strong>Knowledge Journal</strong><small>Collected discoveries</small></button><button data-screen="profile">🏆<strong>My Profile</strong><small>${GameState.badges.length} badges</small></button></div><div class="notice">🚧 <div><strong>Prototype in progress</strong><p>Characters, sounds, animations and more levels are still being developed.</p></div></div>${bottom("home")}</main>`;bind()}
function map(){app.innerHTML=`<main class="app-shell" data-theme="${PlayerProfile.theme}">${nav("OASIS MAP")}<section class="intro"><small>MISSION PROGRESS</small><h2>Choose your destination</h2><p>Complete each location to unlock the next part of the adventure. Your progress: ${GameState.completed.length}/8 levels.</p></section><section class="map">${Levels.map((l,i)=>{let u=l.id<=GameState.level,c=GameState.completed.includes(l.id);return `<button class="node ${u?"":"locked"} ${c?"done":""}" data-level="${l.id}" ${u?"":"disabled"}><span>${u?l.icon:"🔒"}</span><div><small>LEVEL ${l.id}</small><strong>${l.name}</strong><em>${c?"✓ Completed":u?"Available":"Locked"}</em></div></button>${i<7?`<div class="line ${GameState.level>l.id?"on":""}"></div>`:""}`}).join("")}</section><div class="notice">🧭 <div><strong>Keep exploring</strong><p>Complete each mission to unlock the next location.</p></div></div>${bottom("map")}</main>`;bind()}
function levelScreen(){
  const level=Levels.find(l=>l.id===currentLevel);
  const levelQuestions=Questions["level"+currentLevel]||[];
  const q=levelQuestions[questionIndex];
  if(!level||!q){screen="map";render();return;}
  app.innerHTML=`<main class="app-shell" data-theme="${PlayerProfile.theme}">${nav(level.name.toUpperCase(),"map")}
    <section class="level"><div class="bigicon">${level.icon}</div><small>LEVEL ${level.id} OF 8</small><h2>${level.name}</h2><p>${level.description}</p></section>
    <section class="mentor">👩🏽‍⚕️ <div><strong>Dr. Maya</strong><span>OASIS Mentor</span></div></section>
    <div class="dialogue">“Welcome to ${level.name}. Read each question carefully and use what you have learned to complete this mission.”</div>
    <section class="mission"><div class="missionhead">MISSION ${questionIndex+1}/${levelQuestions.length} <span>+50 XP</span></div><h3>${q.question}</h3>
      <div class="answers">${q.answers.map((a,i)=>`<button class="${selectedAnswer===i?"selected":""}" data-answer="${i}"><b>${String.fromCharCode(65+i)}</b>${a}</button>`).join("")}</div>
      <div class="quiz-tools">
 <button data-power="skip" ${GameState.count("skip")<1?"disabled":""}>⏭️ Skip (${GameState.count("skip")})</button>
 <button data-power="hint" ${GameState.count("hint")<1?"disabled":""}>💡 Hint (${GameState.count("hint")})</button>
 <button data-power="double" ${GameState.count("double")<1?"disabled":""}>⚡ Double XP (${GameState.count("double")})</button>
 <button data-power="second" ${GameState.count("second")<1?"disabled":""}>🔁 Second chance (${GameState.count("second")})</button>
 <button data-power="shield" ${GameState.count("shield")<1?"disabled":""}>🛡️ XP Shield (${GameState.count("shield")})</button>
 </div>${hintVisible?`<div class="hint-box">💡 Hint: ${escapeHTML(q.hint||"Think about the key idea in this level and eliminate options that do not fit.")}</div>`:""}
 <button class="submit" ${selectedAnswer===null?"disabled":""}>CHECK ANSWER</button><div id="feedback"></div>
    </section><div class="unfinished">Educational content only • Ask a qualified healthcare professional about real health concerns.</div></main>`;
  bind();
  applyTheme();
}
function advanceQuestion(){
 const qs=Questions["level"+currentLevel]||[];
 if(questionIndex<qs.length-1){questionIndex++;selectedAnswer=null;hintVisible=false;render();}
 else{GameState.complete(currentLevel,Levels[currentLevel-1].name+" Discovery");screen="map";questionIndex=0;selectedAnswer=null;hintVisible=false;render();}
}
function powerMessage(msg,cls="good"){const f=document.getElementById("feedback");if(f){f.className=cls;f.textContent=msg;}}
function usePower(id){
 if(!GameState.useItem(id)){powerMessage("You do not have this item.","bad");return;}
 if(id==="skip"){powerMessage("Question skipped. No XP earned for this question.");setTimeout(advanceQuestion,600);return;}
 if(id==="hint"){hintVisible=true;render();return;}
 if(id==="double"){powerUps.double=true;powerMessage("Double XP is active for your next correct answer.");render();return;}
 if(id==="second"){powerUps.second=true;powerMessage("Second Chance is ready for this question.");render();return;}
 if(id==="shield"){powerUps.shield=true;powerMessage("XP Shield is ready for this question.");render();return;}
}
function answer(){
 if(selectedAnswer===null)return;
 const qs=Questions["level"+currentLevel]||[],q=qs[questionIndex],f=document.getElementById("feedback");if(!q||!f)return;
 if(selectedAnswer===q.correct){
  const earned=powerUps.double?100:50;GameState.addXP(earned);
  powerUps.double=false;powerUps.second=false;powerUps.shield=false;
  f.className="good";f.textContent="✓ Correct! You earned "+earned+" XP. "+(q.explanation||"");
  setTimeout(advanceQuestion,900);
 }else if(powerUps.shield){
  powerUps.shield=false;GameState.addXP(10);f.className="bad";f.textContent="Not quite, but your XP Shield gave you 10 bonus XP. Try again.";
 }else if(powerUps.second){
  powerUps.second=false;f.className="bad";f.textContent="Not quite. Your Second Chance has been used — try again.";
 }else{f.className="bad";f.textContent="Not quite. Try again and think about the information in this level.";}
}
function shop(){
 const cats=["All","Power-ups","Customisation","Collections"];
 const items=SHOP_ITEMS.filter(x=>activeShopCategory==="All"||x.category===activeShopCategory);
 app.innerHTML=`<main class="app-shell" data-theme="${PlayerProfile.theme}">${nav("OASIS XP SHOP")}
 <section class="shop-wallet"><small>YOUR XP BALANCE</small><strong>⭐ ${GameState.xp} XP</strong></section>
 <section class="intro"><small>UPGRADE YOUR ADVENTURE</small><h2>Spend your XP</h2><p>Buy useful power-ups or unlock cosmetic rewards.</p></section>
 <div class="shop-tabs">${cats.map(c=>`<button class="${activeShopCategory===c?"active":""}" data-shop-category="${c}">${c}</button>`).join("")}</div>
 <section class="shop-grid">${items.map(x=>`<article class="shop-item"><div class="shop-item-icon">${x.icon}</div><div class="shop-item-info"><strong>${x.name}</strong><p>${x.description}</p><small>${x.type==="power"?"Owned: "+GameState.count(x.id):(GameState.count(x.id)?"Unlocked":"One-time unlock")}</small></div><div class="shop-buy"><b>⭐ ${x.price}</b><button data-buy="${x.id}" ${GameState.xp<x.price||(x.type==="cosmetic"&&GameState.count(x.id))?"disabled":""}>${x.type==="cosmetic"&&GameState.count(x.id)?"OWNED":"BUY"}</button></div></article>`).join("")}</section>
 <section class="inventory-panel"><h3>🎒 Your inventory</h3>${Object.entries(GameState.inventory).length?Object.entries(GameState.inventory).map(([id,n])=>{let x=SHOP_ITEMS.find(y=>y.id===id);return x?`<div class="inventory-row"><span>${x.icon} ${x.name}</span><b>${x.type==="power"?"x"+n:"Unlocked"}</b></div>`:""}).join(""):`<p class="empty">Your inventory is empty.</p>`}</section>
 <section class="inventory-panel"><h3>🧾 Recent purchases</h3>${GameState.purchases.length?GameState.purchases.slice(0,5).map(p=>`<div class="inventory-row"><span>${escapeHTML(p.name)}</span><small>${escapeHTML(p.date)}</small><b>−${p.price} XP</b></div>`).join(""):`<p class="empty">No purchases yet.</p>`}</section>
 <p class="unfinished">Mystery Boxes contain cosmetic rewards only.</p>${bottom("shop")}</main>`;bind();
}
function buyShopItem(id){
 const item=SHOP_ITEMS.find(x=>x.id===id);if(!item)return;
 if(GameState.xp<item.price){alert("You do not have enough XP.");return;}
 if(item.type==="cosmetic"&&GameState.count(id)){alert("You already own this item.");return;}
 if(!confirm("Buy "+item.name+" for "+item.price+" XP?"))return;
 if(id==="mystery"){
  const choices=["frame_gold","theme_purple","theme_blue","title_researcher"].filter(x=>!GameState.count(x));
  if(!choices.length){alert("You own all mystery rewards.");return;}
  const reward=choices[Math.floor(Math.random()*choices.length)];
  if(GameState.buy(item)){GameState.addItem(reward);alert("Mystery Box reward: "+SHOP_ITEMS.find(x=>x.id===reward).name);}
 }else if(GameState.buy(item)){alert(item.name+" added to your inventory!");}
 render();
}

function journal(){app.innerHTML=`<main class="app-shell" data-theme="${PlayerProfile.theme}">${nav("KNOWLEDGE JOURNAL")}<section class="intro"><div class="book">📖</div><h2>Your discoveries</h2><p>Important information collected during the adventure appears here.</p></section><article>🩺 <div><strong>Gynecology</strong><p>A medical field focused on the female reproductive system and related health.</p></div></article><article>🤰 <div><strong>Obstetrics</strong><p>A medical field focused on pregnancy, childbirth and care around this period.</p></div></article><div class="lockedbox">🔒 Complete more levels to discover new entries.</div>${bottom("journal")}</main>`;bind()}
function profile(){
  app.innerHTML=`<main class="app-shell" data-theme="${PlayerProfile.theme}">${nav("MY PROFILE")}
  <section class="profile">
    <div class="bigavatar" id="profilePreviewAvatar">${PlayerProfile.avatar}</div>
    <h2 id="profilePreviewName">${escapeHTML(PlayerProfile.name)}</h2>
    <p>OASIS Learner</p>
    <div class="stats"><div><b>${GameState.level}</b><small>Level</small></div><div><b>${GameState.xp}</b><small>XP</small></div><div><b>${GameState.badges.length}</b><small>Badges</small></div></div>
  </section>
  <section class="customize-panel">
    <h3>✏️ Customize your profile</h3>
    <label class="custom-label" for="playerName">Profile name</label>
    <input id="playerName" class="profile-input" maxlength="20" value="${escapeHTML(PlayerProfile.name)}" placeholder="Enter your player name">
    <h4>Choose a profile picture</h4>
    <div class="avatar-picker">${avatarChoices.map(a=>`<button type="button" class="avatar-choice ${PlayerProfile.avatar===a?"chosen":""}" data-avatar="${a}" aria-label="Choose avatar ${a}">${a}</button>`).join("")}</div>
    <h4>Choose your page theme</h4>
    <div class="theme-picker">${themeChoices.map(t=>`<button type="button" class="theme-choice ${PlayerProfile.theme===t.id?"chosen":""}" data-theme-choice="${t.id}"><span style="background:${t.swatch}"></span>${t.name}</button>`).join("")}</div>
    <button class="primary save-profile" id="saveProfile">SAVE CHANGES</button>
    <p class="save-message" id="saveMessage" aria-live="polite"></p>
  </section>
  <section class="badges"><h3>Badges</h3>${GameState.badges.length?GameState.badges.map(x=>`<div>🏅 ${x}</div>`).join(""):`<div class="empty">No badges yet. Complete Level 1 to earn your first.</div>`}</section>
  <button class="reset" id="reset">Reset prototype progress</button>${bottom("profile")}</main>`;
  bind();
  applyTheme();
}
function escapeHTML(value){
  return String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function bottom(active){return `<nav class="bottom">${["home","map","shop","journal","profile"].map((x,i)=>`<button class="${active===x?"active":""}" data-screen="${x}">${["⌂","🗺","🛒","📖","👤"][i]}<small>${x[0].toUpperCase()+x.slice(1)}</small></button>`).join("")}</nav>`}
function bind(){document.querySelectorAll("[data-screen]").forEach(b=>b.addEventListener("click",()=>{screen=b.dataset.screen;render()}));document.querySelectorAll("[data-level]").forEach(b=>b.addEventListener("click",()=>{if(+b.dataset.level<=GameState.level){const chosenLevel=+b.dataset.level;if(chosenLevel!==currentLevel){questionIndex=0;selectedAnswer=null;}currentLevel=chosenLevel;screen="level";render()}}));document.querySelectorAll("[data-answer]").forEach(b=>b.addEventListener("click",()=>{selectedAnswer=+b.dataset.answer;render()}));let s=document.querySelector(".submit");if(s)s.addEventListener("click",answer);let r=document.getElementById("reset");if(r)r.addEventListener("click",()=>{GameState.reset();screen="home";render()});
document.querySelectorAll("[data-shop-category]").forEach(b=>b.addEventListener("click",()=>{activeShopCategory=b.dataset.shopCategory;render()}));
document.querySelectorAll("[data-buy]").forEach(b=>b.addEventListener("click",()=>buyShopItem(b.dataset.buy)));
document.querySelectorAll("[data-power]").forEach(b=>b.addEventListener("click",()=>usePower(b.dataset.power)));
document.querySelectorAll("[data-avatar]").forEach(b=>b.addEventListener("click",()=>{
  PlayerProfile.avatar=b.dataset.avatar;
  document.querySelectorAll("[data-avatar]").forEach(x=>x.classList.toggle("chosen",x.dataset.avatar===PlayerProfile.avatar));
  let preview=document.getElementById("profilePreviewAvatar");if(preview)preview.textContent=PlayerProfile.avatar;
}));
document.querySelectorAll("[data-theme-choice]").forEach(b=>b.addEventListener("click",()=>{
  PlayerProfile.theme=b.dataset.themeChoice;
  document.querySelectorAll("[data-theme-choice]").forEach(x=>x.classList.toggle("chosen",x.dataset.themeChoice===PlayerProfile.theme));
  applyTheme();
}));
let save=document.getElementById("saveProfile");
if(save)save.addEventListener("click",()=>{
  const field=document.getElementById("playerName");
  PlayerProfile.name=(field.value.trim()||"Explorer").slice(0,20);
  saveProfile();
  const preview=document.getElementById("profilePreviewName");if(preview)preview.textContent=PlayerProfile.name;
  const homeName=document.querySelector(".player strong");if(homeName)homeName.textContent=PlayerProfile.name;
  const message=document.getElementById("saveMessage");if(message)message.textContent="✓ Your profile has been saved!";
});}
render();