# 페이커 키우기 — 웹게임 v2.0

이전 기획서를 바탕으로 제작한 **선택형 e스포츠 육성 시뮬레이션**입니다. 모바일 세로 화면 + PC 브라우저, HTML/CSS/순수 JavaScript, Node.js 내장 개발 서버, Vercel 정적 배포를 지원합니다.

## v2.0 변경 사항

- **마스터 0LP 시작**. 아브실골을 삭제하고 마스터(0~399LP) → 그랜드마스터(400~799LP) → 챌린저(800LP 이상) 3개만 표시합니다. 실제 서버의 상대 순위 기준은 적용하지 않은 **싱글플레이용 간소화 랭크**입니다.
- **1시즌 8주 → 4주**, 1년 스프링/서머 2시즌 = 8턴. 시즌 결산과 승격 테스트, 계약 갱신 주기가 짧아졌습니다.
- **체력·컨디션 0 규칙**: 훈련이나 이벤트 중 둘 중 하나라도 0이 되면 그 주 남은 솔랭/팀 경기 모두 불참. 다음 주는 **강제 휴식**만 가능하며 회복량은 체력 +40·컨디션 +30. 체력 0은 부상(2턴으로 시작해 종료 시 1턴 감소)을 동반합니다. 경기 후 컨디션이 0이 된 경우 이미 끝난 경기 결과는 유지하고 다음 주 강제 휴식합니다.
- 마스터·그랜드마스터·챌린저 **실제 랭크 엠블럼 URL**과 2026 LCK **실존 팀 로고 URL** 연결. 로컬 파일 → 원격 이미지 → 약칭 텍스트 순서로 자동 대체합니다.
- 이전 **v1 저장 데이터**와 명예의 전당 기록을 v2 규칙으로 자동 변환합니다. 중요 기록은 먼저 명예의 전당 → 기록 내보내기로 백업하세요.

## 실행

Node.js 20 이상. 외부 npm 패키지는 필요 없습니다.

```bash
npm run dev
# http://localhost:5173
npm test
npm run simulate -- 300
npm run build
npm run preview
```

## 실제 로고와 랭크 이미지 로컬 캐시(권장)

Vercel에서도 100% 자기 프로젝트에서 불러오도록 하려면, **본인 PC에서 인터넷 연결이 가능한 상태**로 다음을 먼저 실행하세요.

```bash
npm run assets:fetch
```

이 명령은 외부에 공개된 원본 자산 주소에서 실제 랭크 3개 및 구단 로고 10개를 `public/assets/branding/`으로 다운로드합니다. 실패한 이미지는 콘솔에 표시됩니다. 네트워크 또는 외부 서버의 리다이렉트/핫링크 제한으로 실패할 수 있습니다. 위 명령을 실행하지 않아도 웹게임은 작동하지만, **원격 이미지에 의존**하므로 이미지 표시를 보장할 수 없습니다. 다운로드에 성공한 이미지와 아래 라이선스 안내를 확인한 후 Git에 함께 커밋하세요.

## GitHub → Vercel

1. 소스코드 ZIP 압축을 풀고 `faker-growth-game/` 폴더를 VS Code로 엽니다.
2. 필요 시 `npm run assets:fetch`를 먼저 실행하고 결과를 확인합니다.
3. GitHub의 기존 저장소에 아래 명령으로 업데이트합니다.

```bash
git add .
git commit -m "Master start 4-week seasons exhaustion and real rank logos"
git push origin main
```

4. GitHub와 연결된 Vercel이 자동으로 재배포합니다. 새 저장소라면 Project Import 후 아래 값을 사용합니다.

| 설정 | 값 |
| --- | --- |
| Framework Preset | Other |
| Root Directory | `./` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | 기본값 |
| 환경변수 | 없음 |

외부 패키지·서버·데이터베이스가 필요하지 않습니다. 게임 데이터는 사용자 브라우저 `localStorage`에 저장됩니다.

## 구현된 게임 흐름

- 시작/닉네임·포지션 → 5개 능력치와 체력·컨디션·팀워크·인기 관리 → 훈련 4종 → JSON 이벤트 21종 → 경기 결과 → 4주 단위 시즌 결산
- 학생 → 연습생 → 2군 → 1군 (티어와 스탯을 만족하면 시즌 말 승격 이벤트)
- 리그 경기·우승 처리(간소화), 2026 LCK 10개 구단 가상 계약, 연봉, 시장가치, 은퇴 결산, 명예의 전당, 저장 내보내기/가져오기
- 16개 Node.js 엔진 테스트와 밸런스 시뮬레이션 스크립트 포함

## 실제 이미지 출처 및 권리

- **랭크 엠블럼**: [CommunityDragon LoL 클라이언트 에셋 디렉터리](https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/). 2026년 11월 기준 클라이언트 추출 이미지 경로로 사용합니다. [Riot 공식 설명](https://support.riotgames.com/ko-kr/league-of-legends/gameplay/master-grandmaster-and-challenger-the-apex-tiers/)에서 세 개 랭크를 확인할 수 있습니다.
- **LCK 팀**: T1, Gen.G, 한화생명, Dplus KIA는 [위키미디어 공용](https://commons.wikimedia.org/wiki/Category:Logos_of_esports_teams)의 로고 파일; KT, Kiwoom DRX, DN SOOPers, HANJIN BRION은 Leaguepedia의 2026 팀 로고 파일; NS RedForce는 Leaguepedia CDN, BNK FEARX는 구단 사이트의 2026 공개 자산 URL을 사용합니다. 구체적인 URL은 `src/engine.js`의 `TEAMS`에 있습니다.
- 실제 선수 **픽셀 일러스트**와 배경은 이전 대화에서 생성한 팬아트입니다. 선수의 공식 사진이 아닙니다.
- 모든 팀 제안/연봉/경기 결과는 **게임용 가상 수치**입니다. Riot Games/LCK/T1/각 구단과 협업하거나 보증받은 제품이 아닙니다.
- 이미지가 웹에서 접근 가능하다는 사실은 재배포·게임 서비스 사용 허락을 의미하지 않습니다. 정식 공개·상업화 전에는 선수 초상권/구단 상표/게임 IP 정책을 직접 검토하고 필요한 허가를 받으세요.

## 개발 메모

`src/engine.js`는 순수 게임 로직, `src/main.js`는 UI 및 브라우저 저장, `src/data/events.json`은 이벤트 데이터, `src/styles.css`는 디자인, `scripts/build.mjs`는 정적 배포를 담당합니다.

밸런스는 MVP 초기값입니다. `npm run simulate -- 300`으로 은퇴 연령, 포지션별 차이를 확인할 수 있으며, **실제 랭크 대기열/승급률을 그대로 구현한 게임은 아닙니다.**
