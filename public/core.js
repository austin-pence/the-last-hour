export const normalize = s => String(s).toUpperCase().replace(/[^A-Z0-9]/g,'');
export function remaining(state,now){return Math.max(0,(state.remainingMs??3600000)-(state.running?Math.max(0,now-state.anchor):0));}
export function clock(ms){const s=Math.ceil(ms/1000);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
export function validPairs(pairs,count,slots){return pairs.length===count&&new Set(pairs.map(p=>p.murderer+':'+p.accomplice)).size===count&&pairs.every(p=>slots.includes(p.murderer)&&slots.includes(p.accomplice)&&p.murderer!==p.accomplice);}
export function verifiedAgendaSpeakers(missions){const agenda=missions?.shared;if(agenda?.schema!=='shared-agenda-v1')return [];return Object.entries(agenda.speakers||{}).filter(([id,verified])=>verified===true&&agenda.eligible?.includes(id)).map(([id])=>id);}
export function agendaAllowance(count){if(!Number.isInteger(count)||count<0||count>10)throw Error('Choose a whole number from 0 to 10.');return count>=5?2:3;}
export function roundRemaining(state,now){return state.running?Math.max(0,(state.roundEndsAt||now)-now):Math.max(0,state.roundRemainingMs??((state.roundEndsAt||now)-now));}
export function clockToggle(state,now){if(state.phase==='finished'||state.reveal)throw Error('This game has finished. Reset it to rehearse again.');const patch={remainingMs:remaining(state,now),anchor:now,running:!state.running,paused:state.running};if(state.roundEndsAt||state.roundRemainingMs!==undefined){const left=roundRemaining(state,now);patch.roundRemainingMs=left;patch.roundEndsAt=state.running?null:now+left;}return patch;}
export function gameStatus(state,now){if(state.phase==='finished'||state.reveal)return 'FINISHED';if(state.stage&&remaining(state,now)===0)return 'TIME EXPIRED';if(!state.stage)return '';return state.running?'CLOCK RUNNING':'PAUSED';}
export function initialState(roundId){return {stage:0,running:false,remainingMs:3600000,anchor:0,arrived:false,phase:'lobby',hintCount:0,rally:false,reveal:false,roundId};}
export function resetGame(game,roundId){
  const privateData=structuredClone(game.private);
  delete privateData.allowance;
  delete privateData.agendaDecision;delete privateData.lastRecovery;
  for(const mission of Object.values(privateData.missions||{})){delete mission.speakers;delete mission.target;delete mission.roundId;delete mission.savedAt;}
  return {owner:game.owner,slots:Object.fromEntries(Object.entries(game.slots).map(([id,slot])=>[id,{name:slot.name}])),content:structuredClone(game.content),private:privateData,state:initialState(roundId)};
}
export function recoveryPatch(game,request,now,id){
  const state=game.state,patch={},action=request.action;
  if(game.ballot&&action!=='time'&&!request.clearBallot)throw Error('Confirm clearing the sealed ballot before changing this progress.');
  const setState=values=>{for(const [key,value]of Object.entries(values))patch['state/'+key]=value;};
  if(action==='time'){
    if(state.phase==='finished')throw Error('Open an act explicitly before changing a finished game.');
    if(!Number.isInteger(request.minutes)||request.minutes<0||request.minutes>60)throw Error('Choose 0–60 whole minutes.');
    setState({remainingMs:request.minutes*60000,anchor:now,running:state.running&&request.minutes>0,paused:!state.running});
  }else if(action==='act'){
    const target=request.target;if(!Number.isInteger(target)||target<1||target>7)throw Error('Choose an act from 1 to 7.');
    setState({stage:target,phase:target===7?'agenda':'puzzle',arrived:true,progressVersion:id,reveal:false,revealText:null,allowance:null,agendaConfirmed:false,writer:null,ballotLocked:null,hints:null,hintCount:0,letters:false,rally:false,sealedMessage:null,destination:null,interviewed:null,speaker:null,roundEndsAt:null,roundRemainingMs:null,roundLabel:null});
    for(let stage=target;stage<=7;stage++){patch['solutions/'+stage]=null;patch['drafts/'+stage]=null;}
    patch.reports=null;patch['private/agendaDecision']=null;patch['private/allowance']=null;
    const evidence={};for(const [stage,transition]of Object.entries(game.private.transitions||{}))if(Number(stage)<target&&transition.evidence)evidence[stage]=transition.evidence;patch['state/evidence']=Object.keys(evidence).length?evidence:null;
  }else if(action==='advance'){
    if(state.phase==='finished'||state.stage<1||state.stage>6)throw Error('Use Open selected act or Recover final count for this phase.');
    if(state.phase==='puzzle'&&state.stage===6)setState({phase:'interrogation',speaker:Object.keys(game.slots)[0],interviewed:{}});
    else if(state.phase==='puzzle'||state.phase==='interrogation'){const transition=game.private.transitions[state.stage];setState({phase:'travel',destination:transition.destination,...(state.stage===2?{letters:true}:{}),evidence:{...(state.evidence||{}),...(transition.evidence?{[state.stage]:transition.evidence}:{})}});}
    else throw Error('The challenge is already released. Confirm arrival or select an act.');
  }else if(action==='count'){
    if(state.stage!==7||state.phase==='finished'||!state.running||remaining(state,now)===0)throw Error('Final count recovery requires Act 7 with time running.');
    const allowance=agendaAllowance(request.count),roundId=state.roundId||'initial';patch['private/agendaDecision']={count:request.count,roundId,savedAt:now,source:'host-recovery',recoveryId:id};patch['private/allowance']={count:allowance,roundId,savedAt:now};setState({allowance,agendaConfirmed:true,phase:'puzzle',writer:null});
  }else throw Error('Choose a recovery action.');
  if(game.ballot&&action!=='time'){patch.ballot=null;patch['state/ballotLocked']=null;}
  patch['private/lastRecovery']={id,action,roundId:state.roundId||'initial',expectedVersion:state.progressVersion||'initial',expectedStage:state.stage,expectedPhase:state.phase,at:now,clearedBallot:Boolean(game.ballot&&action!=='time'),...(action==='count'?{count:request.count}:{})};
  return patch;
}
