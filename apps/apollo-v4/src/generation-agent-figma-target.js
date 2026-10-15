// Finite native realization supported by the reviewed source provider.
// Authoring manuals remain normative. Never infer away explicit ScreenSpec props.
const source=require('./generation-agent-figma-source.json');
const generic=source.genericMapping?require('./generation-agent-figma-mapping').createMappingAdapter(source.genericMapping):null;
function componentTarget(node){
 if(generic){try{const selected=generic.select(node,source.capabilityPlatform);if(selected)return{choice:selected.choice.id,properties:selected.choice.properties,issues:[]};}catch(e){return{choice:null,properties:{},issues:[e.message]};}}
 const props=node.props||{},issues=[],own=k=>Object.prototype.hasOwnProperty.call(props,k);
 if(node.mappingId==='arui-private.corporate-content.desktop'){
  if(Object.keys(props).length)issues.push('FIGMA_TARGET_PROP_UNSUPPORTED');
  if(Object.keys(node.slots||{}).some(k=>k!=='body')||node.actions)issues.push('FIGMA_TARGET_SLOT_UNSUPPORTED');
  return{choice:'cc.desktop',properties:{},issues};
 }
 if(node.mappingId!=='arui-private.buttons-group.desktop')return{choice:null,properties:{},issues:['FIGMA_TARGET_MAPPING_UNAVAILABLE']};
 if(Object.keys(props).some(k=>!['size','overflow'].includes(k)))issues.push('FIGMA_TARGET_PROP_UNSUPPORTED');
 if(own('size')&&props.size!=='56'||own('overflow')&&!['false','true'].includes(props.overflow))issues.push('FIGMA_TARGET_VALUE_UNSUPPORTED');
 if(Object.keys(node.slots||{}).length)issues.push('FIGMA_TARGET_SLOT_UNSUPPORTED');
 const count=node.actions?.items.length||0,overflow=own('overflow')?props.overflow==='true':count>4;
 if(node.actions&&(node.actions.port!=='button-label'||count>5))issues.push('FIGMA_TARGET_ACTIONS_UNSUPPORTED');
 if(node.actions&&overflow!==(count>4))issues.push('FIGMA_OVERFLOW_ACTIONS_CONFLICT');
 return{choice:'bg.size56.overflow.'+String(overflow),properties:{Size:'56',Overflow:String(overflow)},issues};
}
function matchingProperties(properties,target){return target.issues.length===0&&Object.entries(target.properties).every(([name,value])=>{const actual=Array.isArray(properties)?properties.find(p=>p.name===name):properties?.[name];return actual?.type==='VARIANT'&&actual.value===value;});}
module.exports={componentTarget,matchingProperties};
