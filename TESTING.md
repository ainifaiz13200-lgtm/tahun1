# Verification

Verified in the available Chromium browser on 28 October 2026:

- Start button opens the first playable mission.
- Mouse drag places a pillow on the bed and awards 10 points.
- Click an item then its destination works as an alternative control.
- Wrong destination leaves the score at zero, preserves the item and highlights the correct destination.
- Each room completes after exactly four items: 40, 80 and 120 accumulated points.
- Both mission transitions and the final result button work.
- Completed rooms remove all scattered items; bed art updates with collected bedding.
- Completion displays the trophy, 12/12 items, 120 points and the final pledge.
- All four reflection questions can be completed; incorrect answers allow another attempt.
- The feelings question accepts the tired-but-finished option.
- Play again resets the first mission, score and item count.
- Restart confirmation and cancellation both work.
- Sound toggle changes its accessible state.
- A 390-pixel-wide iframe exercises the responsive phone layout; item and destination selection awards 10 points and updates progress.
- JavaScript syntax passes `node --check script.js`.

Limits: no physical phone/tablet touchscreen or device-speaker audio check was available. Touch uses standard Pointer Events shared with the tested mouse control path. GitHub Pages deployment was not performed. There is no promise of offline reload for a hosted URL; use the downloaded folder for reliable offline reopening.
