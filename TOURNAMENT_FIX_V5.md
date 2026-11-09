# 대회 결과·시드 배정 수정 (v5)

## 수정 내용
- LCK 정규시즌 순위와 플레이오프 결과를 **별도 순위**로 표시합니다.
- 후반기 상위 6팀 BO5 플레이오프 대진을 10경기로 시뮬레이션하고, 해당 경기의 실제 패자에 따라 1~6위를 계산합니다.
- LCK 플레이오프 1·2·3위가 Worlds 기본 출전권을 받습니다. MSI 성적에 따른 추가 출전권은 별도 계산합니다.
- MSI는 **11개 팀 → 플레이인 4팀 → 플레이인 통과 1팀 → 본선 8팀** 구조로 나뉘며, 대진과 결과를 결산 화면에 보여줍니다.
- 플레이오프/국제대회 로그를 표시하여 `정규시즌 1위`가 왜 `플레이오프 우승`과 다를 수 있는지 직접 확인할 수 있습니다.
- 기존 저장 데이터와 훈련·LP·선수 이미지 로직은 변경하지 않았습니다.

## 제한
- 게임용 압축 시뮬레이션입니다. 2026년 실제 LCK 그룹별 플레이인 세부 편성과 국제대회 전체 경기 일정·패자조 결승 리셋 규칙을 1:1 복제하지 않습니다.
- MSI 동일 지역 결승 시 Worlds 추가 시드를 처리하는 차순위 지역은 게임용 대체 규칙입니다.
- 이미 종료된 대회 결과는 저장 데이터에 기록되어 있으므로, 새 대회부터 변경된 계산이 적용됩니다. 현재 플레이 중이라면 다음 해 LCK부터 적용하는 것이 안전합니다.

## 소스 적용
Git 저장소 루트에서 `git apply --check TOURNAMENT_FIX_V5.patch` 후 `git apply TOURNAMENT_FIX_V5.patch`를 실행하세요. 먼저 Git 커밋으로 백업하세요.

## 확인
`npm test` / `npm run build` 

### 참고
- 2026 LCK 규정집: https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/0/02/LCK_2026_Rulebook%282%29.pdf/revision/latest?cb=20260109135740
- Riot MSI/Worlds: https://lolesports.com/en-US/news/msi-and-worlds-updates
