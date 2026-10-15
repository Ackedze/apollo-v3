const clone=v=>JSON.parse(JSON.stringify(v));
const fail=code=>{throw Error(code);};
function projectFigmaAuthoring(packet,records){
 if(!records)return packet;
 const projected=clone(packet);
 for(const m of records.semantic.mappings){
  if(projected.mappings.some(x=>x.id===m.mappingId))fail('FIGMA_MAPPING_DUPLICATE');
  projected.mappings.push({id:m.mappingId,componentId:m.componentId,target:'figma',platform:m.platform,representationId:m.representationId});
 }
 for(const d of records.profiles.sourceDependencies){
  if(projected.contracts.some(c=>c.pin.componentId===d.componentId))continue;
  const manual=records.manuals.find(m=>m.pin.sha256===d.manual.sha256&&m.pin.path===d.manual.path);
  if(!manual)fail('FIGMA_PORT_AUTHORITY_UNAVAILABLE');
  projected.contracts.push({pin:{componentId:d.componentId,revision:d.revision,archiveSha256:d.archive.sha256,manualSourceHash:d.manualSemanticHash,compiledHash:d.compiledSemanticHash,sourceStatus:'unverified'},manual:clone(manual.manual)});
 }
 // Authoring needs admission data; physical targets stay in the native packet.
 projected.figmaMappingRecords={semantic:clone(records.semantic),typed:clone(records.typed),denials:clone(records.denials),manuals:clone(records.manuals),ruleLinks:{links:records.ruleLinks.links.map(r=>({RuleID:r.RuleID,source:clone(r.source)}))},profiles:{choices:records.profiles.choices.map(c=>({id:c.id,key:c.key,setKey:c.setKey,properties:clone(c.properties)})),sourceDependencies:records.profiles.sourceDependencies.map(d=>({componentId:d.componentId,revision:d.revision,manualSemanticHash:d.manualSemanticHash,compiledSemanticHash:d.compiledSemanticHash,dependencyPins:clone(d.dependencyPins)}))},targets:{profiles:[]}};
 return projected;
}
function admitFigmaComponent(node,packet,platform){
 const records=packet.figmaMappingRecords;if(!records)return null;
 const {createMappingAdapter}=require('./generation-agent-figma-mapping');
 return createMappingAdapter(records).select(node,platform);
}
function projectedContractPins(packet){return packet.contracts.map(c=>c.pin);}
module.exports={projectFigmaAuthoring,admitFigmaComponent,projectedContractPins};
