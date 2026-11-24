export function mergeAccountData(base,local,remote,categories){
 const merged=structuredClone(remote),conflicts=[...remote.conflicts];
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 for(const [key,category] of Object.entries(categories))if(!remote.preferences.sync[category])delete merged.records[key];
 const addConflict=(key,record,source)=>{
  const item={key,value:record?.value??'',updatedAt:record?.updatedAt??Date.now(),source,deleted:!record};
  if(!conflicts.some(existing=>existing.key===item.key&&existing.source===item.source&&existing.value===item.value&&existing.updatedAt===item.updatedAt&&existing.deleted===item.deleted))conflicts.push(item);
 };
 for(const item of local.conflicts){if(remote.preferences.sync[categories[item.key]]&&!base.conflicts.some(old=>same(old,item))&&!conflicts.some(old=>same(old,item)))conflicts.push(item)}
 for(const key of new Set([...Object.keys(base.records),...Object.keys(local.records),...Object.keys(remote.records)])){
  const category=categories[key];if(!category||!remote.preferences.sync[category])continue;
  const old=base.records[key],mine=local.records[key],theirs=remote.records[key];
  const localChanged=!same(old,mine),remoteChanged=!same(old,theirs);
  if(!localChanged)continue;
  if(remoteChanged&&!same(mine,theirs)){addConflict(key,theirs,'account');addConflict(key,mine,'device')}
  if(mine)merged.records[key]=mine;else delete merged.records[key];
 }
 merged.conflicts=conflicts;
 if(conflicts.length>100||JSON.stringify(merged).length>240000)throw new Error('Account sync found too many unresolved changes. Keep this device’s local data and export it before retrying.');
 return merged;
}
