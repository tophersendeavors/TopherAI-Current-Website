/* ============================================================
   Topher — the ambient "mind"
   An abstract neural-filament cloud behind the hero. It breathes
   slowly and its glow cross-fades to whatever emotion the live
   demo (or the page) is currently processing. Deliberately soft,
   low-contrast and blurred — atmosphere, never decoration.
   Legibility wins: if it ever competes with text, it dims.
   ============================================================ */
(function () {
  "use strict";

  var wrap = document.getElementById("brain");
  var canvas = document.getElementById("brainCanvas");
  if (!wrap || !canvas) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  function hexToRgb(h) {
    h = String(h).trim().replace("#", "");
    if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
    var n = parseInt(h, 16);
    if (isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  // Current + target colour. Target is set by the page; current eases toward it.
  var cur = { r: 232, g: 130, b: 107 };   // house coral
  var tgt = { r: 232, g: 130, b: 107 };
  window.__topherBrain = {
    setEmotion: function (hex) { var c = hexToRgb(hex); if (c) tgt = c; }
  };

  var W = 0, H = 0, nodes = [], edges = [], cx, cy, rx, ry, neighbourThr;

  function build() {
    var rect = wrap.getBoundingClientRect();
    W = Math.max(320, rect.width);
    H = Math.max(360, rect.height);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Centre the cloud right-of-centre and a touch high, so the
    // left-aligned headline keeps a clean, dark backdrop.
    cx = W * 0.63;
    cy = H * 0.44;
    var base = Math.min(W, H);
    rx = base * 0.46;
    ry = base * 0.36;
    neighbourThr = base * 0.17;

    var N = W < 760 ? 42 : 72;
    nodes = [];
    var tries = 0;
    while (nodes.length < N && tries < N * 50) {
      tries++;
      var a = Math.random() * Math.PI * 2;
      var rr = Math.sqrt(Math.random());
      var x = Math.cos(a) * rr * rx;
      var y = Math.sin(a) * rr * ry;
      // gentle top bulge / bottom taper — reads as "a mind", stays abstract
      y *= (y < 0 ? 1.0 : 0.8);
      // thin out a faint central seam to suggest two lobes
      if (Math.abs(x) < rx * 0.07 && Math.random() < 0.72) continue;
      nodes.push({
        bx: x, by: y, x: x, y: y,
        ph: Math.random() * Math.PI * 2,
        sp: 0.35 + Math.random() * 0.65,
        amp: 3 + Math.random() * 7,
        r: 1.0 + Math.random() * 1.9
      });
    }

    edges = [];
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[i].bx - nodes[j].bx, dy = nodes[i].by - nodes[j].by;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < neighbourThr) edges.push([i, j, 1 - d / neighbourThr]);
      }
    }
  }

  var t0 = performance.now(), raf;

  function frame(now) {
    var t = (now - t0) / 1000;

    cur.r += (tgt.r - cur.r) * 0.05;
    cur.g += (tgt.g - cur.g) * 0.05;
    cur.b += (tgt.b - cur.b) * 0.05;
    var col = Math.round(cur.r) + "," + Math.round(cur.g) + "," + Math.round(cur.b);

    var pulse = reduce ? 1 : 1 + Math.sin(t * 0.57) * 0.045;            // ~11s breath
    var glow = reduce ? 0.5 : 0.42 + (Math.sin(t * 0.57) * 0.5 + 0.5) * 0.22;

    ctx.clearRect(0, 0, W, H);

    // ambient core halo
    var coreR = Math.max(rx, ry) * 1.55 * pulse;
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
    g.addColorStop(0, "rgba(" + col + "," + (0.16 * glow + 0.05) + ")");
    g.addColorStop(0.5, "rgba(" + col + "," + (0.05 * glow) + ")");
    g.addColorStop(1, "rgba(" + col + ",0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // positions
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var dx = reduce ? 0 : Math.sin(t * n.sp + n.ph) * n.amp;
      var dy = reduce ? 0 : Math.cos(t * n.sp * 0.8 + n.ph) * n.amp;
      n.x = cx + (n.bx + dx) * pulse;
      n.y = cy + (n.by + dy) * pulse;
    }

    // filaments
    ctx.lineWidth = 1;
    for (var e = 0; e < edges.length; e++) {
      var A = nodes[edges[e][0]], B = nodes[edges[e][1]], w = edges[e][2];
      ctx.strokeStyle = "rgba(" + col + "," + (w * 0.2 * glow).toFixed(3) + ")";
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
    }

    // nodes (soft glow + bright core)
    for (var k = 0; k < nodes.length; k++) {
      var nd = nodes[k], rr = nd.r * pulse, halo = rr * 4;
      var ng = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, halo);
      ng.addColorStop(0, "rgba(" + col + "," + (0.85 * glow + 0.1) + ")");
      ng.addColorStop(1, "rgba(" + col + ",0)");
      ctx.fillStyle = ng;
      ctx.beginPath();
      ctx.arc(nd.x, nd.y, halo, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(" + col + ",0.92)";
      ctx.beginPath();
      ctx.arc(nd.x, nd.y, rr, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(frame);
  }

  function start() { cancelAnimationFrame(raf); build(); raf = requestAnimationFrame(frame); }
  start();

  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(start, 200); }, { passive: true });
})();
