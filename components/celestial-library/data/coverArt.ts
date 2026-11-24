/** Artwork belongs to its title, never to a room or a responsive layout. */
export interface CoverArt { image:string; treatment?:'botanical'|'myth'|'gnostic'|'circles'; }
export const COVER_ART: Record<string,CoverArt> = {
 'Tao Te Ching': {image:'tao'},
 'Bhagavad Gita': {image:'gita'},
 'Meditations': {image:'meditations'},
 'The Millennial Tao': {image:'millennial'},
 'The Luminous Mind — A Field Guide to Consciousness': {image:'consciousness'},
 'Forms of Eternity — A Sacred Geometry Primer': {image:'geometry'},
 'The Dhammapada': {image:'dhammapada'},
 'Ecclesiastes — Wisdom of the Teacher': {image:'ecclesiastes'},
 'Enchiridion': {image:'enchiridion'},
 'The Varieties of Religious Experience': {image:'varieties'},
 'Sacred Plants & Human History — An Educational Survey': {image:'tao', treatment:'botanical'},
 'Archetypes & the Mythic Library Within': {image:'varieties', treatment:'myth'},
 'Gnostic Wisdom & Early Mystical Traditions': {image:'consciousness', treatment:'gnostic'},
 'The Geometry of Wonder': {image:'geometry', treatment:'circles'},
};
export const coverImage = (title:string) => `/library-assets/images/covers/${(COVER_ART[title] || {image:'tao'}).image}.webp`;

/** Front-only artwork crops exclude the photographed binding and fore-edge. */
export const coverFrontImage = (title:string) => `/library-assets/images/covers/fronts/${(COVER_ART[title] || {image:'tao'}).image}.webp`;
