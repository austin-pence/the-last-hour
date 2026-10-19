export const normalize = s => String(s).toUpperCase().replace(/[^A-Z0-9]/g,'');
export function remaining(state,now){return Math.max(0,(state.remainingMs??3600000)-(state.running?Math.max(0,now-state.anchor):0));}
export function clock(ms){const s=Math.ceil(ms/1000);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
export function validPairs(pairs,count,slots){return pairs.length===count&&new Set(pairs.map(p=>p.murderer+':'+p.accomplice)).size===count&&pairs.every(p=>slots.includes(p.murderer)&&slots.includes(p.accomplice)&&p.murderer!==p.accomplice);}
export function missionAllowance(missions){return 1+Object.values(missions).filter(m=>Object.keys(m.speakers||{}).length<m.required||(m.required===3&&!m.target)).length;}
