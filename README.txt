Mobile new game button patch (based on v8 source)

1. Back up or commit your changes.
2. Place MOBILE_NEW_GAME_FIX.patch in the project root.
3. In Git Bash run:
   git apply --check MOBILE_NEW_GAME_FIX.patch
   git apply MOBILE_NEW_GAME_FIX.patch
   npm test
   npm run build
4. Deploy: git add . && git commit -m "Fix mobile new game confirmation" && git push origin main

What it does:
- Replaces native window.confirm used on new game with an in-game confirmation overlay.
- Improves title/menu touch hit handling.
- Does not erase local game saves when the confirmation is opened or cancelled.

If git apply --check fails, do not force apply; compare your modified src/main.js against the patch.
The patch addresses one likely mobile-specific source. It has not been tested on the user's specific phone/browser.
