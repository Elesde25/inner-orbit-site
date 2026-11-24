import type { CoverSpec } from '../data/types';
import { coverFrontImage } from '../data/coverArt';
interface Props {bookId:string;cover:CoverSpec;title:string;author:string;size?:'sm'|'md'|'lg';status?:string}
const sizes={sm:'w-28 h-40',md:'w-40 h-60',lg:'w-56 h-80'};
/** Static capture of the identical Three.js artifact. Avoids a WebGL context for every shelf card. */
export default function BookCover({bookId,cover,title,author,size='md'}:Props){
 return <div className={`artifact-scene shelf-artifact ${sizes[size]}`} data-motif={cover.motif} role="img" aria-label={`${title}, an ornate bound book by ${author}`}>
  <img className="shelf-artifact-image" src={`/library-assets/images/book-previews/${bookId}.webp`} alt="" draggable={false} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=coverFrontImage(title)}} />
 </div>
}
