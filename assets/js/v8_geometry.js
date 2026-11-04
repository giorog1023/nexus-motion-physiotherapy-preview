// V8 Real 3D Glass Geometry Builder for Nexus Motion Treatment Cards
(function(window) {
  'use strict';

  const SX = 2.32;
  const SY = 1.51;
  const SZ = 0.35;
  const LOCAL_HALF_SPAN = 0.379824697971344;
  const LOCAL_FRONT_Z = 0.018984280526638;
  const HALF_W = LOCAL_HALF_SPAN * SX; // 0.8811933 world units
  const HALF_H = LOCAL_HALF_SPAN * SY; // 0.5735353 world units
  const FRONT_WZ = LOCAL_FRONT_Z * SZ; // +0.0066445 world units
  const CORNER_R = 0.082 * (2.0 * HALF_H); // 0.0940598 world units

  function buildV8CardGeometry(opts) {
    opts = opts || {};
    const stage = opts.stage || 'E'; // 'B', 'C', 'D', 'E'
    const stageNum = stage === 'B' ? 2.0 : (stage === 'C' ? 3.0 : (stage === 'D' ? 4.0 : 5.0));

    // Physical dimensions matching Original Reference Card 02 & Card 03:
    // Total physical thickness: 0.136 world units (~7.7% of card width, ~10x thicker than V7's 0.0133)
    const thickness = typeof opts.thickness === 'number' ? opts.thickness : 0.136;
    const frontBevelR = typeof opts.frontBevelR === 'number' ? opts.frontBevelR : 0.032;
    const rearBevelR = typeof opts.rearBevelR === 'number' ? opts.rearBevelR : 0.026;

    const cornerSegs = 20;
    const straightSegsX = 10;
    const straightSegsY = 8;
    const frontBevelSegs = 8;
    const sideSegs = 4;
    const rearBevelSegs = 8;

    const zFront = FRONT_WZ;
    const zRear = zFront - thickness;
    const cxAbs = HALF_W - CORNER_R;
    const cyAbs = HALF_H - CORNER_R;

    // Build 2D rounded rectangle perimeter loop (CCW)
    const loop = [];
    // 1. Right straight edge: -cyAbs -> +cyAbs
    for (let i = 0; i < straightSegsY; i++) {
      const wy = -cyAbs + (i / straightSegsY) * (2 * cyAbs);
      loop.push({ cx: cxAbs, cy: wy, ux: 1, uy: 0 });
    }
    // 2. Top-Right corner (+x, +y): 0 -> pi/2
    for (let i = 0; i < cornerSegs; i++) {
      const th = (i / cornerSegs) * (Math.PI * 0.5);
      loop.push({ cx: cxAbs, cy: cyAbs, ux: Math.cos(th), uy: Math.sin(th) });
    }
    // 3. Top straight edge (+y): +cxAbs -> -cxAbs
    for (let i = 0; i < straightSegsX; i++) {
      const wx = cxAbs - (i / straightSegsX) * (2 * cxAbs);
      loop.push({ cx: wx, cy: cyAbs, ux: 0, uy: 1 });
    }
    // 4. Top-Left corner (-x, +y): pi/2 -> pi
    for (let i = 0; i < cornerSegs; i++) {
      const th = Math.PI * 0.5 + (i / cornerSegs) * (Math.PI * 0.5);
      loop.push({ cx: -cxAbs, cy: cyAbs, ux: Math.cos(th), uy: Math.sin(th) });
    }
    // 5. Left straight edge (-x): +cyAbs -> -cyAbs
    for (let i = 0; i < straightSegsY; i++) {
      const wy = cyAbs - (i / straightSegsY) * (2 * cyAbs);
      loop.push({ cx: -cxAbs, cy: wy, ux: -1, uy: 0 });
    }
    // 6. Bottom-Left corner (-x, -y): pi -> 3pi/2
    for (let i = 0; i < cornerSegs; i++) {
      const th = Math.PI + (i / cornerSegs) * (Math.PI * 0.5);
      loop.push({ cx: -cxAbs, cy: -cyAbs, ux: Math.cos(th), uy: Math.sin(th) });
    }
    // 7. Bottom straight edge (-y): -cxAbs -> +cxAbs
    for (let i = 0; i < straightSegsX; i++) {
      const wx = -cxAbs + (i / straightSegsX) * (2 * cxAbs);
      loop.push({ cx: wx, cy: -cyAbs, ux: 0, uy: -1 });
    }
    // 8. Bottom-Right corner (+x, -y): 3pi/2 -> 2pi
    for (let i = 0; i < cornerSegs; i++) {
      const th = Math.PI * 1.5 + (i / cornerSegs) * (Math.PI * 0.5);
      loop.push({ cx: cxAbs, cy: -cyAbs, ux: Math.cos(th), uy: Math.sin(th) });
    }

    const M = loop.length;
    let totalArc = 0;
    const arcCoords = [0];
    for (let i = 0; i < M; i++) {
      const a = loop[i], b = loop[(i + 1) % M];
      const ax = a.cx + CORNER_R * a.ux, ay = a.cy + CORNER_R * a.uy;
      const bx = b.cx + CORNER_R * b.ux, by = b.cy + CORNER_R * b.uy;
      totalArc += Math.hypot(bx - ax, by - ay);
      if (i < M - 1) arcCoords.push(totalArc);
    }
    for (let i = 0; i < M; i++) {
      const sRaw = arcCoords[i] / totalArc;
      loop[i].sSym = 1.0 - Math.abs(2.0 * sRaw - 1.0);
    }

    const fbR = (stage === 'B') ? 0.0 : frontBevelR;
    const rbR = (stage === 'E') ? rearBevelR : 0.0;

    const positions = [];
    const normals = [];
    const uvs = [];
    const surfaceInfo = [];
    const indices = [];

    function pushVertex(wx, wy, wz, nwx, nwy, nwz, u, v, fMask, prof, bev) {
      const lx = wx / SX, ly = wy / SY, lz = wz / SZ;
      let nlx = nwx * SX, nly = nwy * SY, nlz = nwz * SZ;
      const len = Math.hypot(nlx, nly, nlz) || 1.0;
      positions.push(lx, ly, lz);
      normals.push(nlx / len, nly / len, nlz / len);
      uvs.push(u, v);
      surfaceInfo.push(fMask, prof, bev, stageNum);
      return (positions.length / 3) - 1;
    }

    function planarFrontUV(wx, wy) {
      // Direct Euclidean Cartesian mapping matching Pass 1 V19 / Pass 2 V7
      return [0.5 - (wx / SX) / 0.75964, 0.5 - (wy / SY) / 0.75964];
    }

    const rings = [];
    function addScaleRing(scaleFactor, wz, nwz, fMask, prof, bev, useFrontUV) {
      const baseInset = Math.max(fbR + 0.012, 0.046);
      const ring = [];
      for (let i = 0; i < M; i++) {
        const p = loop[i];
        const wx = (p.cx + (CORNER_R - baseInset) * p.ux) * scaleFactor;
        const wy = (p.cy + (CORNER_R - baseInset) * p.uy) * scaleFactor;
        const uv = useFrontUV ? planarFrontUV(wx, wy) : [0.5 + (wx / (2 * HALF_W)), 0.5 - (wy / (2 * HALF_H))];
        ring.push(pushVertex(wx, wy, wz, 0, 0, nwz, uv[0], uv[1], fMask, prof, bev));
      }
      rings.push(ring);
    }

    function addInsetRing(rho, wz, nr, nz, fMask, prof, bev, useFrontUV) {
      const ring = [];
      for (let i = 0; i < M; i++) {
        const p = loop[i];
        const wx = p.cx + (CORNER_R - rho) * p.ux;
        const wy = p.cy + (CORNER_R - rho) * p.uy;
        const uv = useFrontUV ? planarFrontUV(wx, wy) : [p.sSym, prof];
        ring.push(pushVertex(wx, wy, wz, p.ux * nr, p.uy * nr, nz, uv[0], uv[1], fMask, prof, bev));
      }
      rings.push(ring);
    }

    // Front Flat Center Vertex + Rings
    const cUV = planarFrontUV(0, 0);
    const frontCenterIdx = pushVertex(0, 0, zFront, 0, 0, 1, cUV[0], cUV[1], 1.0, 0.0, 0.0);
    addScaleRing(0.32, zFront, 1, 1.0, 0.0, 0.0, true);
    addScaleRing(0.66, zFront, 1, 1.0, 0.0, 0.0, true);
    addScaleRing(1.00, zFront, 1, 1.0, 0.0, 0.0, true);
    addInsetRing(fbR + 0.004, zFront, 0, 1, 1.0, 0.0, 0.0, true);

    if (stage === 'B') {
      addInsetRing(0.0008, zFront, 0, 1, 0.0, 0.02, 0.0, false);
      addInsetRing(0.0, zFront - 0.0008, 1, 0, 0.0, 0.30, 0.0, false);
      for (let s = 1; s <= sideSegs; s++) {
        const t = s / sideSegs;
        const wz = (zFront - 0.0008) - t * (thickness - 0.0016);
        addInsetRing(0.0, wz, 1, 0, 0.0, 0.30 + 0.40 * t, 0.0, false);
      }
      addInsetRing(0.0008, zRear, 0, -1, 0.0, 0.98, 0.0, false);
    } else {
      // Front rounded bevel
      for (let s = 0; s <= frontBevelSegs; s++) {
        const t = s / frontBevelSegs;
        const alpha = t * (Math.PI * 0.5);
        const rho = fbR * (1.0 - Math.sin(alpha));
        const wz = (zFront - fbR) + fbR * Math.cos(alpha);
        addInsetRing(rho, wz, Math.sin(alpha), Math.cos(alpha), 0.0, 0.30 * t, Math.sin(t * Math.PI), false);
      }
      // Modeled side wall
      const zSideStart = zFront - fbR;
      const zSideEnd = zRear + (rbR > 0 ? rbR : 0.0008);
      const nSide = (stage === 'C') ? 1 : sideSegs;
      for (let s = 1; s <= nSide; s++) {
        const t = s / nSide;
        const wz = zSideStart + t * (zSideEnd - zSideStart);
        addInsetRing(0.0, wz, 1, 0, 0.0, 0.30 + 0.40 * t, 0.25, false);
      }
      if (rbR > 0) {
        // Rear rounded bevel
        for (let s = 1; s <= rearBevelSegs; s++) {
          const t = s / rearBevelSegs;
          const beta = t * (Math.PI * 0.5);
          const rho = rbR * (1.0 - Math.cos(beta));
          const wz = (zRear + rbR) - rbR * Math.sin(beta);
          addInsetRing(rho, wz, Math.cos(beta), -Math.sin(beta), 0.0, 0.70 + 0.30 * t, Math.sin(t * Math.PI), false);
        }
      } else {
        addInsetRing(0.0008, zRear, 0, -1, 0.0, 0.98, 0.0, false);
      }
    }

    // Rear Flat Cap Rings + Center Vertex
    addScaleRing(1.00, zRear, -1, 0.0, 1.0, 0.0, false);
    addScaleRing(0.55, zRear, -1, 0.0, 1.0, 0.0, false);
    const rearCenterIdx = pushVertex(0, 0, zRear, 0, 0, -1, 0.5, 0.5, 0.0, 1.0, 0.0);

    // Triangulation
    const firstRing = rings[0];
    for (let i = 0; i < M; i++) indices.push(frontCenterIdx, firstRing[i], firstRing[(i + 1) % M]);
    for (let r = 0; r < rings.length - 1; r++) {
      const r0 = rings[r], r1 = rings[r + 1];
      for (let i = 0; i < M; i++) {
        const next = (i + 1) % M;
        indices.push(r0[i], r1[i], r1[next], r0[i], r1[next], r0[next]);
      }
    }
    const lastRing = rings[rings.length - 1];
    for (let i = 0; i < M; i++) indices.push(lastRing[i], rearCenterIdx, lastRing[(i + 1) % M]);

    const geom = new Geometry();
    geom.addAttribute('position', new GeometryAttribute(new Float32Array(positions), 3));
    geom.addAttribute('normal', new GeometryAttribute(new Float32Array(normals), 3));
    geom.addAttribute('uv', new GeometryAttribute(new Float32Array(uvs), 2));
    geom.addAttribute('aSurfaceInfo', new GeometryAttribute(new Float32Array(surfaceInfo), 4));
    geom.setIndex(new Uint16Array(indices));
    geom.computeBoundingBox();
    geom.computeBoundingSphere();
    return geom;
  }

  window.buildV8CardGeometry = buildV8CardGeometry;
})(typeof window !== 'undefined' ? window : global);
