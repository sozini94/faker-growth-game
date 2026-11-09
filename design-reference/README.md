# 초기 픽셀 UI 시안

이 폴더에는 앞선 대화에서 생성한 7개의 원본 픽셀 시안이 있습니다. `public/assets/`는 이를 이미지 영역별로 잘라 WebP로 최적화한 결과입니다.

이미지 영역을 다시 자르려면 프로젝트 루트에서 아래 명령을 실행하세요.

```bash
python make_assets.py
npm run build
```

이는 **이미지 시안**이지 개별 레이어가 있는 PSD/aseprite 파일이 아닙니다. 게임 버튼, 수치 및 상호작용은 `src/`의 HTML/CSS/JavaScript로 구현했습니다.
