"""Rebuild canonical passage data; UUID5 IDs are deterministic per edition and source passage.
Editorial cross-check still required; see CONTENT-RIGHTS.md. Source files remain in sources/."""
import json,re,uuid
from pathlib import Path
from bs4 import BeautifulSoup
NAMESPACE=uuid.UUID('534ecea7-7e80-42d7-b67b-e7848acdd5af')
def pid(ref):return str(uuid.uuid5(NAMESPACE,ref))
tao=[]
soup=BeautifulSoup(Path('sources/tao-legge-standard-ebooks.xhtml').read_text(),'xml')
chapters=soup.select('section[id^="chapter-"]');assert len(chapters)==81
for i,ch in enumerate(chapters,1):
 assert ch.get('id')==f'chapter-{i}'
 lines=[]
 for p in ch.find_all('p'):
  for a in p.find_all('a'):a.decompose()
  spans=p.find_all('span',recursive=False)
  # Verse span nodes separated by br; inline language spans belong to prose.
  if p.find('br') and spans:
   for span in spans:
    text=' '.join(span.get_text(' ',strip=True).split())
    if text:lines.append(text)
  else:
   text=' '.join(p.get_text('',strip=False).split())
   if text:lines.append(text)
 tao.append({'number':i,'lines':[{'id':pid(f'legge-1891:chapter-{i}:paragraph-{j}'),'text':line} for j,line in enumerate(lines,1)]})
 assert lines
s=Path('sources/dhammapada-muller-gitenberg.txt').read_text();s=s[s.index('Chapter I. The Twin-Verses'):s.index('End of the Project Gutenberg EBook')]
ch=list(re.finditer(r'(?m)^Chapter ([IVX]+)\.\s*([^\n]+)',s));assert len(ch)==26
dham=[];numbered=[]
for ci,m in enumerate(ch):
 end=ch[ci+1].start() if ci+1<len(ch) else len(s);body=s[m.end():end]
 verses=list(re.finditer(r'(?m)^(\d+)(?:,\s*(\d+))?\.\s*',body));lines=[]
 for j,v in enumerate(verses):
  num=int(v.group(1));endnum=int(v.group(2) or num);endpos=verses[j+1].start() if j+1<len(verses) else len(body)
  text=' '.join(body[v.end():endpos].split())
  if num==127:
   # The Gutenberg transcription mislabels 128 as 127 and omits 127.
   # Restore verse 127 from the separately credited Wikisource Müller transcription.
   assert 'where death could not overcome' in text
   lines.append({'id':pid('muller-1881:verse-127'),'text':'127. Not in the sky, not in the midst of the sea, not if we enter into the clefts of the mountains, is there known a spot in the whole world where a man might be freed from an evil deed.'});numbered.append(127)
   num=endnum=128
  label=f'{num}–{endnum}' if endnum!=num else str(num)
  lines.append({'id':pid(f'muller-1881:verse-{num}-{endnum}'),'text':f'{label}. {text}'})
  numbered.extend(range(num,endnum+1))
 dham.append({'number':ci+1,'name':m.group(2).strip().rstrip('.'),'lines':lines})
assert numbered==list(range(1,424)),[x for x in range(1,424) if x not in numbered]
Path('src/data/completeEditions.json').write_text(json.dumps({'tao':tao,'dhammapada':dham},ensure_ascii=False,indent=2)+'\n')
print('Tao:',len(tao),'chapters;',sum(len(x['lines']) for x in tao),'paragraphs; Dhammapada:',len(dham),'chapters,',len(numbered),'numbered verses')
