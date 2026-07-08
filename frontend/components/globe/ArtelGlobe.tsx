"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";

// ───── ROSCA 24 countries ─────

const ROSCA_MARKERS = [
  { flag: "🇮🇩", country: "Indonesia",            rosca: "Arisan",        lat: -6.21,  lon: 106.85 },
  { flag: "🇮🇳", country: "India",                rosca: "Chit Fund",     lat: 9.93,   lon: 76.26 },
  { flag: "🇰🇷", country: "South Korea",          rosca: "Kye",           lat: 37.57,  lon: 126.98 },
  { flag: "🇪🇹", country: "Ethiopia",              rosca: "Equb",          lat: 9.03,   lon: 38.74 },
  { flag: "🇳🇬", country: "Nigeria",               rosca: "Esusu / Ajo",   lat: 6.52,   lon: 3.38 },
  { flag: "🇪🇬", country: "Egypt",                 rosca: "Gameya",        lat: 30.04,  lon: 31.24 },
  { flag: "🇲🇽", country: "Mexico",                rosca: "Tanda",         lat: 19.43,  lon: -99.13 },
  { flag: "🇧🇷", country: "Brazil",                rosca: "Consórcio",     lat: -23.55, lon: -46.63 },
  { flag: "🇵🇭", country: "Philippines",           rosca: "Paluwagan",     lat: 14.60,  lon: 120.98 },
  { flag: "🇹🇼", country: "Taiwan",                rosca: "Biao Hui",      lat: 25.03,  lon: 121.56 },
  { flag: "🇯🇵", country: "Japan",                 rosca: "Mujin",         lat: 35.68,  lon: 139.65 },
  { flag: "🇻🇳", country: "Vietnam",               rosca: "Hụi",           lat: 10.78,  lon: 106.70 },
  { flag: "🇨🇲", country: "Cameroon",              rosca: "Njangi",        lat: 3.87,   lon: 11.52 },
  { flag: "🇵🇰", country: "Pakistan",              rosca: "Committee",     lat: 24.86,  lon: 67.01 },
  { flag: "🇯🇲", country: "Jamaica",               rosca: "Partner",       lat: 17.97,  lon: -76.79 },
  { flag: "🇹🇹", country: "Trinidad & Tobago",     rosca: "Sou-Sou",       lat: 10.65,  lon: -61.52 },
  { flag: "🇰🇪", country: "Kenya",                 rosca: "Chama",         lat: -1.29,  lon: 36.82 },
  { flag: "🇧🇩", country: "Bangladesh",            rosca: "Samity",        lat: 23.81,  lon: 90.41 },
  { flag: "🇳🇵", country: "Nepal",                 rosca: "Dhikuti",       lat: 27.72,  lon: 85.32 },
  { flag: "🇱🇰", country: "Sri Lanka",             rosca: "Seettu",        lat: 6.93,   lon: 79.85 },
  { flag: "🇲🇦", country: "Morocco",               rosca: "Daret",         lat: 34.02,  lon: -6.83 },
  { flag: "🇧🇴", country: "Bolivia",               rosca: "Pasanaku",      lat: -16.50, lon: -68.15 },
  { flag: "🇫🇷", country: "France",                rosca: "Tontine",       lat: 48.86,  lon: 2.35 },
  { flag: "🇬🇧", country: "United Kingdom",        rosca: "Pardner",       lat: 51.51,  lon: -0.13 },
];

// ───── Core globe component ─────

export default function ArtelGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelContainerRef = useRef<HTMLDivElement>(null);
  const [labels, setLabels] = useState<Array<{ x: number; y: number; visible: boolean; data: typeof ROSCA_MARKERS[0]; idx: number }>>([]);
  const sceneRef = useRef<{ camera: THREE.PerspectiveCamera; earth: THREE.Mesh; clouds: THREE.Mesh; earthGroup: THREE.Group; renderer: THREE.WebGLRenderer; markers: THREE.Group[]; labelData: Array<{ anchor: THREE.Group; el: HTMLDivElement }> } | null>(null);

  const initLabelDivs = useCallback(() => {
    const container = labelContainerRef.current;
    if (!container) return [];
    container.innerHTML = "";
    return ROSCA_MARKERS.map((m) => {
      const el = document.createElement("div");
      el.innerHTML = `<span style="font-size:16px">${m.flag}</span><span style="font-weight:700;color:#fff">${m.country}</span><span style="color:#ffcf6b;font-weight:500">— ${m.rosca}</span>`;
      Object.assign(el.style, {
        position: "absolute", top: "0", left: "0",
        display: "inline-flex", alignItems: "center", gap: "6px",
        whiteSpace: "nowrap", background: "rgba(8,16,30,0.9)",
        border: "1px solid rgba(255,195,90,0.85)", borderRadius: "8px",
        padding: "4px 10px 4px 7px", fontSize: "12px", lineHeight: "1.3",
        color: "#fff", opacity: "0", pointerEvents: "none",
        willChange: "transform, opacity",
        transition: "opacity 0.4s ease",
        zIndex: "100",
      });
      container.appendChild(el);
      return { el, anchor: null as unknown as THREE.Group };
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // ── Scene setup ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.set(0, 0, 13);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    container.appendChild(renderer.domElement);

    // ── Stars ──
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 200 + Math.random() * 300;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      starPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.8 })));

    // ── Lighting ──
    scene.add(new THREE.DirectionalLight(0xffffff, 2.4).translateX(-8).translateY(3).translateZ(6));
    scene.add(new THREE.AmbientLight(0x30507a, 1));

    // ── Earth + Clouds ──
    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = THREE.MathUtils.degToRad(23.4);
    scene.add(earthGroup);

    const earthMat = new THREE.MeshPhongMaterial({
      map: makeEarthTex(),
      specular: new THREE.Color(0x335577),
      shininess: 14,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(5, 96, 96), earthMat);
    earthGroup.add(earth);

    const cloudMat = new THREE.MeshLambertMaterial({
      map: makeCloudTex(),
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(5.06, 64, 64), cloudMat);
    earthGroup.add(clouds);

    // ── Atmosphere ──
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: `varying vec3 vN; void main() { vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `varying vec3 vN; void main() { float i = pow(.68-dot(vN,vec3(0,0,1)),3.); gl_FragColor=vec4(.35,.55,1.,1.)*i; }`,
      blending: THREE.AdditiveBlending, side: THREE.BackSide, transparent: true,
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(5.35, 64, 64), atmoMat));

    // ── ROSCA markers ──
    const markers: THREE.Group[] = [];
    const labelDivs = initLabelDivs();

    ROSCA_MARKERS.forEach((m, idx) => {
      const sp = latLonToVec(m.lat, m.lon, 5.004);
      const normal = sp.clone().normalize();
      const group = new THREE.Group();
      group.position.copy(sp);
      group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      group.add(new THREE.Mesh(new THREE.CircleGeometry(0.032, 16), new THREE.MeshBasicMaterial({ color: 0xffc85a })));
      group.add(new THREE.Mesh(new THREE.RingGeometry(0.055, 0.07, 28), new THREE.MeshBasicMaterial({ color: 0xffc85a, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })));
      earth.add(group);
      markers.push(group);
      if (labelDivs[idx]) labelDivs[idx].anchor = group;
    });

    // ── Interaction ──
    let dragging = false, lastX = 0, lastY = 0;
    let autoRotate = true;
    let targetRotY = 0, userRotX = 0;

    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch" && e.isPrimary === false) return;
      dragging = true; autoRotate = false;
      lastX = e.clientX; lastY = e.clientY;
      renderer.domElement.style.cursor = "grabbing";
    });
    window.addEventListener("pointerup", () => { dragging = false; renderer.domElement.style.cursor = "grab"; });
    window.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      targetRotY += (e.clientX - lastX) * 0.005;
      userRotX = THREE.MathUtils.clamp(userRotX + (e.clientY - lastY) * 0.005, -1, 1);
      lastX = e.clientX; lastY = e.clientY;
    });
    renderer.domElement.addEventListener("wheel", (e) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + e.deltaY * 0.01, 7, 24);
    }, { passive: false });

    const onResize = () => {
      const w2 = container.clientWidth, h2 = container.clientHeight;
      camera.aspect = w2 / h2; camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    window.addEventListener("resize", onResize);

    // ── Label update ──
    const tmpV = new THREE.Vector3(), tmpN = new THREE.Vector3();

    const updateLabels = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const items = labelDivs.map((ld, i) => {
        if (!ld.anchor) return { ld, i, sx: 0, sy: 0, facing: -1, visible: false };
        ld.anchor.getWorldPosition(tmpV);
        const normal = tmpV.clone().normalize();
        const facing = normal.dot(camera.position.clone().sub(tmpV).normalize());
        tmpN.copy(tmpV).project(camera);
        return { ld, i, sx: (tmpN.x * 0.5 + 0.5) * w, sy: (1 - (tmpN.y * 0.5 + 0.5)) * h, facing, visible: facing > -0.25 && tmpN.z < 1 };
      });

      const visible = items.filter(it => it.visible).sort((a, b) => a.sy - b.sy);
      const placed: Array<{ x: number; y: number; w: number; h: number }> = [];
      const pad = 6;

      visible.forEach(it => {
        const el2 = it.ld.el;
        const rect = el2.getBoundingClientRect();
        const lw = rect.width || 130, lh = rect.height || 20;
        let lx = it.sx + 16, ly = it.sy - lh / 2;
        if (lx + lw > w - 8) lx = it.sx - lw - 16;
        lx = Math.max(8, Math.min(lx, w - lw - 8));
        for (let g = 0; g < 80; g++) {
          const hit = placed.find(r => lx < r.x + r.w + pad && lx + lw + pad > r.x && ly < r.y + r.h + pad && ly + lh + pad > r.y);
          if (!hit) break;
          ly = hit.y + hit.h + pad;
        }
        ly = Math.max(8, Math.min(ly, h - lh - 8));
        placed.push({ x: lx, y: ly, w: lw, h: lh });
        const op = Math.min(1, (it.facing + 0.25) / 0.55);
        el2.style.opacity = String(op);
        el2.style.transform = `translate(${lx}px, ${ly}px)`;
      });

      items.forEach(it => {
        if (!it.visible) it.ld.el.style.opacity = "0";
      });
    };

    // ── Animate ──
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (autoRotate) targetRotY += 0.0010;
      earth.rotation.y = targetRotY;
      clouds.rotation.y = targetRotY * 1.15;
      earthGroup.rotation.x = userRotX * 0.6;
      renderer.render(scene, camera);
      updateLabels();
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      window.removeEventListener("resize", onResize);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [initLabelDivs]);

  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10, color: "rgba(255,210,130,0.85)", fontSize: 12, letterSpacing: "0.08em", background: "rgba(8,16,30,0.55)", border: "1px solid rgba(255,195,90,0.35)", padding: "8px 14px", borderRadius: 10, pointerEvents: "none" }}>
        🟡 24 ROSCA traditions worldwide — drag to rotate, scroll to zoom
      </div>
      <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, zIndex: 10, overflow: "hidden", pointerEvents: "none" }}>
        <style>{`@keyframes marqueeScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }`}</style>
        <div style={{ display: "flex", width: "max-content", gap: "40px", whiteSpace: "nowrap", animation: "marqueeScroll 60s linear infinite" }}>
          {Array.from({ length: 3 }, (_, i) => (
              <span key={i} style={{ color: "rgba(212,160,23,0.55)", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              A Rotating Savings and Credit Association (ROSCA) is an informal, peer-to-peer financial group. Members pool fixed regular contributions into a shared fund, taking turns receiving the entire accumulated lump sum on a rotating basis. It functions as a form of non-interest banking and social lending.
            </span>
          ))}
        </div>
      </div>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      <div ref={labelContainerRef} style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none" }} />
    </div>
  );
}

// ───── Helpers ─────

function latLonToVec(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-radius * Math.cos(theta) * Math.sin(phi), radius * Math.cos(phi), radius * Math.sin(theta) * Math.sin(phi));
}

function llToXY(lat: number, lon: number, w: number, h: number) {
  lon = ((lon + 180) % 360 + 360) % 360 - 180;
  return { x: ((lon + 180) / 360) * w, y: ((90 - lat) / 180) * h };
}

function makeEarthTex(): THREE.CanvasTexture {
  const w = 2048, h = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  for (let y = 0; y < h; y += 2) {
    const lat = 90 - (y / h) * 180;
    const eq = 1 - Math.min(Math.abs(lat) / 55, 1);
    const r = Math.round(9 + eq * 8), g = Math.round(38 + eq * 40), bl = Math.round(66 + eq * 55);
    ctx.fillStyle = `rgb(${r},${g},${bl})`;
    ctx.fillRect(0, y, w, 2);
  }

  for (let i = 0; i < 18; i++) {
    const y0 = Math.random() * h;
    const grad = ctx.createLinearGradient(0, y0 - 14, 0, y0 + 14);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.5, `rgba(180,225,255,${0.02 + Math.random() * 0.03})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, y0 - 14, w, 28);
  }

  for (let i = 0; i < 4000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Simplified landmasses — just continents and major islands
  drawContinent(ctx, w, h, [
    [68,-166],[70,-152],[71,-128],[74,-112],[78,-95],[83,-70],[76,-58],[58,-63],[52,-56],[47,-53],[45,-63],[41,-71],[36,-76],[32,-80],[26,-80],[25,-82],[29,-89],[19,-96],[16,-95],[14,-92],[9,-83],[7,-80],[9,-78],[15,-83],[21,-97],[23,-98],[26,-99],[26,-97],[30,-94],[29,-95],[27,-97],[19,-105],[20,-106],[23,-110],[27,-114],[32,-117],[34,-120],[38,-123],[42,-124],[46,-124],[49,-124],[54,-132],[58,-136],[60,-146],[60,-152],[62,-165],[65,-166],[68,-166]
  ], "#4a7a3f");
  drawContinent(ctx, w, h, [
    [12,-72],[11,-74],[9,-77],[7,-78],[2,-80],[-4,-81],[-8,-79],[-14,-76],[-18,-71],[-23,-70],[-30,-71],[-33,-72],[-38,-73],[-42,-73],[-46,-75],[-52,-74],[-54,-71],[-52,-68],[-49,-68],[-45,-67],[-40,-62],[-34,-58],[-34,-54],[-30,-50],[-23,-43],[-16,-39],[-13,-38],[-8,-35],[-3,-40],[0,-50],[2,-51],[5,-52],[8,-59],[10,-62],[10,-65],[11,-68],[12,-72]
  ], "#2f6d3a");
  drawContinent(ctx, w, h, [
    [37,10],[35,25],[32,32],[27,34],[22,38],[15,40],[12,43],[10,45],[2,42],[-1,41],[-8,40],[-15,40],[-20,35],[-26,33],[-30,31],[-34,26],[-34,20],[-29,17],[-22,14],[-17,12],[-8,13],[0,9],[3,10],[4,8],[5,-3],[6,-6],[10,-16],[15,-17],[21,-17],[27,-13],[31,-9],[35,-6],[36,-1],[35,10],[37,10]
  ], "#b89a5c");
  drawContinent(ctx, w, h, [
    [50,1.5],[48,-4.5],[44,-1.2],[43,-9],[37,-9],[36,-6],[38,0],[38,8],[40,15],[38,16.2],[40,19],[42,20],[45,14],[45,13.6],[44,29],[46,30],[50,30],[52,38],[53.9,14.3],[54,10.5],[55,12.9],[56,12.7],[54,8],[53,4],[50,1.5]
  ], "#4a7a3f");
  drawContinent(ctx, w, h, [
    [70,60],[73,80],[75,100],[74,120],[70,150],[65,170],[60,163],[56,163],[52,158],[45,140],[43,132],[40,125],[39,124],[36,126],[34,127],[31,121],[28,120],[23,113],[21,108],[16,108],[10,106],[8,99],[6,100],[3,101],[1,104],[3,113],[6,116],[10,109],[16,102],[18,94],[21,92],[22,88],[19,85],[16,82],[12,80],[8,78],[10,76],[15,73],[20,70],[24,68],[25,66],[27,62],[30,60],[26,56],[24,52],[27,49],[30,48],[33,45],[37,41],[41,40],[43,42],[46,48],[47,52],[45,58],[42,60],[45,60],[50,55],[55,55],[60,58],[65,55],[70,60]
  ], "#4a7a3f");
  drawContinent(ctx, w, h, [
    [28,70],[33,74],[35,77],[30,81],[28,88],[25,89],[22,89],[21,87],[17,83],[13,80],[10,79],[8,77],[9,76],[12,75],[16,73],[20,72],[23,68],[24,67],[28,70]
  ], "#2f6d3a");
  drawContinent(ctx, w, h, [
    [-11,142],[-14,145],[-17,146],[-20,149],[-24,152],[-28,153],[-33,151],[-38,148],[-38,144],[-35,137],[-33,134],[-32,127],[-34,119],[-33,115],[-28,114],[-22,114],[-18,122],[-15,128],[-12,130],[-11,132],[-12,136],[-11,142]
  ], "#b89a5c");
  // Southeast Asia islands
  drawContinent(ctx, w, h, [
    [5.5,95.3],[3,98],[-1,101],[-4,103],[-5.9,105.1],[-5.5,104],[-3,102],[0,99],[3,97],[5.5,95.3]
  ], "#2f6d3a");
  drawContinent(ctx, w, h, [
    [-6.1,105.9],[-6.9,108.5],[-7.7,111.5],[-8.3,114.4],[-8.5,115.5],[-7.7,113],[-6.9,109],[-6.1,105.9]
  ], "#2f6d3a");
  drawContinent(ctx, w, h, [
    [4.2,117.8],[3.4,113.5],[2,109.4],[-1,109],[-3,114],[-4,113.5],[-2,116.5],[1.5,117.4],[4.2,117.8]
  ], "#2f6d3a");
  drawContinent(ctx, w, h, [
    [1.4,120.8],[0.5,123.0],[-0.3,123.5],[-1.5,122.8],[-2.5,121.0],[-3.5,121.5],[-5.2,119.8],[-5.6,119.4],[-4.0,119.6],[-3.0,120.0],[-2.0,120.5],[-1.0,119.9],[0.0,119.5],[1.0,120.0],[1.4,120.8]
  ], "#2f6d3a");
  drawContinent(ctx, w, h, [
    [18.5,120.8],[18.3,122.2],[16.5,122.2],[14.6,121.6],[13.9,120.9],[13.5,123.9],[12.5,124.0],[12.0,122.1],[13.5,120.0],[16.0,119.9],[18.5,120.8]
  ], "#2f6d3a");
  drawContinent(ctx, w, h, [
    [9.8,123.0],[9.6,125.6],[8.0,126.6],[6.0,125.9],[5.6,125.4],[6.1,122.0],[7.7,121.9],[8.6,123.0],[9.8,123.0]
  ], "#2f6d3a");
  drawContinent(ctx, w, h, [
    [0,131],[-3,135],[-5,141],[-8,142],[-9,138],[-6,132],[-2,130],[0,131]
  ], "#2f6d3a");
  drawContinent(ctx, w, h, [
    [25.3,121.5],[24.5,121.9],[23,121.5],[22,120.7],[23,120],[24.5,120.3],[25.3,121.5]
  ], "#2f6d3a");
  // Japan
  drawContinent(ctx, w, h, [
    [45.5,141.9],[45.3,144.0],[43.3,145.8],[42.3,143.3],[41.4,140.3],[43.0,140.6],[45.5,141.9]
  ], "#4a7a3f");
  drawContinent(ctx, w, h, [
    [41.5,140.9],[40.5,141.9],[39.0,141.9],[38.0,141.0],[36.9,140.9],[35.5,140.9],[35.0,139.7],[34.6,135.4],[35.5,133.2],[36.5,133.4],[37.9,138.9],[38.3,139.7],[40.0,139.8],[41.0,140.0],[41.5,140.9]
  ], "#4a7a3f");
  // Korea
  drawContinent(ctx, w, h, [
    [43,130],[42,128],[40,124.5],[38,125],[37,126.5],[35,126],[34,126.5],[35,129],[37,129],[39,128],[41,129.5],[43,130]
  ], "#4a7a3f");
  drawContinent(ctx, w, h, [
    [9.8,80],[9,81.5],[7,81.9],[6,81.5],[6,80],[7,79.8],[9.8,80]
  ], "#2f6d3a");
  // UK
  drawContinent(ctx, w, h, [
    [58.6,-3.0],[57.7,-4.0],[56.5,-2.7],[55.0,-1.6],[53.5,0.3],[52.0,1.5],[51.0,1.4],[50.0,-4.5],[51.2,-4.7],[51.6,-5.1],[52.9,-4.9],[53.4,-4.8],[54.9,-3.4],[55.0,-5.0],[56.5,-5.8],[57.5,-5.5],[58.6,-6.2],[58.6,-3.0]
  ], "#4a7a3f");
  // Caribbean
  drawContinent(ctx, w, h, [
    [23.2,-82.4],[22.4,-79.3],[20.7,-74.2],[19.9,-75.6],[20.7,-77.6],[21.9,-80.0],[23.2,-82.4]
  ], "#2f6d3a");

  // Ice caps
  let iceGrad = ctx.createLinearGradient(0, 0, 0, h * 0.08);
  iceGrad.addColorStop(0, "rgba(255,255,255,0.9)");
  iceGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = iceGrad;
  ctx.fillRect(0, 0, w, h * 0.08);

  iceGrad = ctx.createLinearGradient(0, h * 0.92, 0, h);
  iceGrad.addColorStop(0, "rgba(255,255,255,0)");
  iceGrad.addColorStop(1, "rgba(255,255,255,0.9)");
  ctx.fillStyle = iceGrad;
  ctx.fillRect(0, h * 0.92, w, h * 0.08);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function drawContinent(ctx: CanvasRenderingContext2D, w: number, h: number, coords: number[][], color: string) {
  ctx.beginPath();
  coords.forEach((c, i) => {
    const p = llToXY(c[0], c[1], w, h);
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  // Bounding box for texture noise
  const xs = coords.map(c => llToXY(c[0], c[1], w, h).x);
  const ys = coords.map(c => llToXY(c[0], c[1], w, h).y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const range = Math.max((maxX - minX) * (maxY - minY) / 300, 8);
  for (let i = 0; i < range; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`;
    ctx.beginPath();
    ctx.arc(minX + Math.random() * (maxX - minX), minY + Math.random() * (maxY - minY), Math.random() * 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(20,45,30,0.3)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function makeCloudTex(): THREE.CanvasTexture {
  const w = 1024, h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  for (let i = 0; i < 50; i++) {
    const cx = Math.random() * w, cy = Math.random() * h;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20 + Math.random() * 60);
    grad.addColorStop(0, `rgba(255,255,255,${0.3 + Math.random() * 0.3})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 20 + Math.random() * 60, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
