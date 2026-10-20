export const RANDOM_MODE='random-murderers-v2';
export const murdererCount=n=>{if(!Number.isInteger(n)||n<2)throw Error('At least two active players must join.');return Math.min(n-1,Math.max(1,Math.round(n*.2)));};
function randomIndex(n){const ceiling=Math.floor(4294967296/n)*n,a=new Uint32Array(1);do{crypto.getRandomValues(a);}while(a[0]>=ceiling);return a[0]%n;}
export function shuffled(values,pick=randomIndex){const out=[...values];for(let i=out.length-1;i>0;i--){const j=pick(i+1);if(!Number.isInteger(j)||j<0||j>i)throw Error('Invalid random draw.');[out[i],out[j]]=[out[j],out[i]];}return out;}
export function prepareReplay(game){const fresh=structuredClone(game);fresh.state.mode=RANDOM_MODE;fresh.private.roles=Object.fromEntries(Object.keys(fresh.slots).map(id=>[id,{role:'PENDING',instructions:'Your private role is drawn when the host starts.'}]));for(const key of ['missions','agendas','agendaResults','randomDecision','participants','allowance','agendaDecision','lastRecovery','lastAttendance'])delete fresh.private[key];return fresh;}
export function startRandomGame(game,anchor,pick=randomIndex){
 if(game.state.stage!==0)throw Error('This game has already started.');
 const ids=Object.keys(game.slots).filter(id=>!game.slots[id].absent);
 if(ids.some(id=>!game.slots[id].uid))throw Error('Every active player must join. Mark missing players away first.');
 if(!game.private.agendaPool?.length)throw Error('The host agenda library is missing.');
 const count=murdererCount(ids.length),chosen=shuffled(ids,pick).slice(0,count),pool=shuffled(game.private.agendaPool||[],pick),target=Math.min(3,ids.length-count),next=prepareReplay(game);
 next.private.roles={};next.private.agendas={};next.private.participants=Object.fromEntries(ids.map(id=>[id,true]));
 for(const id of Object.keys(game.slots)){if(!ids.includes(id)){next.private.roles[id]={role:'OBSERVER',instructions:'You were away when roles were drawn. If you return, help with puzzles; you are not a suspect this round.'};continue;}if(chosen.includes(id)){const agenda=pool[chosen.indexOf(id)%pool.length],mission=agenda.text.replace('{target}',String(target));next.private.roles[id]={role:'MURDERER',instructions:'Keep your role private. Help solve every puzzle and steer suspicion away from yourself. Never hide or change factual clues.',mission};next.private.agendas[id]={id:agenda.id,title:agenda.title,text:mission,target};}else next.private.roles[id]={role:'INVESTIGATOR',instructions:'Help solve the trail. Watch how people behave, then identify every murderer. Keep your role private.'};}
 next.state={...next.state,stage:1,phase:'puzzle',arrived:true,running:true,paused:false,anchor,remainingMs:3600000,murdererCount:count,maxGuesses:ids.length===2?2:3,participants:next.private.participants,roleVersion:crypto.randomUUID()};
 // Old demographic hints and fixed-character recollections cannot identify random roles.
 for(const transition of Object.values(next.private.transitions||{}))if(transition.evidence)transition.evidence='The route clues are true. They do not identify a player’s secret role; use your observations for the final vote.';
 for(const [id,clue]of Object.entries(next.content?.[6]?.individual||{}))clue.text=clue.text.split(/\n\s*PERSONAL RECOLLECTION:/)[0];
 next.private.finale='The trail has ended. It is time to reveal the murderers.';
 next.private.hostNotes={};return next;
}
export function suspectSignature(ids){return ids.reduce((sum,id)=>{if(!/^p(?:[0-9]|1[01])$/.test(id))throw Error('Invalid suspect.');return sum+2**Number(id.slice(1));},0);}
export function validGuesses(guesses,count,k,participants){return Array.isArray(guesses)&&guesses.length===count&&new Set(guesses.map(g=>g.signature)).size===count&&guesses.every(g=>{const ids=Object.keys(g.suspects||{});return ids.length===k&&ids.every(id=>participants[id]===true&&g.suspects[id]===true)&&g.signature===suspectSignature(ids);});}
export function randomVerdict(game,now){const actual=Object.keys(game.private.roles).filter(id=>game.private.roles[id].role==='MURDERER'),ballot=game.ballot,round=game.state.roundId||'initial';return !!ballot&&ballot.roundId===round&&ballot.at<=game.state.anchor+game.state.remainingMs&&ballot.guesses?.some(g=>Object.keys(g.suspects||{}).length===actual.length&&actual.every(id=>g.suspects[id]===true));}
export function confirmRandomAgendas(game,results,at){const ids=Object.keys(game.private.agendas||{});if(!ids.length||game.state.stage!==7||game.state.phase!=='agenda')throw Error('Review agendas at the final stop.');const verified=Object.fromEntries(ids.map(id=>[id,results[id]===true]));return {roundId:game.state.roundId||'initial',progressVersion:game.state.progressVersion||'initial',at,verified,allowance:ids.every(id=>verified[id])?2:(game.state.maxGuesses||3)};}
