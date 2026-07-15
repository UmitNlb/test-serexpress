/* ---------- existing script above unchanged ---------- */

// NAV
var nav=document.getElementById('nav');
window.addEventListener('scroll',function(){nav.classList.toggle('s',window.scrollY>55)},{passive:true});

// MOBILE MENU
var mobOpen=false;
function toggleMob(){
  mobOpen=!mobOpen;
  var m=document.getElementById('mob'),b=document.getElementById('burger');
  if(mobOpen){m.style.display='flex';requestAnimationFrame(function(){m.style.opacity='1'});}
  else{m.style.opacity='0';setTimeout(function(){m.style.display='none'},300);}
  b.classList.toggle('open',mobOpen);
  document.body.style.overflow=mobOpen?'hidden':'';
}
function closeMob(){
  mobOpen=false;
  var m=document.getElementById('mob');
  m.style.opacity='0';
  setTimeout(function(){m.style.display='none'},300);
  document.getElementById('burger').classList.remove('open');
  document.body.style.overflow='';
}

// REVEAL
var io=new IntersectionObserver(function(e){
  e.forEach(function(x){if(x.isIntersecting){x.target.classList.add('on');io.unobserve(x.target);}});
},{threshold:0.15,rootMargin:"0px 0px -80px 0px"});
document.querySelectorAll('.rv').forEach(function(el){io.observe(el);});

// COUNTERS
var counted=false;
var sb=document.querySelector('.stats-bar');
var cio=new IntersectionObserver(function(e){
  if(e[0].isIntersecting&&!counted){
    counted=true;
    document.querySelectorAll('.stat-n[data-target]').forEach(function(el){
      var target=parseInt(el.dataset.target),suf=el.querySelector('span').textContent,n=0,step=target/55;
      el.closest('.stat').classList.add('on');
      var t=setInterval(function(){n=Math.min(n+step,target);el.innerHTML=Math.round(n)+'<span>'+suf+'</span>';if(n>=target)clearInterval(t);},18);
    });
  }
},{threshold:0.5});
if(sb)cio.observe(sb);

// COOKIE
function acceptCk(){document.getElementById('ck').classList.remove('show');localStorage.setItem('ck','1');}
function openRgpd(){document.getElementById('rgpd').classList.add('show');}
function closeRgpd(){document.getElementById('rgpd').classList.remove('show');}
function saveRgpd(){closeRgpd();document.getElementById('ck').classList.remove('show');localStorage.setItem('ck','1');}
document.getElementById('rgpd').addEventListener('click',function(e){if(e.target===this)closeRgpd();});
window.addEventListener('load',function(){
  // Cookie banner — afficher si pas encore accepté
  var ck=document.getElementById('ck');
  if(!ck)return;
  var accepted=false;
  try{accepted=!!localStorage.getItem('ck')}catch(e){}
  if(!accepted){setTimeout(function(){ck.classList.add('show');},1000);}
});

// FORM
var step=1;

function updateStepUI(){
  [1,2,3].forEach(function(i){
    var n=document.getElementById('fsn'+i),l=document.getElementById('fsl'+i),s=document.getElementById('fsep'+i);
    if(!n)return;
    var done=i<step,on=i===step;
    n.className='fs-n'+(done?' ok':on?' on':'');
    l.className='fs-l'+(done?' ok':on?' on':'');
    if(s)s.className='fs-sep'+(done?' ok':'');
  });
}

function goStep(n){
  // Validation
  if(n>step&&step===1){
    var p=document.getElementById('f_prenom').value.trim();
    var nm=document.getElementById('f_nom').value.trim();
    var em=document.getElementById('f_email').value.trim();
    var tel=document.getElementById('f_tel').value.trim();
    if(!p){alert('Veuillez entrer votre pr\u00e9nom.');document.getElementById('f_prenom').focus();return;}
    if(!nm){alert('Veuillez entrer votre nom.');document.getElementById('f_nom').focus();return;}
    if(!em||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){alert('Adresse email invalide.');document.getElementById('f_email').focus();return;}
    if(!tel){alert('Veuillez entrer votre num\u00e9ro de t\u00e9l\u00e9phone.');document.getElementById('f_tel').focus();return;}
  }
  if(n>step&&step===2){
    if(!document.getElementById('f_service').value){alert('Veuillez s\u00e9lectionner un service.');return;}
  }
  // Masquer panel actuel
  document.getElementById('sp'+step).classList.remove('active');
  // Mettre à jour le step JS compat
  var od=document.getElementById('sd'+step);
  if(od){od.classList.remove('active');od.classList.add('done');od.textContent='\u2713';}
  if(n>step){var sl=document.getElementById('sl'+step);if(sl)sl.classList.add('done');}
  step=n;
  // Afficher nouveau panel
  document.getElementById('sp'+n).classList.add('active');
  var nd=document.getElementById('sd'+n);
  if(nd){nd.classList.add('active');nd.classList.remove('done');nd.textContent=n;}
  updateStepUI();
}

function pickSrv(el,val){
  document.querySelectorAll('.srv-item').forEach(function(i){i.classList.remove('on');});
  el.classList.add('on');
  document.getElementById('f_service').value=val;
}

function sendMail(){
  var prenom=document.getElementById('f_prenom').value.trim();
  var nom=document.getElementById('f_nom').value.trim();
  var email=document.getElementById('f_email').value.trim();
  var tel=document.getElementById('f_tel').value.trim();
  var service=document.getElementById('f_service').value;
  var adresse=document.getElementById('f_adresse').value.trim();
  var dateEl=document.getElementById('f_date');
  var dateSouhaitee='';
  if(dateEl&&dateEl.value){var p=dateEl.value.split('-');dateSouhaitee=p.length===3?p[2]+'-'+p[1]+'-'+p[0]:dateEl.value;}
  var urgence=document.getElementById('f_urgence_switch').checked?'Oui':'Non';
  var message=document.getElementById('f_message').value.trim();
  var source=document.getElementById('f_source').value;
  if(!service){alert('Veuillez s\u00e9lectionner un service.');goStep(2);return;}
  var btn=document.getElementById('sendBtn'),txt=document.getElementById('sendTxt');
  btn.disabled=true;txt.textContent='Envoi en cours...';
  var now=new Date();
  var date=now.toLocaleDateString('fr-FR')+' \u00e0 '+now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  fetch('https://formspree.io/f/xzdoobkv',{
    method:'POST',
    headers:{'Accept':'application/json','Content-Type':'application/json'},
    body:JSON.stringify({
      _replyto:email,
      _subject:'Nouveau devis Sernettoyage - '+service,
      Nom:prenom+' '+nom,
      Email:email,
      Telephone:tel,
      Service:service,
      Adresse:adresse||'Non pr\u00e9cis\u00e9e',
      Date_souhaitee:dateSouhaitee||'Non pr\u00e9cis\u00e9e',
      Urgence:urgence,
      Message:message||'Aucun message',
      Source:source||'Non renseign\u00e9',
      Date:date
    })
  })
  .then(function(res){
    if(res.ok){
      document.getElementById('fForm').style.display='none';
      document.getElementById('fOk').classList.add('show');
    } else {
      return res.json().then(function(d){throw new Error(d.error||'Erreur '+res.status);});
    }
  })
  .catch(function(err){
    btn.disabled=false;
    txt.textContent='Envoyer ma demande';
    alert('Erreur d\'envoi. Contactez-nous directement : serexpress45@gmail.com');
  });
}

/* ---------- Page transition overlay behavior (disabled) ---------- */
/* The overlay animation has been removed: internal anchor clicks and hash changes use default behavior. */
(function(){
  // No interception of anchor clicks — allow normal navigation and browser handling.
  // Keep the overlay element present (unchanged in DOM/CSS) but do not toggle it.
  // This preserves styles and other scripts that may reference the overlay without altering behavior.
  // No-op handlers kept intentionally minimal.
  // If needed later, reintroduce custom behavior here.
})();