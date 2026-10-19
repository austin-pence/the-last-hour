export const normalize = s => String(s).toUpperCase().replace(/[^A-Z0-9]/g,'');
export function remaining(state,now){return Math.max(0,(state.remainingMs??3600000)-(state.running?Math.max(0,now-state.anchor):0));}
export function clock(ms){const s=Math.ceil(ms/1000);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
export function validPairs(pairs,count,slots){return pairs.length===count&&new Set(pairs.map(p=>p.murderer+':'+p.accomplice)).size===count&&pairs.every(p=>slots.includes(p.murderer)&&slots.includes(p.accomplice)&&p.murderer!==p.accomplice);}
export function missionAllowance(missions){return 1+Object.values(missions).filter(m=>Object.keys(m.speakers||{}).length<m.required||(m.required===3&&!m.target)).length;}
export function roundRemaining(state,now){return state.running?Math.max(0,(state.roundEndsAt||now)-now):Math.max(0,state.roundRemainingMs??((state.roundEndsAt||now)-now));}
export function clockToggle(state,now){if(state.phase==='finished'||state.reveal)throw Error('This game has finished. Reset it to rehearse again.');const patch={remainingMs:remaining(state,now),anchor:now,running:!state.running,paused:state.running};if(state.roundEndsAt||state.roundRemainingMs!==undefined){const left=roundRemaining(state,now);patch.roundRemainingMs=left;patch.roundEndsAt=state.running?null:now+left;}return patch;}
export function gameStatus(state,now){if(state.phase==='finished'||state.reveal)return 'FINISHED';if(state.stage&&remaining(state,now)===0)return 'TIME EXPIRED';if(!state.stage)return '';return state.running?'CLOCK RUNNING':'PAUSED';}
export function initialState(roundId){return {stage:0,running:false,remainingMs:3600000,anchor:0,arrived:false,phase:'lobby',hintCount:0,rally:false,reveal:false,roundId};}
export function resetGame(game,roundId){
  const privateData=structuredClone(game.private);
  delete privateData.allowance;
  for(const mission of Object.values(privateData.missions||{})){delete mission.speakers;delete mission.target;delete mission.roundId;delete mission.savedAt;}
  return {owner:game.owner,slots:Object.fromEntries(Object.entries(game.slots).map(([id,slot])=>[id,{name:slot.name}])),content:structuredClone(game.content),private:privateData,state:initialState(roundId)};
}
