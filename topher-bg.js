/* ============================================================
   Topher AI — "Living Veins" ambient background
   Self-contained, drop-in atmosphere layer. No markup / asset
   dependencies — include this script on any page.

   - Organic, neural/capillary veins (NOT circuit traces)
   - Heart-Coral, very low opacity — felt, not seen
   - Concentrated at edges & corners, branching inward, the
     center/content zone kept clean (density-graded + masked)
   - ONE motion: a slow pulse of light travels a random vein
     every few seconds. Reduced-motion → fully static.
   - Lighter & rarer on mobile; pauses when tab is hidden
   - Non-interactive, sits behind UI chrome, never touches text

   Tuning: bump LAYER_OPACITY up/down to dial the whole effect.
   ============================================================ */
(function () {
  "use strict";
  if (window.__topherVeins) return;
  window.__topherVeins = true;

  var CORAL = "#E8826B";
  var PULSE = "#F6C9BB";
  var NS = "http://www.w3.org/2000/svg";
  var LAYER_OPACITY = 0.32;            // ← master dial (start faint)

  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function isMobile() { return Math.min(window.innerWidth, window.innerHeight) < 680; }
  function rng(a, b) { return a + (b - a) * Math.random(); }

  var W = 0, H = 0, cx = 0, cy = 0, clearR = 0;
  var longPaths = [];
  var layer, svg, gVeins, gPulse, pulseTimer = null, built = false, buildTries = 0;

  // ---- scaffold -------------------------------------------------------
  function scaffold() {
    layer = document.createElement("div");
    layer.id = "topher-veins";
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText = [
      "position:fixed", "inset:0", "width:100%", "height:100%",
      "pointer-events:none", "z-index:1", "overflow:hidden",
      "mix-blend-mode:screen",
      "opacity:" + LAYER_OPACITY,
      "contain:strict"
    ].join(";");

    // keep the center/text zone clean no matter what
    var mask = "radial-gradient(135% 120% at 50% 45%," +
      "transparent 0%, transparent 39%, rgba(0,0,0,.55) 62%," +
      "rgba(0,0,0,.9) 82%, #000 100%)";
    layer.style.webkitMaskImage = mask;
    layer.style.maskImage = mask;

    svg = document.createElementNS(NS, "svg");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    var defs = document.createElementNS(NS, "defs");
    defs.innerHTML =
      '<filter id="tv-glow" x="-60%" y="-60%" width="220%" height="220%">' +
      '<feGaussianBlur stdDeviation="2.4"/></filter>';
    svg.appendChild(defs);
    gVeins = document.createElementNS(NS, "g");
    gPulse = document.createElementNS(NS, "g");
    svg.appendChild(gVeins);
    svg.appendChild(gPulse);
    layer.appendChild(svg);

    if (document.body.firstChild) document.body.insertBefore(layer, document.body.firstChild);
    else document.body.appendChild(layer);
  }

  function distToCenter(x, y) {
    var dx = (x - cx) / (W * 0.5), dy = (y - cy) / (H * 0.5);
    return Math.sqrt(dx * dx + dy * dy); // ~0 center → ~1 edge
  }

  // grow one organic vein (recursive, curved, branching) -----------------
  function grow(x, y, ang, len, width, opacity, depth) {
    if (depth > 5 || len < 24 || width < 0.2) return;
    var steps = Math.max(2, Math.round(len / rng(36, 66)));
    var seg = len / steps;
    var d = "M" + x.toFixed(1) + " " + y.toFixed(1);
    var px = x, py = y, approx = 0;

    for (var i = 0; i < steps; i++) {
      ang += rng(-0.4, 0.4);                       // gentle wander
      var nx = px + Math.cos(ang) * seg;
      var ny = py + Math.sin(ang) * seg;
      var mx = px + Math.cos(ang - rng(-0.3, 0.3)) * seg * 0.5;
      var my = py + Math.sin(ang - rng(-0.3, 0.3)) * seg * 0.5;
      d += " Q" + mx.toFixed(1) + " " + my.toFixed(1) + " " + nx.toFixed(1) + " " + ny.toFixed(1);
      approx += seg; px = nx; py = ny;
      if (distToCenter(px, py) < clearR) break;    // don't invade the text zone
    }

    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", CORAL);
    p.setAttribute("stroke-width", width.toFixed(2));
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("opacity", opacity.toFixed(3));
    gVeins.appendChild(p);

    if (approx > 170 && distToCenter(px, py) > clearR + 0.04) longPaths.push(p);

    // branches taper off the trunk
    var branches = depth < 2 ? (Math.random() < 0.85 ? 2 : 1) : (Math.random() < 0.5 ? 1 : 0);
    for (var b = 0; b < branches; b++) {
      var t = rng(0.4, 0.92);
      var bx = x + (px - x) * t, by = y + (py - y) * t;
      grow(bx, by, ang + rng(-1.0, 1.0), len * rng(0.45, 0.7),
        width * rng(0.55, 0.78), opacity * rng(0.8, 1.0), depth + 1);
    }
  }

  function build() {
    W = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
    H = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
    if (!W || !H) {                       // viewport not measurable yet
      if (buildTries++ < 60) setTimeout(build, 120); // retry regardless of paint state
      return;
    }
    buildTries = 0;
    cx = W / 2; cy = H * 0.46; clearR = 0.46;
    longPaths = [];
    while (gVeins.firstChild) gVeins.removeChild(gVeins.firstChild);
    while (gPulse.firstChild) gPulse.removeChild(gPulse.firstChild);
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);

    var mobile = isMobile();
    var trunks = mobile ? 9 : 17;
    for (var i = 0; i < trunks; i++) {
      var edge = i % 4, t = Math.random(), x, y, a;
      if (edge === 0) { x = t * W; y = -12; a = Math.PI / 2 + rng(-0.5, 0.5); }
      else if (edge === 1) { x = W + 12; y = t * H; a = Math.PI + rng(-0.5, 0.5); }
      else if (edge === 2) { x = t * W; y = H + 12; a = -Math.PI / 2 + rng(-0.5, 0.5); }
      else { x = -12; y = t * H; a = 0 + rng(-0.5, 0.5); }
      grow(x, y, a, rng(H * 0.28, H * 0.5), rng(1.1, 1.8), rng(0.5, 0.75), 0);
    }
    var corners = [[0, 0, Math.PI / 4], [W, 0, 3 * Math.PI / 4],
                   [0, H, -Math.PI / 4], [W, H, -3 * Math.PI / 4]];
    var cn = mobile ? 2 : 3;
    corners.forEach(function (c) {
      for (var k = 0; k < cn; k++)
        grow(c[0], c[1], c[2] + rng(-0.6, 0.6), rng(H * 0.3, H * 0.55),
          rng(1.2, 2.0), rng(0.55, 0.8), 0);
    });
    built = true;
  }

  // ---- the one allowed motion: a pulse travelling a vein --------------
  function firePulse() {
    if (reduce || document.hidden || !longPaths.length) return;
    var src = longPaths[(Math.random() * longPaths.length) | 0];
    var len; try { len = src.getTotalLength(); } catch (e) { return; }
    if (!len || len < 80) return;

    var hp = document.createElementNS(NS, "path");
    hp.setAttribute("d", src.getAttribute("d"));
    hp.setAttribute("fill", "none");
    hp.setAttribute("stroke", PULSE);
    hp.setAttribute("stroke-linecap", "round");
    hp.setAttribute("stroke-width", (parseFloat(src.getAttribute("stroke-width")) + 0.7).toFixed(2));
    hp.setAttribute("filter", "url(#tv-glow)");
    var dash = Math.min(140, Math.max(55, len * 0.2));
    hp.style.strokeDasharray = dash + " " + (len + dash);
    gPulse.appendChild(hp);

    var dur = 2200 + Math.random() * 1500;
    var anim = hp.animate(
      [{ strokeDashoffset: len + dash, opacity: 0 },
       { opacity: 0.5, offset: 0.16 },
       { opacity: 0.5, offset: 0.8 },
       { strokeDashoffset: -dash, opacity: 0 }],
      { duration: dur, easing: "cubic-bezier(.45,0,.5,1)" });
    anim.onfinish = function () { if (hp.parentNode) hp.parentNode.removeChild(hp); };
  }

  function schedule() {
    if (reduce) return;
    var mobile = isMobile();
    var wait = mobile ? rng(5200, 10000) : rng(2800, 6200);
    pulseTimer = setTimeout(function () { firePulse(); schedule(); }, wait);
  }

  // ---- lifecycle ------------------------------------------------------
  var rt;
  function onResize() {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var nw = window.innerWidth;
      if (Math.abs(nw - W) < 40 && built) return; // ignore mobile URL-bar jitter
      build();
    }, 260);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { clearTimeout(pulseTimer); }
    else if (!reduce) { clearTimeout(pulseTimer); schedule(); }
  });

  function init() {
    if (document.getElementById("topher-veins")) return;
    scaffold();
    build();
    window.addEventListener("resize", onResize, { passive: true });
    // self-correct if the script ran before layout had real dimensions
    window.addEventListener("load", function () {
      var nw = window.innerWidth || document.documentElement.clientWidth || 0;
      if (!built || !longPaths.length || Math.abs(nw - W) >= 40) build();
    });
    if (!reduce) schedule();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
