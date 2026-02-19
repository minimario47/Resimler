# Performance Rebuild Plan (1 Mbit/s First)

## Goals
- First visible photo in **<3s** on a 1 Mbit/s connection.
- Albums remain responsive by loading at most **~30 photos per page**.
- Users should see images immediately at low quality, then progressively clearer.
- Browser Back/Forward should preserve album page position (`?page=` in URL).
- Avoid repeated redownloads by combining browser cache + service worker cache strategy.

## Network Budget Assumptions (Turkey baseline)
- 1 Mbit/s ≈ 125 KB/s raw throughput.
- Real-world effective throughput after overhead: 85–105 KB/s.
- Per-screen target:
  - Tiny placeholders: ~1 KB each
  - Medium thumbnails: 30–60 KB each
  - Progressive “enhanced” layer: 70–130 KB each

## Architecture Strategy
1. **Progressive 3-step image rendering**
   - Step A: immediate tiny placeholder.
   - Step B: medium image when card is near viewport.
   - Step C: enhanced preview in idle time (only after medium is visible).
2. **Pagination-by-default for albums**
   - 30 items/page hard cap.
   - `?page=` drives state so browser history works naturally.
3. **Cache-coherent URLs**
   - Keep deterministic resize URLs for same image/preset.
   - Reuse cached response between revisits and pagination navigation.
4. **Lightbox full-resolution only on demand**
   - Never pull original image files for grid cards.

## UX Strategy
- Prioritize first viewport row(s) with eager loading.
- Defer non-visible media aggressively with IntersectionObserver.
- Avoid blank cards: always display placeholder while medium/high loads.
- Show page info (`Page X/Y`) to make pagination explicit.

## YouTube Integration Strategy
- Replace many auto-loaded iframes with lightweight poster cards.
- Open selected video in modal with `youtube-nocookie.com` + `modestbranding=1`.
- This fuses video experience into site design and drastically reduces initial page load.

## Rollout Phases
1. **Phase 1 (implemented now)**
   - Progressive image pipeline update.
   - Album pagination + history-safe query param navigation.
   - Lightweight embedded video gallery modal.
2. **Phase 2 (next step)**
   - Server-side metadata for width/height and blurhash-like placeholders.
   - Route-level prefetch (next page metadata only, not full images).
3. **Phase 3 (next step)**
   - Performance telemetry (LCP, INP, CLS + image timing).
   - Adaptive quality based on `navigator.connection` (save-data / downlink).

## Validation Checklist
- Simulate Slow 3G / custom 1 Mbit in browser devtools.
- Confirm first image appears quickly at low quality then improves.
- Navigate page 1 -> 2 -> 3 and back/forward; state must restore correctly.
- Re-open same album and verify cache hits dominate repeated requests.
