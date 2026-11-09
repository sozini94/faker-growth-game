# v4 업데이트 패치 적용 (기존 Git 프로젝트 유지)

이 패치는 v3 원본 소스 기준이며, 기존 솔로랭크 LP 변경과 포지션별 프로필 코드가 유지되도록 검사했습니다.

1. VS Code에서 기존 게임 폴더를 엽니다. 현재 변경 내용을 먼저 git commit으로 백업하세요.
2. `FAKER_WORLDS_V4.patch`를 프로젝트 최상위 폴더에 복사합니다.
3. Git Bash에서 실행:

```bash
git apply --check FAKER_WORLDS_V4.patch
git apply FAKER_WORLDS_V4.patch
npm test
npm run build
git add .
git commit -m "Add LCK MSI Worlds tournaments"
git push origin main
```

`git apply --check`가 실패하면 억지로 적용하지 마세요. 이미 수정한 코드와 충돌할 수 있으므로 백업 후 전체 소스와 비교해야 합니다.

구현/검증 및 실제 2026 규정과의 차이: `TOURNAMENT_UPDATE.md` 참고.
