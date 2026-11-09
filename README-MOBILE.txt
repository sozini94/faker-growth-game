기존 v8 / 첫 번째 모바일 패치가 적용된 v8 모두 대응하는 업데이트 스크립트입니다.

1) ZIP에서 apply-mobile-new-game-fix.mjs를 프로젝트 최상위 폴더로 복사
2) Git Bash:
   node apply-mobile-new-game-fix.mjs
   npm test
   npm run build
   git add .
   git commit -m "Fix new game on mobile browsers"
   git push origin main

현재 저장기록은 새 선수 생성 전까지 그대로 유지됩니다.
화면 동작 및 터치 보조 핸들러를 수정합니다. 플레이/점수 규칙 변경 없음.
브라우저 실기기에서의 최종 확인은 사용자 테스트가 필요합니다.
