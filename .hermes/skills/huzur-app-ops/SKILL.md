---
name: huzur-app-ops
description: Use when working in this repo (Projem (Huzur)); canonical skill lives in the shared skill root.
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [windows]
metadata:
  hermes:
    tags: [pointer, repo-local]
---

# huzur-app-ops — repo-local pointer

Bu repo kökünde çalışan oturumlar için buradaki skill **işaretçidir**; tek kaynak ortak skill kökündedir:

> `E:\D_Backup\HermesAgentData\skills-shared\software-development\huzur-app-ops\SKILL.md`

Okuma sırası:
1. Yukarıdaki kanonik SKILL.md'yi `read_file` ile oku — içerik, komutlar, pitfall'lar orada.
2. Sonra repo kökündeki `AGENTS.md` / `CLAUDE.md` (varsa) ve master talimat dosyalarını oku.

Neden işaretçi: aynı bilginin iki kopyası tutulursa yeniden drift eder. Bu skill'i değiştirmek gerekiyorsa
**kanonik dosyayı** düzenle (tek kaynak), buraya dokunma.

Bu dosya `hermes skills trust` ile etkinleştirilmiş repo'lar içinde yüklenir; ana dizinden başlatılan
oturumlarda aynı skill ortak kökten (`skills.create_dir`) görünür.
