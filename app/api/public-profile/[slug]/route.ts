import { env } from 'cloudflare:workers';
export const dynamic='force-dynamic';

export async function GET(req:Request){
 const url=new URL(req.url),slug=url.pathname.split('/').pop()||'';
 const hidden=()=>Response.json({error:'This celestial profile is unavailable.'},{status:404,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 if(!/^[a-f0-9]{64}$/.test(slug)||!env.DB)return hidden();
 const row=await env.DB.prepare('SELECT display_name,avatar_form,share_name,share_avatar FROM public_profiles WHERE slug=? AND published=1').bind(slug).first<any>();
 if(!row||(!row.share_name&&!row.share_avatar))return hidden();
 const profile:any={};
 if(row.share_name)profile.displayName=row.display_name;
 if(row.share_avatar)profile.avatarForm=row.avatar_form;
 return Response.json({profile},{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
