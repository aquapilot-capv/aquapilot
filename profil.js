/* Profil et droits de l'utilisateur connecté — partagé par toutes les pages.
   Niveaux : 0 aucun · 1 consultation · 2 saisie · 3 gestion
   L'affichage s'adapte, mais c'est la base de données qui fait réellement respecter ces droits. */
const MODULES_DROITS={jaugeages:'Jaugeages',piezos:'Piézomètres',traitement:'Tournées chlore / dioxyde',documentation:'Documentation',projets:'Fiches projets',maintenance:'Maintenance'};
const ROLES={super_admin:'Super admin',chef_equipe:'Chef d\'équipe',agent:'Agent terrain',consultant:'Consultant'};
const NIVEAUX=['Aucun','Consultation','Saisie','Gestion'];
let PROFIL=null;
function niveauParDefaut(role,m){
  if(role==='super_admin'||role==='chef_equipe')return 3;
  if(role==='agent')return ['jaugeages','piezos','traitement','projets','maintenance'].includes(m)?2:1;
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
  }catch(e){ // hors connexion ou script 17 non lancé : dernier profil connu, sinon consultation
    try{PROFIL=JSON.parse(localStorage.getItem(cle));}catch(_){}
    PROFIL=PROFIL||{role:'consultant',modules:{},actif:true,email:user.email};
  }
  return PROFIL;
}
/* Peut-on modifier un relevé existant ? (gestion, ou auteur depuis moins de 30 jours) */
function peutModifier(m,ligne,user){
  if(niv(m)>=3)return true;
  if(niv(m)<2)return false;
  if(!ligne.id)return true;                         // encore en attente d'envoi : c'est le sien
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
