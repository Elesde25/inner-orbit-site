'use strict';
function installNativeLibrary(){
 destinations.push(['library','Celestial Library','LIBRARY']);
 gatewayRealms.push('library');
 realms.push({id:'library',symbol:'▤',title:'Celestial Library',sub:'LIBRARY',description:'Four realms of wisdom and wonder',copy:'Explore books, Living Pages and interpretation layers. Save reading progress, highlights and notes to your account.',action:'Enter the Celestial Library',x:88,y:100,color:'gold'});
 const previousPurpose=realmPurpose;realmPurpose=function(id){return id==='library'?{label:'LIBRARY',copy:'Read, explore and keep your own Inner Ledger.'}:previousPurpose(id)};
 const previousIcon=destinationIcon;destinationIcon=function(id){return id==='library'?'<span class="destination-icon" aria-hidden="true"><img src="/library-assets/images/book-previews/tao-te-ching.webp" alt="" loading="lazy"></span>':previousIcon(id)};
 const previousObject=celestialObject;celestialObject=function(id,extra=''){return id==='library'?`<span class="library-celestial-object ${extra}" aria-hidden="true"><img src="/library-assets/images/book-previews/tao-te-ching.webp" alt="" loading="lazy"></span>`:previousObject(id,extra)};
 views.library=()=>{location.replace('/library');return '<p>Entering the Celestial Library…</p>'};views['realm-library']=views.library;
 document.addEventListener('click',e=>{const a=e.target.closest('a[href="#library"]');if(a){e.preventDefault();location.href='/library'}});
 const ledger=document.createElement('a');ledger.href='/library?ledger=1';ledger.textContent='▤ Inner Ledger';ledger.className='global-ledger-link';document.body.append(ledger);
}
