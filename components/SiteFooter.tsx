export default function SiteFooter(){
 return <footer className="site-footer">
  <a className="site-footer-brand" href="/#home">INNER ORBIT <span aria-hidden="true">✧</span></a>
  <nav aria-label="Explore destinations">
   <a href="/#home">Soul Hub</a>
   <a href="/#directory">Destinations</a>
   <a href="/#blueprint">Blueprint</a>
   <a href="/#journey">Journey</a>
   <a href="/library">Celestial Library</a>
   <details className="site-footer-more">
    <summary>More</summary>
    <div className="site-footer-more-menu">
     <a href="/#connections">Connections</a>
     <a href="/alchemy">Inner Alchemy</a>
     <a href="/#guides">Spirit Guides</a>
     <a href="/#rewards">Stardust &amp; Access</a>
     <a href="/#supporters">Our Supporters</a>
    </div>
   </details>
  </nav>
 </footer>;
}
