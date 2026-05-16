# Huzur TikTok Creative Generator

Bu klasor TikTok icin reklam kreatifleri uretir. Ciktilar `creative/output` altina yazilir.

## Calistirma

```powershell
python "D:\Projem\marketing\tiktok\creative\scripts\generate_creatives.py"
```

Her creative klasorunde sunlar olur:

- `video.mp4`: TikTok'a yuklenecek 9:16 video
- `cover.jpg`: Kapak gorseli
- `caption.txt`: Aciklama ve hashtag
- `source.json`: Hangi sahnelerle uretildigi

Ara render kareleri `creative/frames` altinda olusur ve video uretiminden sonra silinebilir.
