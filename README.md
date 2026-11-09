# 페이커 키우기: 랜덤 성장 자동 표시 + 3주 시즌 패치

## 사용법
1. `apply-random-training.mjs` 파일을 기존 게임 프로젝트의 최상위 폴더(`package.json`, `src/`가 있는 곳)로 복사합니다.
2. 그 프로젝트 폴더를 VS Code에서 열고 터미널에서 다음 명령어를 실행합니다.

   ```bash
   node apply-random-training.mjs
   npm test
   npm run build
   git add .
   git commit -m "Randomize training stat gains and set 3-week seasons"
   git push origin main
   ```

3. 이후 훈련 버튼을 누르면 매번 상승량을 추첨합니다. 이벤트가 발생하면 선택을 마친 후 `경기 결과` 화면의 **🎲 이번 훈련 랜덤 성장**에서 실제 오른 수치를 확인할 수 있습니다.

## 랜덤 상승값
- 솔로랭크: 라인전 +3~6, 한타 +2~4
- 영상 분석: 맵 리딩 +3~6, 챔프폭 +2~4
- 팀 연습: 한타 +3~6, 팀워크 +3(고정)
- 휴식: 멘탈 +1~2, 체력 +30, 컨디션 +15

*성장량은 나이에 따른 감소와 능력치 100 상한을 적용하면 이보다 작아질 수 있습니다.*

## 작동 원리
- `src/engine.js`의 `startTraining()`에서 각 훈련 능력치를 랜덤 추첨합니다.
- 결과를 `lastResult.trainingGains`에 저장합니다.
- `src/main.js`의 `resultScreen()`에서 화면에 자동 표시합니다.
- `src/styles.css`에 성장 결과 표시 스타일을 추가합니다.
- 1시즌 3주로 변경하고 기존 4주차 저장 데이터는 3주차로 보정합니다.
- 기존 LP 승패 점수와 포지션별 프로필 수정 부분은 **변경하지 않습니다.**

## 주의
- 실행 전 로컬 변경 사항을 Git 커밋해 두면 안전합니다.
- 기존 파일은 `*.before-random.bak` 이름으로 백업되며 `.gitignore`에 자동 추가됩니다.
- 이전 안내대로 이미 랜덤 성장 코드를 직접 추가하고 `changeEffects(g, effects)`를 사용하는 프로젝트에도 성장 표시만 이어서 적용할 수 있습니다.
- 이미 같은 패치를 적용한 경우 중복 실행하지 않습니다.
- 오래된 테스트 코드의 고정 상승량/4주 관련 검증은 함께 업데이트하지만, 직접 변경한 LP 밸런스 때문에 일부 테스트 기대값이 맞지 않을 경우 수동 조정이 필요할 수 있습니다.
