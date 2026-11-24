"""Generate public-domain reading text from documented transcription sources."""
import json,uuid,re
from pathlib import Path
from bs4 import BeautifulSoup
N=uuid.UUID('72764f5b-29bf-4afb-a73b-1138dcc822e8')
def pid(s):return str(uuid.uuid5(N,s))
def lines_for(node,prefix):
 for el in node.find_all(['a','sup']):
  if el.name=='sup' or (el.name=='a' and 'endnotes.xhtml' in el.get('href','')):el.decompose()
 result=[]
 for p in node.find_all('p'):
  if p.find_parent('hgroup'):continue
  spans=p.find_all('span',recursive=False)
  if p.find('br') and spans:
   texts=[' '.join(x.get_text('',strip=False).split()) for x in spans]
  else:texts=[' '.join(p.get_text('',strip=False).split())]
  for text in texts:
   if text:result.append({'id':pid(f'{prefix}:{len(result)+1}'),'text':text})
 return result
out={}
out['meditations']=[]
for i in range(1,13):
 s=BeautifulSoup(Path(f'sources/meditations/book-{i}.xhtml').read_text(),'xml');node=s.find('section',id=f'book-{i}');assert node
 ls=lines_for(node,f'long-meditations-{i}');assert ls;out['meditations'].append({'number':i,'lines':ls})
s=BeautifulSoup(Path('sources/enchiridion-george-long.xhtml').read_text(),'xml');sec=s.select('section[id^="the-enchiridion-"]');assert len(sec)==53,len(sec)
out['enchiridion']=[{'number':i,'lines':lines_for(n,f'long-enchiridion-{i}')} for i,n in enumerate(sec,1)]
k=json.loads(Path('sources/ecclesiastes-kjv.json').read_text());assert len(k['chapters'])==12
out['ecclesiastes']=[{'number':int(c['chapter']),'lines':[{'id':pid(f'kjv-eccl-{c["chapter"]}-{v["verse"]}'),'text':f'{v["verse"]}. {v["text"]}'} for v in c['verses']]} for c in k['chapters']]
assert sum(len(c['lines']) for c in out['ecclesiastes'])==222
out['varieties']=[]
for number,filename,title in [(0,'preface','Preface')]+[(i,f'chapter-{i}',f'Lecture group {i}') for i in range(1,15)]+[(15,'afterword','Postscript')]:
 s=BeautifulSoup(Path(f'sources/varieties/{filename}.xhtml').read_text(),'xml');node=s.find('section');assert node
 h=node.find('h2');heading=' '.join(h.get_text(' ',strip=True).split()) if h else title
 ls=lines_for(node,f'james-varieties-{filename}');assert ls;out['varieties'].append({'number':number,'name':heading,'lines':ls})
g=json.loads(Path('sources/gita-telang-transcription.json').read_text())['m'];out['gita']=[]
for ch in range(1,19):
 entries=sorted(((int(k.split('.')[1]),v[0]) for k,v in g.items() if int(k.split('.')[0])==ch),key=lambda x:x[0]);assert entries
 out['gita'].append({'number':ch,'lines':[{'id':pid(f'telang-gita-{ch}-{n}'),'text':t} for n,t in entries]})
Path('src/data/otherEditions.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
for name,chapters in out.items():print(name,'chapters',len(chapters),'passages',sum(len(c['lines']) for c in chapters))
