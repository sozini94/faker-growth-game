from pathlib import Path
p=Path('/mnt/data/faker-worlds-v4/src/main.js')
s=p.read_text()
s=s.replace('  isTrainingUnlocked,formatMoney,hallEntry','  isTrainingUnlocked,formatMoney,hallEntry,continueFromTournament')
s=s.replace("} from './engine.js';", "} from './engine.js';\nimport {PHASE_NAMES} from './tournaments.js';",1)
s=s.replace('const seasonLabel=g=>`${Math.ceil(g.career.season/2)}년차 ${seasonName(g.career.season)}`;',"const seasonLabel=g=>g.player.stage==='pro'&&g.proCircuit?`${g.proCircuit.year}년차 · ${PHASE_NAMES[g.proCircuit.phase]}`:`${Math.ceil(g.career.season/2)}년차 ${seasonName(g.career.season)}`;")
s=s.replace('<span>v2.0</span>','<span>v4.0</span>')
s=s.replace('실력에 따라 연습생·2군·1군 제안을 받으며 이적 시장과 은퇴까지 도전합니다.', '실력에 따라 연습생·2군·1군 제안을 받고, 1군 입단 후 LCK → MSI → Worlds에 도전합니다. Worlds 4년 연속 우승하면 특별 엔딩!')
s=s.replace("<img src=\"${img('player.webp')}\" alt=\"페이커를 모티브로 만든 선수 픽셀 아트\"/>","<img src=\"${img(positionInfo(g.player.position).asset)}\" alt=\"${h(positionInfo(g.player.position).name)} 포지션 선수 픽셀 아트\"/>")
needle="   ${g.career.gateMessage?`<div class=\"notice\"><span>✦</span>${h(g.career.gateMessage)}<button class=\"text-icon\" data-action=\"dismiss-notice\" aria-label=\"알림 닫기\">×</button></div>`:''}"
s=s.replace(needle,needle+"\n   ${g.proCircuit?proProgress(g):''}",1)
# insert reusable components before resultScreen
idx=s.index('function resultScreen(){')
s=s[:idx]+'''function teamName(id){return TEAMS.find(x=>x.id===id)?.name||({blg:'Bilibili Gaming',tes:'Top Esports',g2:'G2 Esports',kc:'Karmine Corp',tl:'Team Liquid',fly:'FlyQuest',tsw:'Team Secret Whales',dcg:'Deep Cross Gaming',fur:'FURIA',jdg:'JD Gaming',fnc:'Fnatic',c9:'Cloud9',psg:'PSG Talon',loud:'LOUD'})[id]||id||'미정';}
function standingsTable(rows){
 if(!rows?.length)return '<p class="soft">리그 결과를 집계하고 있습니다.</p>';
 return `<div class="standings-scroll"><table class="standings-table"><thead><tr><th>순위</th><th>팀</th><th>승</th><th>패</th></tr></thead><tbody>${rows.map(r=>`<tr class="${r.teamId===game.career.team?'my-team':''}"><td>${r.place}</td><td>${teamLogo(r.teamId,true)} ${h(teamName(r.teamId))}</td><td>${r.wins}</td><td>${r.losses}</td></tr>`).join('')}</tbody></table></div>`;
}
function proProgress(g){
 const t=g.proCircuit;
 const steps=[['lck','LCK'],['msi','MSI'],['worlds','Worlds']];
 const qualifying=t.phase==='msi'?`<p class="${t.qualifiedMSI?'positive-note':'warning-note'}">${t.qualifiedMSI?'✓ MSI 출전권 확보':'× Road to MSI 탈락 · 국제 대회 출전 불가'}</p>`:
 t.phase==='worlds'?`<p class="${t.qualifiedWorlds?'positive-note':'warning-note'}">${t.qualifiedWorlds?'✓ Worlds 출전권 확보':'× LCK 플레이오프 성적 미달 · Worlds 출전 불가'}</p>`:'';
 return section(`${labelHeading('🏆','프로 대회 커리어',`${t.year}년차 · Worlds 연속 우승 ${t.worldsStreak}/4`)}<div class="pro-phase-track">${steps.map(([id,label])=>`<span class="${id===t.phase?'active':''}">${label}</span>`).join('<b>›</b>')}</div>${qualifying}${t.phase==='lck'&&t.standings?.length?standingsTable(t.standings):''}<p class="soft">LCK 국내 10팀 시뮬레이션 · MSI/Worlds 진출 여부는 대회 성적으로 결정</p>`,'pro-panel');
}
function tournamentScreen(){
 const g=game,t=g.proCircuit,r=t.currentReport;if(!r)return '<p>대회 결산 정보를 불러올 수 없습니다.</p>';
 const champion=r.champion||r.msiChampion;
 const intro=r.phase==='lck'?'정규 시즌 상위 6팀의 Road to MSI 결과입니다.':r.phase==='msi'?'국제 대회 결산 및 LCK 후반 플레이오프 결과입니다.':'Worlds 월드 챔피언십 최종 결과입니다.';
 const qualification=r.phase==='lck'?`<div class="${r.qualified?'positive-note':'warning-note'}">${r.qualified?'MSI 출전 확정!':'MSI 출전 실패 · 다음 단계에서도 훈련은 계속할 수 있습니다.'}</div>`:
 r.phase==='msi'?`<div class="${r.qualifiedWorlds?'positive-note':'warning-note'}">${r.qualifiedWorlds?'Worlds 출전 확정!':'Worlds 진출 실패 · LCK 성적이 부족합니다.'}</div>`:
 `<div class="${r.won?'positive-note':'warning-note'}">${r.won?`🏆 Worlds 우승! ${r.streak}년 연속 우승`:'이번 해의 Worlds 도전이 끝났습니다. 다음 해에 다시 도전하세요.'}</div>`;
 return `<div class="page-body"><div class="wide-banner" style="background-image:linear-gradient(180deg,transparent,#09142a),url('${img('team-arena.webp')}')"><div class="banner-overlay"><span class="eyebrow">PRO TOURNAMENT · YEAR ${r.year}</span><h2>${h(r.title)}</h2><p>${h(intro)}</p></div></div>
 ${section(`${labelHeading('🏆','대회 결산')}<h2 class="tournament-title">${r.phase==='lck'?'LCK / ROAD TO MSI':r.phase==='msi'?'MID-SEASON INVITATIONAL':'WORLD CHAMPIONSHIP'}</h2>${qualification}${champion?`<p class="tour-winner">우승 팀 · <strong>${h(teamName(champion))}</strong></p>`:''}${r.phase==='lck'?`<p>MSI 대표: ${(r.qualifiers||[]).map(x=>h(teamName(x))).join(' · ')}</p>`:''}${r.phase==='msi'?`<p>Worlds 출전권: ${(r.worldsSeeds||[]).map(x=>h(teamName(x))).join(' · ')}</p>`:''}${r.phase==='worlds'?`<p>나의 Worlds 우승 ${t.worldsWins}회 · 4년 연속 우승 목표</p>`:''}`,'pro-award')}
 ${r.standings?.length?section(`${labelHeading('⚑',r.phase==='lck'?'LCK 10팀 최종 순위':'LCK 최종 성적 및 플레이오프')} ${standingsTable(r.standings)}`):''}
 ${r.phase==='lck'&&r.road?.length?section(`${labelHeading('⚔','ROAD TO MSI 선발전')}<div class="tour-logs">${r.road.map(m=>`<div>${h(teamName(m.a))} ${h(m.aWins)} : ${h(m.bWins)} ${h(teamName(m.b))} · <strong>${h(teamName(m.winner))} 승</strong></div>`).join('')}</div>`):''}
 ${r.phase==='worlds'&&r.knockout?.length?section(`${labelHeading('⚔','Worlds 8강~결승')}<div class="tour-logs">${r.knockout.map(m=>`<div>${h(teamName(m.a))} ${m.score} ${h(teamName(m.b))} · <strong>${h(teamName(m.winner))} 승</strong></div>`).join('')}</div>`):''}
 ${r.phase==='worlds'&&r.won&&r.streak>=4?'<div class="faker-banner">👑 4년 연속 Worlds 우승! 페이커 특별 엔딩 해금</div>':''}
 <button class="btn primary full next-button" data-action="next-tournament">${r.phase==='worlds'&&r.won&&r.streak>=4?'페이커 엔딩 보기 →':r.phase==='worlds'?'다음 해 LCK 도전 →':r.phase==='lck'?'MSI 시즌으로 →':'Worlds 시즌으로 →'}</button>
 <p class="fine-print">2026년 출전 자격 구조를 3주 시즌으로 축약한 게임용 모의 대회입니다. 실제 리그 전 경기 일정·대진·성적과 동일하지 않습니다.</p></div>`;
}
''' + s[idx:]
# weekly result pro show variable and separate render league block
s=s.replace('   ${league?section(`${labelHeading(\'♛\',\'팀 리그 경기\')}', '   ${league?.pro?section(`${labelHeading(\'♛\',\'LCK / 국제 대회 주간 현황\')}<p class="soft">${h(league.note||`이번 주 LCK 팀 대진 ${league.played?.length||0}경기`)}</p>${league.played?.length?`<div class="tour-logs">${league.played.map(m=>`<div>${teamLogo(g.career.team,true)} ${h(teamName(g.career.team))} vs ${h(teamName(m.enemyId))} · <strong class="${m.victory?\'win\':\'lose\'}">${m.victory?\'승리\':\'패배\'} ${m.score}</strong></div>`).join(\'\')}</div>`:\'\'}${league.standings?.length?standingsTable(league.standings):\'\'}` ,\'league-panel\'):league?section(`${labelHeading(\'♛\',\'팀 리그 경기\')}')
s=s.replace(" else if(current==='result')content=resultScreen();", " else if(current==='result')content=resultScreen();\n else if(current==='tournament')content=tournamentScreen();")
s=s.replace("   case 'next-week':changeGame(g=>continueFromResult(g));break;", "   case 'next-week':changeGame(g=>continueFromResult(g));break;\n   case 'next-tournament':changeGame(g=>continueFromTournament(g));break;")
s=s.replace('<p><b>저장</b>', '<p><b>1군 대회</b> · 1년 = LCK 3주 → MSI 3주 → Worlds 3주. 국내 10팀 성적과 Road to MSI 선발전, 국제대회 출전권을 시뮬레이션합니다. Worlds를 4년 연속 우승하면 페이커 특별 엔딩이 열립니다.</p><p><b>저장</b>')
s=s.replace('<div><small>팀 경기 승수</small>', '<div><small>Worlds 우승</small><strong>${g.proCircuit?.worldsWins||0}회 (최대 연속 ${g.proCircuit?.worldsStreak||0}년)</strong></div><div><small>팀 경기 승수</small>')
s=s.replace('Math.ceil(g.career.totalTurns/(WEEKS_PER_SEASON*2))','Math.ceil(g.career.totalTurns/(WEEKS_PER_SEASON*3))')
p.write_text(s)
