from pathlib import Path
import zipfile,difflib,tempfile,subprocess,shutil
root=Path('/mnt/data/faker-worlds-v4')
old=Path('/mnt/data/faker-worlds-v3-original')
old.mkdir(exist_ok=True)
with zipfile.ZipFile('/mnt/data/faker-growth-v3-scouting-source.zip') as z:z.extractall(old)
files=['src/engine.js','src/main.js','src/styles.css','package.json','README.md','tests/engine.test.js']
patch=[]
for f in files:
 a=(old/f).read_text()
 b=(root/f).read_text()
 if f=='src/main.js':
  # Maintain the user's already-fixed positional profile portrait without conflict.
  b=b.replace("<img src=\"${img(positionInfo(g.player.position).asset)}\" alt=\"${h(positionInfo(g.player.position).name)} 포지션 선수 픽셀 아트\"/>","<img src=\"${img('player.webp')}\" alt=\"페이커를 모티브로 만든 선수 픽셀 아트\"/>")
 patch.extend(difflib.unified_diff(a.splitlines(keepends=True),b.splitlines(keepends=True),fromfile='a/'+f,tofile='b/'+f,n=1 if f=='src/main.js' else 3))
for f in ['src/tournaments.js','tests/tournaments.test.js','TOURNAMENT_UPDATE.md']:
 b=(root/f).read_text()
 patch.extend(difflib.unified_diff([],b.splitlines(keepends=True),fromfile='/dev/null',tofile='b/'+f,n=3))
patch_text=''.join(patch)
patch_path=Path('/mnt/data/FAKER_WORLDS_V4.patch')
patch_path.write_text(patch_text)
# Verify against v3 baseline before handing to users.
r=subprocess.run(['git','apply','--check',str(patch_path)],cwd=old,text=True,capture_output=True)
print('patch baseline:',r.returncode,r.stderr[:1000])
if r.returncode:raise RuntimeError('Patch failed on v3')
# Simulate custom changes to LP and portrait, verify the patch does not overwrite.
custom=Path('/mnt/data/faker-worlds-v3-custom-test');shutil.rmtree(custom,ignore_errors=True);shutil.copytree(old,custom)
p=custom/'src/engine.js';txt=p.read_text().replace('updateRank(g,roll(rng,18,22))','updateRank(g,roll(rng,30,40))');p.write_text(txt)
p=custom/'src/main.js';txt=p.read_text().replace("img('player.webp')","img(positionInfo(g.player.position).asset)",1);p.write_text(txt)
r=subprocess.run(['git','apply','--check',str(patch_path)],cwd=custom,text=True,capture_output=True)
print('patch customized:',r.returncode,r.stderr[:1000])
if r.returncode:raise RuntimeError('Patch failed on customized v3')
subprocess.run(['git','apply',str(patch_path)],cwd=custom,check=True)
assert 'roll(rng,30,40)' in (custom/'src/engine.js').read_text()
assert 'img(positionInfo(g.player.position).asset)' in (custom/'src/main.js').read_text()
print('Patch retains LP and portrait customizations')
# Normal source ZIP, no dist/assets double copies in source zip; include build outputs only in deploy zip.
src_out=Path('/mnt/data/faker-growth-v4-worlds-source.zip')
with zipfile.ZipFile(src_out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=7) as z:
 for p in root.rglob('*'):
  if not p.is_file():continue
  rel=p.relative_to(root)
  if rel.parts[0] in ('dist','__pycache__') or p.suffix in ('.log','.txt','.png') or p.name in ('patch_engine.py','patch_ui.py','make_packages.py','visual-qa.py'):continue
  z.write(p,rel)
# retain design-reference png as design reference user likely wants
 for p in (root/'design-reference').glob('*.png'):z.write(p,p.relative_to(root))
# Deploy ZIP built outputs, no source outside dist
out=Path('/mnt/data/faker-growth-v4-worlds-vercel.zip')
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=7) as z:
 for p in (root/'dist').rglob('*'):
  if p.is_file():z.write(p,p.relative_to(root/'dist'))
# Patch ZIP includes patch + instructions
guide='''# v4 업데이트 패치 적용 (기존 Git 프로젝트 유지)\n\n이 패치는 v3 원본 소스 기준이며, 기존 솔로랭크 LP 변경과 포지션별 프로필 코드가 유지되도록 검사했습니다.\n\n1. VS Code에서 기존 게임 폴더를 엽니다. 현재 변경 내용을 먼저 git commit으로 백업하세요.\n2. `FAKER_WORLDS_V4.patch`를 프로젝트 최상위 폴더에 복사합니다.\n3. Git Bash에서 실행:\n\n```bash\ngit apply --check FAKER_WORLDS_V4.patch\ngit apply FAKER_WORLDS_V4.patch\nnpm test\nnpm run build\ngit add .\ngit commit -m "Add LCK MSI Worlds tournaments"\ngit push origin main\n```\n\n`git apply --check`가 실패하면 억지로 적용하지 마세요. 이미 수정한 코드와 충돌할 수 있으므로 백업 후 전체 소스와 비교해야 합니다.\n\n구현/검증 및 실제 2026 규정과의 차이: `TOURNAMENT_UPDATE.md` 참고.\n'''
patchzip=Path('/mnt/data/faker-growth-v4-worlds-update-only.zip')
with zipfile.ZipFile(patchzip,'w',compression=zipfile.ZIP_DEFLATED) as z:
 z.write(patch_path,patch_path.name)
 z.writestr('UPDATE_README.md',guide)
 z.write(root/'TOURNAMENT_UPDATE.md','TOURNAMENT_UPDATE.md')
for x in (src_out,out,patchzip):print(x,x.stat().st_size)
