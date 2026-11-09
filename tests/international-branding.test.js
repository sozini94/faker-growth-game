import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FOREIGN_TEAMS,INTERNATIONAL_TEAM_BRANDING} from '../src/tournaments.js';
import {TEAMS} from '../src/engine.js';
import {readFile} from 'node:fs/promises';
const page=await readFile(new URL('../src/main.js',import.meta.url),'utf8');
test('해외 참가팀 18개가 전부 고유 로고/이름 정보를 가진다',()=>{
 assert.equal(FOREIGN_TEAMS.length,18);
 assert.equal(Object.keys(INTERNATIONAL_TEAM_BRANDING).length,18);
 for(const t of FOREIGN_TEAMS){const b=INTERNATIONAL_TEAM_BRANDING[t.id];assert.equal(b.name,t.name);assert.ok(b.logo.includes('Redirect/file'));assert.ok(b.short);assert.ok(!TEAMS.some(local=>local.id===t.id));}
});
test('MSI/Worlds 경기와 참가팀 명단에 공통 로고 렌더러를 사용한다',()=>{
 assert.ok(page.includes('const tournamentTeam=id=>allTeams.find'));
 assert.ok(page.includes('teamBadges(r.msiField)'));
 assert.ok(page.includes('teamBadges(r.participants)'));
 assert.ok(page.includes('teamLogo(m.a,true)'));
 assert.ok(page.includes('teamLogo(m.winner,true)'));
});
