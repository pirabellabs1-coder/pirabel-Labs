/**
 * Feuille de style publique du design (/css/site.css) pour les pages rendues par
 * Express (blog, réalisations, carrières…) : polices + jetons + habillage commun.
 * Générée au build à partir des MÊMES sources que les pages Astro.
 */
import globalCss from '../../styles/global.css?raw';
import chromeCss from '../../styles/chrome.css?raw';
import montserratUrl from '@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2?url';
import groteskUrl from '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?url';
import interUrl from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url';

const fonts = `@font-face{font-family:'Montserrat Variable';font-style:normal;font-display:optional;font-weight:100 900;src:url(${montserratUrl}) format('woff2-variations');}
@font-face{font-family:'Space Grotesk Variable';font-style:normal;font-display:optional;font-weight:300 700;src:url(${groteskUrl}) format('woff2-variations');}
@font-face{font-family:'Inter Variable';font-style:normal;font-display:optional;font-weight:100 900;src:url(${interUrl}) format('woff2-variations');}
@font-face{font-family:'Space Grotesk Fallback';src:local('Arial');size-adjust:103.4%;ascent-override:95%;descent-override:29%;line-gap-override:0%;}
@font-face{font-family:'Inter Fallback';src:local('Arial');size-adjust:107.4%;ascent-override:90.2%;descent-override:22.5%;line-gap-override:0%;}
@font-face{font-family:'Montserrat Fallback';src:local('Arial');size-adjust:110.5%;ascent-override:88%;descent-override:22.8%;line-gap-override:0%;}
`;

export function GET() {
  return new Response(fonts + globalCss + '\n' + chromeCss, { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
}
