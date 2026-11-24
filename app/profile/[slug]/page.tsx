import PublicCelestialProfile from '../../../components/PublicCelestialProfile';

export const dynamic='force-dynamic';
export const metadata={robots:{index:false,follow:false}};
export default async function PublicProfilePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 return <PublicCelestialProfile slug={slug}/>;
}
