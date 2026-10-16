// ── Mode Démo : CSS injecté une fois pour toutes les pages ──────────────
(function injecterCssDemo() {
  const style = document.createElement('style');
  style.textContent = `
    body.mode-demo::before {
      content: '👁️  MODE DÉMO  —  Accès lecture seule';
      display: block;
      background: #f59e0b;
      color: #1c1917;
      text-align: center;
      font-weight: 600;
      font-size: .82rem;
      letter-spacing: .05em;
      padding: 6px 1rem;
      position: sticky;
      top: 0;
      z-index: 10000;
    }
    body.mode-demo input:not([type="search"]),
    body.mode-demo select,
    body.mode-demo textarea {
      background: #f3f4f6 !important;
      color: #9ca3af !important;
      cursor: not-allowed !important;
      border-color: #e5e7eb !important;
    }
    body.mode-demo button:disabled {
      opacity: .4;
      cursor: not-allowed !important;
      pointer-events: none;
    }
    body.mode-demo button[data-lecture] {
      opacity: 1 !important;
      pointer-events: auto !important;
      cursor: pointer !important;
    }
  `;
  document.head.appendChild(style);
})();
/* Profil et droits de l'utilisateur connecté — partagé par toutes les pages.
   Niveaux : 0 aucun · 1 consultation · 2 saisie · 3 gestion
   L'affichage s'adapte, mais c'est la base de données qui fait réellement respecter ces droits. */

/* ── Extraction du prénom depuis l'email ──
   prenom.nom@paysvoironnais.com        → "Prenom"
   jean-philippe.jacquin@paysvoironnais → "Jean-Philippe"
   jbellec@gmail.com                    → null (pas de format prénom.nom) */
function prenomDepuisEmail(email){
  if(!email)return null;
  const local=(email.split('@')[0]||'');
  const dot=local.indexOf('.');
  if(dot<1)return null;                              // pas de point → inconnu
  const part=local.slice(0,dot);                     // tout avant le premier point
  return part.split('-').map(s=>s.charAt(0).toUpperCase()+s.slice(1).toLowerCase()).join('-');
}
/* Nom à afficher : profil.nom > extrait de l'email > null */
function nomAffiche(profil,email){
  return (profil&&profil.nom&&profil.nom.trim())||prenomDepuisEmail(email)||null;
}
const MODULES_DROITS={jaugeages:'Jaugeages',piezos:'Piézomètres',traitement:'Tournées chlore / dioxyde',compteurs:'Index compteurs',documentation:'Documentation',projets:'Fiches projets',maintenance:'Maintenance',taches:'Tâches (À faire)'};
const ROLES={super_admin:'Super admin',chef_equipe:'Chef d\'équipe',agent:'Agent terrain',consultant:'Consultant'};
const NIVEAUX=['Aucun','Consultation','Saisie','Gestion'];

/* ── Thèmes de couleur ── */
const THEMES={
  terracotta:{label:'Terracotta',acc:'#B84712',acc2:'#C2410C',soft:'#FBE9DC',soft2:'#F3D0B5'},
  saphir:    {label:'Saphir',    acc:'#1E6FA8',acc2:'#165A8C',soft:'#DFF0FA',soft2:'#BFDEF5'},
  foret:     {label:'Forêt',     acc:'#267B4A',acc2:'#1E6340',soft:'#DFF2E9',soft2:'#B8E2CB'},
  ardoise:   {label:'Ardoise',   acc:'#4B5563',acc2:'#374151',soft:'#EAEDEF',soft2:'#D4D9E0'},
  prune:     {label:'Prune',     acc:'#7C3AED',acc2:'#6D28D9',soft:'#EDE9FE',soft2:'#DDD6FE'},
};
function appliquerTheme(nom){
  const t=THEMES[nom]||THEMES.terracotta;
  const r=document.documentElement.style;
  r.setProperty('--acc',t.acc);
  r.setProperty('--acc-2',t.acc2);
  r.setProperty('--acc-soft',t.soft);
  r.setProperty('--acc-soft2',t.soft2);
  try{localStorage.setItem('ap-theme',nom);}catch(e){}
}
// ── après la définition de THEMES ──

const DEMO_EMAIL = 'demo@paysvoironnais.com';

function activerModeDemo() {
  document.body.classList.add('mode-demo');

  // Désactiver inputs/selects/textareas
  document.querySelectorAll('input:not([type="search"]), select, textarea').forEach(el => {
    el.disabled = true;
  });

  // Désactiver boutons de saisie (pas ceux marqués data-lecture)
  document.querySelectorAll('button:not([data-lecture]), [type="submit"]').forEach(btn => {
    btn.disabled = true;
  });

  // Bloquer toute soumission de formulaire (filet de sécurité)
  document.addEventListener('submit', e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    toastDemo();
  }, true);
}

function toastDemo() {
  if (document.getElementById('toast-demo')) return;
  const t = document.createElement('div');
  t.id = 'toast-demo';
  t.textContent = '🔒 Mode démo — saisie désactivée';
  t.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);' +
    'background:#92400e;color:#fef3c7;padding:.55rem 1.1rem;border-radius:6px;' +
    'font-size:.88rem;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.3)';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}
/* Appliqué le plus tôt possible (avant même le profil Supabase) */
(function(){try{const n=localStorage.getItem('ap-theme');if(n&&THEMES[n])appliquerTheme(n);}catch(e){}})();

let PROFIL=null;
function niveauParDefaut(role,m){
  if(role==='super_admin'||role==='chef_equipe')return 3;
  if(role==='agent')return ['jaugeages','piezos','traitement','compteurs','projets','maintenance','taches'].includes(m)?2:1;
  return 1;
}
function niv(m){
  if(!PROFIL)return 1;
  if(!PROFIL.actif)return 0;
  if(PROFIL.modules&&PROFIL.modules[m]!=null)return +PROFIL.modules[m];
  return niveauParDefaut(PROFIL.role,m);
}
const estGestionnaire=()=>PROFIL&&PROFIL.actif&&['super_admin','chef_equipe'].includes(PROFIL.role);
const estSuperAdmin=()=>PROFIL&&PROFIL.actif&&PROFIL.role==='super_admin';
async function chargerProfil(db,user){
  const cle='profil-'+user.id;
  try{
    const {data,error}=await db.from('profils').select('*').eq('user_id',user.id).maybeSingle();
    if(error)throw error;
    PROFIL=data||{role:'consultant',modules:{},actif:true,email:user.email};
    try{localStorage.setItem(cle,JSON.stringify(PROFIL));}catch(e){}
  }catch(e){
    try{PROFIL=JSON.parse(localStorage.getItem(cle));}catch(_){}
    PROFIL=PROFIL||{role:'consultant',modules:{},actif:true,email:user.email};
  }
  /* Appliquer le thème stocké en base (prioritaire sur localStorage) */
  if(PROFIL.theme&&THEMES[PROFIL.theme])appliquerTheme(PROFIL.theme);
  /* Mettre à jour l'affichage du nom dans la sidebar (toutes les pages) */
  const whoEl=document.getElementById('who');
  if(whoEl){const n=nomAffiche(PROFIL,PROFIL.email||'');if(n)whoEl.textContent=n;}
  if ((PROFIL.email || user.email) === DEMO_EMAIL) activerModeDemo();
   return PROFIL;
}
/* Peut-on modifier un relevé existant ? (gestion, ou auteur depuis moins de 30 jours) */
function peutModifier(m,ligne,user){
  if(niv(m)>=3)return true;
  if(niv(m)<2)return false;
  if(!ligne.id)return true;
  const auteur=ligne.created_by?ligne.created_by===user.id:ligne.agent===user.email;
  const recent=ligne.created_at?(Date.now()-Date.parse(ligne.created_at))<30*864e5:false;
  return auteur&&recent;
}
const refusDroits=e=>e&&(e.code==='42501'||/row-level security|permission denied/i.test(e.message||''));
function pageSansDroit(texte){
  return `<div style="max-width:520px;margin:60px auto;text-align:center;background:#fff;border:1px solid #E7E1D8;border-radius:14px;padding:28px">
    <div style="font-size:2rem">🔒</div><h2 style="margin:8px 0">Accès non autorisé</h2>
    <p style="color:#7A7068">${texte}</p><p style="margin-top:16px"><a href="index.html" style="color:#B84712;font-weight:600">Retour au portail</a></p></div>`;
}
