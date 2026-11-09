# 페이커 키우기 v4 · LCK / MSI / Worlds

## 핵심 변경
- **1군 입단 시** LCK → MSI → Worlds를 3주씩 진행합니다(1년 = 3개 대회 × 3주).
- LCK는 10개 실제 국내 구단의 단일 라운드로빈을 **9경기씩, 총 45경기**로 모의 진행하며 3주에 나눠 보여 줍니다.
- 상위 6팀은 Road to MSI에 진출하고, 공식 2026 King of the Hill 시드 구조에 따라 2팀만 MSI 출전권을 얻습니다.
- MSI는 2026년 본선 11개 팀을 사용한 BO5 가상 2패 탈락 브래킷입니다.
- MSI 이후 LCK 후반 그룹/플레이오프 성적을 압축 시뮬레이션해 Worlds 진출권을 결정합니다.
- Worlds는 2026년 **19개 팀 참가·플레이인·16팀 스위스·8강** 구조를 간소화하여 진행합니다.
- Worlds **4년 연속 우승**하면 그 자리에서 **FAKER** 특별 엔딩이 열립니다. 한 해 탈락/불참 시 연속 기록은 0이 됩니다.
- MSI/Worlds에 출전하지 못해도 해당 3주 시즌에 훈련할 수 있습니다.
- 기존 v2 저장 파일은 시작 시 v3 스키마로 자동 이행합니다.
- 1군에 진입하면 계약의 `1~3시즌`을 `1~3년`처럼 한 해 단위로 소진하도록 변경했습니다.

## 공식 구조와 다른 점
이 게임은 **실제 대회 전체 일정 및 모든 세부 규정을 그대로 구현하지 않습니다**.
- 실제 LCK 2026은 1~2라운드 더블 라운드로빈, 3~4라운드 그룹 배정과 플레이인/더블엘리미네이션 플레이오프입니다. 본 게임은 이 과정을 3주 단위 축약 시뮬레이션합니다.
- Road to MSI 선발전 자격은 실제 6팀 → 2팀 출전 구조와 상위 두 팀 1시드 결정전 및 킹 오브 더 힐 대진을 구현합니다.
- MSI, LCK 후반 플레이오프 및 Worlds 스위스 대진은 **게임 전용 모의 대진**이며 실제 2026 결과가 아닙니다.
- 실제 시즌에는 LCK CUP / First Stand도 있으나 사용자 요청에 따라 이번 구현에서는 제외했습니다.
- 해외 구단은 2026년 실존 구단 이름을 바탕으로 만든 가상 시드/대진으로, 실제 참가팀과 다를 수 있습니다.
- Worlds 기본 지역 출전권과 MSI 성적에 따른 추가 슬롯의 2026 구조를 모델링하되, 추가 슬롯 선정 및 자국 플레이오프 판정은 간소화되었습니다.

## 참고 공식 자료
- [LoL Esports · 2026 League Handbook](https://lolesports.com/en-GB/season/115547545029543948/handbook)
- [LoL Esports · 2026 Worlds 출전권 및 19팀 포맷](https://lolesports.com/en-US/news/msi-and-worlds-updates)
- [2026 LCK 공식 규정집 (외부 공개 PDF)](https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/0/02/LCK_2026_Rulebook%282%29.pdf/revision/latest?cb=20260109135740)

## GitHub/Vercel
프로젝트 루트에서 `npm test`, `npm run build`, `git add .`, `git commit -m "Add 2026 LCK MSI Worlds career mode"`, `git push origin main` 순서로 실행합니다. Vercel은 Framework Preset=Other, Build Command=`npm run build`, Output Directory=`dist`입니다.
