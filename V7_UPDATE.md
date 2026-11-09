# v7 패치: 1군 대회 1주 · Worlds 통산 6회 우승

- 학생/연습생/2군은 3주 시즌 유지
- 1군은 LCK 1주 + MSI 1주 + Worlds 1주 = 3턴/1년
- LCK 45경기를 한 주에 일괄 계산하며 MSI/Worlds 참가 조건은 기존 로직 유지
- Worlds 우승 횟수를 누적해서 6회 도달 시 FAKER 엔딩. 연속 우승 불필요
- 기존 프로 저장파일의 진행 주차를 1주차로 이행. 앞서 치른 LCK 경기는 중복 집계하지 않음
- 기존 LP 점수, 랜덤 성장, 팀 로고 로직은 변경하지 않음

## 배포
```bash
npm test
npm run build
git add .
git commit -m "Shorten pro tournaments and set six Worlds wins ending"
git push origin main
```
