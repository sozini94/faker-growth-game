# v6 국제대회 팀 로고 추가

- 해외 18개 팀의 로고·약칭·팀명 메타데이터 추가 (`src/tournaments.js`)
- 기존 국내 10팀과 해외 18팀 공통 로고 표시 (`src/main.js`)
- MSI 11팀 / Worlds 19팀 참가 명단, BO5 대진, 승리 팀, 우승 팀, LCK Road to MSI에 로고 표시
- 이미지 다운로드 대상에 해외 18팀 추가 (`npm run assets:fetch`)
- 국제대회 참가팀별 로고 경로는 Leaguepedia 프로필 파일 이름을 기반으로 구성했습니다. **현재 작업 환경에서 실제 이미지 다운로드/표시 성공을 검증할 수 없습니다.** 다운로드가 안 되면 로고 대신 팀 약칭을 표시합니다. 실제 이미지가 필요하다면 `npm run assets:fetch`를 로컬 PC에서 실행하고 결과를 확인하세요.

## Git 적용

`git apply --check INTERNATIONAL_LOGOS_V6.patch` 후 `git apply INTERNATIONAL_LOGOS_V6.patch`.

`npm test && npm run build && npm run assets:fetch` 이후 이미지 확인 후 `git add . && git commit -m "Add MSI and Worlds team logos" && git push origin main`.

다른 수정 내용이 있다면 먼저 커밋/백업해 주세요. 공개 배포 시 원본 구단 로고 사용 권리를 확인하세요.
