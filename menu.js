/* Menu commun AquaPilot : UNE seule définition pour toutes les pages.
   Pour ajouter / renommer / réordonner une entrée, on ne modifie que ce fichier.
   Usage dans une page :  <script src="menu.js"></script> (après profil.js)
     <nav class="nav" id="sidenav"></nav>   …   <nav class="bnav" id="bnav"></nav>
     puis, après chargerProfil() :  montrerMenu('cle_de_la_page');
   Sur index.html (navigation par #) : montrerMenu(niveau, true). */
const MENU=[
  {k:'root',      label:'Accueil',       ic:'home',        href:'index.html'},
  {k:'alertes',   label:'Alertes',       ic:'alerte',      href:'index.html#alertes',   droit:[['jaugeages',1]]},
  {k:'releves',   label:'Relevés',       ic:'releves',     href:'index.html#releves',   droit:[['jaugeages',2],['piezos',2],['traitement',2],['compteurs',2]]},
  {k:'donnees',   label:'Données',       ic:'donnees',     href:'index.html#donnees'},
  {k:'maintenance',label:'Maintenance',  ic:'maintenance', href:'index.html#maintenance'},
  {k:'afaire',    label:'À faire',       ic:'afaire',      href:'taches.html',          droit:[['taches',1]]},
  {k:'docs',      label:'Documentation', ic:'docs',        href:'documentation.html',   droit:[['documentation',1]]},
  {k:'projets',   label:'Fiches projets',ic:'projets',     href:'fiches.html',          droit:[['projets',1]]},
  {k:'planning',  label:'Planning',      ic:'planning',    href:'index.html#planning'},
  {k:'contacts',  label:'Contacts',      ic:'contacts',    href:'index.html#contacts'},
  {k:'utilisateurs',label:'Utilisateurs',ic:'utilisateurs',href:'utilisateurs.html',    droit:'super'}
];
const MENU_BAS=['root','releves','donnees','afaire'];   // barre du bas (mobile)
const MENU_SPRITE=`<svg width="0" height="0" style="position:absolute" aria-hidden="true" id="mn-sprite">
<symbol id="mn-home" viewBox="0 0 96 96"><path d="M26 46 48 28l22 18v24H56V56H40v14H26z"/></symbol>
<symbol id="mn-alerte" viewBox="0 0 96 96"><path d="M48 22v5M34 54V42a14 14 0 0 1 28 0v12c0 4 3 8 6 10H28c3-2 6-6 6-10zM42 70a6 6 0 0 0 12 0"/></symbol>
<symbol id="mn-releves" viewBox="0 0 96 96"><path d="M38 24h20v8H38zM34 28h-6v44h40V28h-6M38 46h20M38 56h20M38 66h12"/></symbol>
<symbol id="mn-donnees" viewBox="0 0 96 96"><path d="M26 70h44M32 62V50M44 62V36M56 62V44M68 62V28"/></symbol>
<symbol id="mn-maintenance" viewBox="0 0 96 96"><path d="M57 26a13 13 0 0 0-12 17L27 61a5.5 5.5 0 0 0 8 8l18-18a13 13 0 0 0 17-12l-8 5-7-7z"/></symbol>
<symbol id="mn-afaire" viewBox="0 0 96 96"><path d="M28 34l5 5 9-10M28 54l5 5 9-10M50 35h18M50 55h18"/></symbol>
<symbol id="mn-docs" viewBox="0 0 96 96"><path d="M48 32c-6-5-14-6-22-5v38c8-1 16 0 22 5 6-5 14-6 22-5V27c-8-1-16 0-22 5zM48 32v38"/></symbol>
<symbol id="mn-projets" viewBox="0 0 96 96"><path d="M24 34a4 4 0 0 1 4-4h12l6 6h22a4 4 0 0 1 4 4v26a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4z"/></symbol>
<symbol id="mn-planning" viewBox="0 0 96 96"><path d="M26 32h44v38H26zM26 42h44M36 26v10M60 26v10M34 52h6M46 52h6M58 52h6M34 61h6M46 61h6"/></symbol>
<symbol id="mn-contacts" viewBox="0 0 96 96"><path d="M35 26l8 2 3 11-6 4c3 7 8 12 15 15l4-6 11 3 2 8c0 4-3 7-7 7-22-1-38-17-39-39 0-4 3-7 7-7z"/></symbol>
<symbol id="mn-utilisateurs" viewBox="0 0 96 96"><path d="M50 38a10 10 0 1 1-20 0a10 10 0 1 1 20 0zM20 74c0-12 9-19 20-19s20 7 20 19zM58 29a9 9 0 1 1 4 17M66 55c8 2 12 8 12 17"/></symbol>
</svg>`;
function menuVisible(m){
  if(!m.droit)return true;
  if(m.droit==='super')return estSuperAdmin();
  return m.droit.some(([mod,n])=>niv(mod)>=n);
}
function menuLien(m,local){            // local = on est sur index.html : liens # sans recharger
  const h=m.href;
  if(local&&h==='index.html')return '#';
  if(local&&h.startsWith('index.html#'))return h.slice(10);
  return h;
}
function montrerMenu(actif,local){
  if(!document.getElementById('mn-sprite'))document.body.insertAdjacentHTML('afterbegin',MENU_SPRITE);
  const a=m=>`<a href="${menuLien(m,local)}"${m.k===actif?' class="on" aria-current="page"':''}><svg class="ic" viewBox="0 0 96 96"><use href="#mn-${m.ic}"/></svg>${m.label}</a>`;
  const lat=document.getElementById('sidenav'),bas=document.getElementById('bnav');
  if(lat)lat.innerHTML=MENU.filter(menuVisible).map(a).join('');
  if(bas)bas.innerHTML=MENU_BAS.map(k=>MENU.find(m=>m.k===k)).filter(menuVisible).map(a).join('');
}
