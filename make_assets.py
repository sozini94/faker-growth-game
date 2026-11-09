from PIL import Image,ImageEnhance,ImageFilter
from pathlib import Path
src=Path(__file__).resolve().parent/'design-reference'
out=Path(__file__).resolve().parent/'public/assets'
files={
 'title':'페이커_키우기_lck의_전설.png',
 'main':'페이커_키우기_메인_화면.png',
 'create':'페이커_키우기_선수_생성_화면.png',
 'event':'슬럼프가_찾아왔다_선택의_순간.png',
 'result':'페이커_키우기_경기_결과_화면.png',
 'market':'페이커_이적_시장_계약_제안_화면.png',
 'ending':'페이커_은퇴_결산_전설의_마지막_무대.png'
}
crops={
 'title-stage':('title',(0,328,941,1040)),
 'arena':('main',(0,189,941,405)),
 'player':('main',(32,399,359,830)),
 'team-arena':('result',(0,179,941,345)),
 'event-slump':('event',(17,305,924,731)),
 'office':('market',(0,175,941,338)),
 'retirement-stage':('ending',(0,197,941,398)),
 'retirement-player':('ending',(16,302,430,864)),
 'role-top':('create',(20,675,192,922)),
 'role-jungle':('create',(202,675,376,922)),
 'role-mid':('create',(387,675,558,922)),
 'role-bot':('create',(565,675,734,922)),
 'role-support':('create',(740,675,918,922)),
 'training-solo':('main',(34,1218,447,1340)),
 'training-study':('main',(485,1218,901,1340)),
 'training-team':('main',(34,1396,448,1518)),
 'training-rest':('main',(485,1396,901,1518)),
}
for key,(source,rect) in crops.items():
 im=Image.open(src/files[source]).convert('RGB').crop(rect)
 im.save(out/f'{key}.webp','WEBP',quality=86,method=6)
print('Created',len(crops),'images, MB',round(sum(p.stat().st_size for p in out.glob('*'))/1024/1024,2))
