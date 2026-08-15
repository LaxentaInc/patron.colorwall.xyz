import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// imperative handle so parent can drive explosion progress without
// triggering react re-renders on every scroll frame
export interface TextplosionHandle {
  setProgress: (p: number) => void;
}

export interface UpInSmokeProps {
  text?: string;
  fontUrl?: string;
  size?: number;
  color?: number | string;
  backgroundColor?: number | string;
  className?: string;
  style?: React.CSSProperties;
  align?: 'left' | 'center' | 'right';
}

const EASE_OUT_CUBIC = /* glsl */ `
float easeOutCubic(float t, float b, float c, float d) {
  t /= d;
  t--;
  return c * (t * t * t + 1.0) + b;
}
`;

const CUBIC_BEZIER = /* glsl */ `
vec3 cubicBezier(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
  float tn = 1.0 - t;
  return tn * tn * tn * p0 +
         3.0 * tn * tn * t * p1 +
         3.0 * tn * t * t * p2 +
         t * t * t * p3;
}
`;

function randFloat(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function randFloatSpread(range: number) {
  return range * (0.5 - Math.random());
}

const Textplosion = forwardRef<TextplosionHandle, UpInSmokeProps>(function Textplosion({
  text = 'UP IN SMOKE',
  fontUrl = '/fonts/Outfit-Bold.json',
  size = 14,
  color = 0xffffff,
  backgroundColor = 0x000000,
  className,
  style,
  align = 'center',
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  // stores the current explosion progress (0 = exploded, 1 = assembled).
  // updated imperatively by parent via setProgress to avoid re-renders.
  const progressRef = useRef(0);
  // stores the computed animation duration from the text geometry builder.
  // needed to scale the 0-1 progress into the shader's uTime range.
  const animDurRef = useRef(7);
  // ref to the three.js uTime uniform so the tick loop can write to it
  const uTimeRef = useRef({ value: 0 });
  const textWidthRef = useRef(0);

  useImperativeHandle(ref, () => ({
    setProgress: (p: number) => {
      progressRef.current = p;
    },
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let raf = 0;

    const uTime = uTimeRef.current;

    // --- renderer / scene / camera ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    // Use clear color with 0 alpha to make it transparent over our backgrounds
    renderer.setClearColor(backgroundColor as THREE.ColorRepresentation, 0);
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      1,
      10000
    );
    camera.position.set(0, 0, 400);

    const scene = new THREE.Scene();

    let mesh: THREE.Mesh | null = null;

    function resize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);

      if (mesh && textWidthRef.current > 0) {
        const vFov = (camera.fov * Math.PI) / 180;
        const vHeight = 2 * Math.tan(vFov / 2) * camera.position.z;
        const vWidth = vHeight * camera.aspect;

        const w = textWidthRef.current;
        let scale = 1;
        
        // Prevent clipping: if text is wider than 90% of the canvas, scale it down
        if (w > vWidth * 0.9) {
          scale = (vWidth * 0.9) / w;
        }
        mesh.scale.setScalar(scale);

        // Position based on alignment
        const scaledWidth = w * scale;
        if (align === 'left') {
          mesh.position.x = -vWidth / 2 + scaledWidth / 2;
        } else if (align === 'right') {
          mesh.position.x = vWidth / 2 - scaledWidth / 2;
        } else {
          mesh.position.x = 0;
        }
      }
    }
    resize();
    window.addEventListener('resize', resize);

    function tick() {
      // progress 0 = assembled (uTime at 0), progress 1 = fully exploded (uTime at max).
      uTime.value = animDurRef.current * progressRef.current;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    tick();

    // --- build the shattered text mesh ---
    const loader = new FontLoader();
    loader.load(
      fontUrl,
      (font: Font) => {
        if (disposed) return;

        const textGeo = new TextGeometry(text, {
          font,
          size,
          depth: 0,
          bevelEnabled: true,
          bevelThickness: 0.5,
          bevelSize: 0.75,
        });

        textGeo.computeBoundingBox();
        const bbox = textGeo.boundingBox!;
        const w = bbox.max.x - bbox.min.x;
        const h = bbox.max.y - bbox.min.y;
        const d = bbox.max.z - bbox.min.z;
        
        textWidthRef.current = w;

        // always center the geometry locally so the explosion math radiates outwards cleanly.
        // the alignment positioning is handled dynamically in resize() using mesh.position.x
        textGeo.translate(-w * 0.5, -h * 0.5, -d * 0.5);

        const posAttr = textGeo.getAttribute('position') as THREE.BufferAttribute;
        const faceCount = posAttr.count / 3;

        const maxDelayX = 2.0;
        const maxDelayY = 0.25;
        const minDuration = 2;
        const maxDuration = 8;
        const stretch = 0.25;

        const aAnimation = new Float32Array(faceCount * 3 * 2);
        const aCentroid = new Float32Array(faceCount * 3 * 3);
        const aControl0 = new Float32Array(faceCount * 3 * 3);
        const aControl1 = new Float32Array(faceCount * 3 * 3);
        const aEndPosition = new Float32Array(faceCount * 3 * 3);

        const v0 = new THREE.Vector3();
        const v1 = new THREE.Vector3();
        const v2 = new THREE.Vector3();
        const centroid = new THREE.Vector3();

        for (let f = 0; f < faceCount; f++) {
          const base = f * 3;
          v0.fromBufferAttribute(posAttr, base);
          v1.fromBufferAttribute(posAttr, base + 1);
          v2.fromBufferAttribute(posAttr, base + 2);
          centroid.copy(v0).add(v1).add(v2).divideScalar(3);

          const delayX = Math.max(0, (centroid.x / w) * maxDelayX);
          const delayY = Math.max(0, (1.0 - centroid.y / h) * maxDelayY);
          const dly = delayX + delayY + Math.random() * stretch;
          const dur = randFloat(minDuration, maxDuration);

          const c0x = centroid.x + randFloat(40, 120);
          const c0y = centroid.y + h * randFloat(0.0, 12.0);
          const c0z = randFloatSpread(120);

          const c1x = centroid.x + randFloat(80, 120) * -1;
          const c1y = centroid.y + h * randFloat(0.0, 12.0);
          const c1z = randFloatSpread(120);

          const endX = centroid.x + randFloatSpread(120);
          const endY = centroid.y + h * randFloat(0.0, 12.0);
          const endZ = randFloat(-20, 20);

          for (let v = 0; v < 3; v++) {
            const i2 = (base + v) * 2;
            const i3 = (base + v) * 3;

            aAnimation[i2] = dly;
            aAnimation[i2 + 1] = dur;

            aCentroid[i3] = centroid.x;
            aCentroid[i3 + 1] = centroid.y;
            aCentroid[i3 + 2] = centroid.z;

            aControl0[i3] = c0x;
            aControl0[i3 + 1] = c0y;
            aControl0[i3 + 2] = c0z;

            aControl1[i3] = c1x;
            aControl1[i3 + 1] = c1y;
            aControl1[i3 + 2] = c1z;

            aEndPosition[i3] = endX;
            aEndPosition[i3 + 1] = endY;
            aEndPosition[i3 + 2] = endZ;
          }
        }

        textGeo.setAttribute('aAnimation', new THREE.BufferAttribute(aAnimation, 2));
        textGeo.setAttribute('aCentroid', new THREE.BufferAttribute(aCentroid, 3));
        textGeo.setAttribute('aControl0', new THREE.BufferAttribute(aControl0, 3));
        textGeo.setAttribute('aControl1', new THREE.BufferAttribute(aControl1, 3));
        textGeo.setAttribute('aEndPosition', new THREE.BufferAttribute(aEndPosition, 3));

        const material = new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
          transparent: true,
        });

        material.onBeforeCompile = (shader) => {
          shader.uniforms.uTime = uTime;

          shader.vertexShader = shader.vertexShader
            .replace(
              '#include <common>',
              `#include <common>
              uniform float uTime;
              attribute vec2 aAnimation;
              attribute vec3 aCentroid;
              attribute vec3 aControl0;
              attribute vec3 aControl1;
              attribute vec3 aEndPosition;
              ${EASE_OUT_CUBIC}
              ${CUBIC_BEZIER}`
            )
            .replace(
              '#include <begin_vertex>',
              `
              float tDelay = aAnimation.x;
              float tDuration = aAnimation.y;
              float tTime = clamp(uTime - tDelay, 0.0, tDuration);
              float tProgress = easeOutCubic(tTime, 0.0, 1.0, tDuration);

              vec3 transformed = vec3(position);
              vec3 tPosition = transformed - aCentroid;
              tPosition *= 1.0 - tProgress;
              tPosition += aCentroid;
              tPosition = cubicBezier(tPosition, aControl0, aControl1, aEndPosition, tProgress);
              transformed = tPosition;
              `
            );

          material.userData.shader = shader;
        };

        mesh = new THREE.Mesh(textGeo, material);
        // vertical center is usually good, but we can bump it down a bit to match the original feel
        mesh.position.y = -20;
        mesh.frustumCulled = false;
        scene.add(mesh);
        
        // call resize once to snap the mesh to the correct aligned position and scale immediately
        resize();

        // store the computed animation duration so the tick loop can scale progress
        animDurRef.current = maxDelayX + maxDelayY + maxDuration - 3;
      },
      undefined,
      (err) => console.error('Failed to load font for Textplosion:', err)
    );

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      if (mesh) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [text, fontUrl, size, color, backgroundColor]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', overflow: 'visible', ...style }}
    />
  );
});

export default Textplosion;
