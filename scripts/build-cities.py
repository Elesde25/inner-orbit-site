"""Build lazy, same-origin autocomplete shards from GeoNames via geonamescache 3.0.2.
Requires geonamescache only during this reproducible data build, not at runtime.
Data CC BY 4.0: https://www.geonames.org/ ; fields selected and names normalized.
"""
import geonamescache,json,unicodedata,re,collections,pathlib,gzip
cache=geonamescache.GeonamesCache(min_city_population=500);countries=cache.get_countries();states=cache.get_us_states();shards=collections.defaultdict(list)
def norm(x):
 x=x.lower().replace('ł','l').replace('ß','ss').replace('ø','o').replace('đ','d').replace('æ','ae').replace('œ','oe')
 return ' '.join(re.sub(r'[^\w\s-]','', ''.join(c for c in unicodedata.normalize('NFD',x) if not unicodedata.combining(c))).replace('-',' ').split())
regions={line.split('\t')[0]:line.split('\t')[1] for line in pathlib.Path('scripts/data/admin1CodesASCII.txt').read_text().splitlines()}
count=0
for c in cache.get_cities().values():
 if not c['timezone']:continue
 region=states.get(c['admin1code'],{}).get('name',c['admin1code']) if c['countrycode']=='US' else regions.get(c['countrycode']+'.'+c['admin1code'],'')
 # Codes disambiguate same-named towns outside the US without inventing region names.
 displayregion=c['admin1code'] if c['countrycode']=='US' else region
 label=', '.join(x for x in [c['name'],displayregion,countries.get(c['countrycode'],{}).get('name',c['countrycode'])] if x)
 aliases=set(norm(a) for a in [c['name']]+c['alternatenames'])
 bykey=collections.defaultdict(list)
 for a in aliases:
  if len(a)<2 or not re.match('^[a-z][a-z0-9 ]',a) or len(a)>90:continue
  bykey[a[:2]].append(a)
 row=[c['geonameid'],label,c['latitude'],c['longitude'],c['timezone'],c['population'],norm(c['name']),norm(region+' '+c['countrycode']+' '+countries.get(c['countrycode'],{}).get('name',''))]
 for key,names in bykey.items():shards[key].append(row+[sorted(names)])
 count+=1
root=pathlib.Path('dist/assets/cities');root.mkdir(parents=True,exist_ok=True)
for old in root.glob('*.json'):
 if old.name!='manifest.json':old.unlink()
for key,rows in shards.items():
 file='-'.join(format(ord(c),'x') for c in key)+'.bin'
 (root/file).write_bytes(gzip.compress(json.dumps(rows,ensure_ascii=False,separators=(',',':')).encode(),mtime=0))
(root/'manifest.json').write_text(json.dumps({'source':'GeoNames via geonamescache 3.0.2','license':'CC BY 4.0','attribution':'https://www.geonames.org/','coverage':'cities500: towns over 500 inhabitants and administrative seats; aliases indexed by normalized Latin spelling','cities':count,'shards':len(shards)},indent=2))
print(count,'cities;',len(shards),'shards;',round(sum(p.stat().st_size for p in root.glob('*.bin'))/1e6,1),'MB total; lazy loading only')
