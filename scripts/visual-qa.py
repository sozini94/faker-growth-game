import asyncio
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  context=await browser.new_context(viewport={'width':420,'height':900},device_scale_factor=1)
  page=await context.new_page()
  errors=[]
  page.on('pageerror',lambda err: errors.append(str(err)))
  await page.goto('http://localhost:8765',wait_until='networkidle')
  await page.screenshot(path='/mnt/data/faker-worlds-v4/title-preview.png',full_page=True)
  print('title',await page.title(),'errors',errors)
  await page.get_by_text('새 게임 시작').click()
  await page.get_by_text('시작하기').click()
  await page.screenshot(path='/mnt/data/faker-worlds-v4/main-preview.png',full_page=True)
  print('main errors',errors)
  # Insert 1군 저장 데이터 and reload, triggering 2026 tournament UI
  await page.evaluate('''async () => { const {createGame}=await import('/src/engine.js');const g=createGame('테스트선수','top');g.player.stage='pro';g.career.team='t1';g.career.contractRemaining=4;g.proCircuit=null;localStorage.setItem('faker_growth_v1',JSON.stringify(g)); }''')
  await page.reload(wait_until='networkidle')
  await page.get_by_text('이어하기').click()
  await page.screenshot(path='/mnt/data/faker-worlds-v4/pro-preview.png',full_page=True)
  print('pro errors',errors)
  await page.get_by_text('영상 분석').first.click()
  # event could trigger; if so pick first
  if await page.get_by_text('RANDOM EVENT').count():
   await page.locator('[data-action="event-choice"]:not([disabled])').first.click()
  await page.screenshot(path='/mnt/data/faker-worlds-v4/pro-week-preview.png',full_page=True)
  print('pro weekly errors',errors)
  await browser.close()
asyncio.run(main())
