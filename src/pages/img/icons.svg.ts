/** Sprite d'icônes public (/img/icons.svg) pour les pages Express : <svg><use href="/img/icons.svg#i-nom"/></svg>. */
import { spriteSvg } from '../../data/icons';

export function GET() {
  const svg = spriteSvg().replace(' style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"', '');
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
}
