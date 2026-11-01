import * as THREE from "three";
import { BufLoader } from "./BufLoader";
import { Scene1 } from "./Scene1";
import { Scene2 } from "./Scene2";
import { LineTrails } from "./LineTrails";
import { Scene3 } from "./Scene3";

// primary 3d world engine coordinator handling multi-scene continuum and transitions
export class WorldEngine {
  public renderer: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;
  public scene: THREE.Scene;

  private loader: BufLoader;
  private textureLoader: THREE.TextureLoader;
  public scene1: Scene1;
  public scene2: Scene2;
  public lineTrails: LineTrails;
  public scene3: Scene3;

  private isRunning = false;
  private rafId: number | null = null;
  private clock = new THREE.Clock();

  // scroll progress interpolation state
  public targetScroll = 0;
  public currentScroll = 0;
  public scrollDamp = 0.08;

  // mouse parallax look-at state
  private targetMouseX = 0;
  private targetMouseY = 0;
  private currentMouseX = 0;
  private currentMouseY = 0;
  private mouseDamp = 0.05;

  // temporary math structures for camera animation and transitions
  private camPos0 = new THREE.Vector3();
  private camPos1 = new THREE.Vector3();
  private camQuat0 = new THREE.Quaternion();
  private camQuat1 = new THREE.Quaternion();
  private mouseQuat = new THREE.Quaternion();
  private mouseEuler = new THREE.Euler(0, 0, 0, "YXZ");

  constructor(public canvas: HTMLCanvasElement) {
    // initialize webgl renderer with srgb color pipeline
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    // initialize perspective camera
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 10, 5000);
    this.camera.position.set(0, 150, 800);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#0c1c30");

    // instantiate loaders and sub-scene coordinators
    this.loader = new BufLoader();
    this.textureLoader = new THREE.TextureLoader();

    this.scene1 = new Scene1(this.loader, this.textureLoader);
    this.scene2 = new Scene2(this.loader, this.textureLoader);
    this.lineTrails = new LineTrails(this.loader, this.textureLoader);
    this.scene3 = new Scene3(this.loader, this.textureLoader);

    this.scene.add(this.scene1.container);
    this.scene.add(this.scene2.container);
    this.scene.add(this.lineTrails.container);
    this.scene.add(this.scene3.container);

    // hide subsequent scenes initially until active
    this.scene2.container.visible = false;
    this.lineTrails.container.visible = false;
    this.scene3.container.visible = false;
  }

  // boots all scene assets concurrently and starts the render loop
  public async init(): Promise<void> {
    await Promise.all([
      this.scene1.load(),
      this.scene2.load(),
      this.lineTrails.load(),
      this.scene3.load(),
    ]);

    // detach falcon from scene 1 container to global scene root to persist through all scenes
    if (this.scene1.birdMesh && this.scene1.birdMesh.parent) {
      this.scene1.birdMesh.parent.remove(this.scene1.birdMesh);
      this.scene.add(this.scene1.birdMesh);
    }

    this.onResize();
    this.start();
  }

  // starts the requestanimationframe loop
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();

    const loop = () => {
      if (!this.isRunning) return;
      this.update();
      this.render();
      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  // stops the render loop when canvas is off-screen
  public stop(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // updates scroll, camera trajectory, ribbon physics, and scene managers
  private update(): void {
    const deltaTime = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // smooth scroll damping
    this.currentScroll += (this.targetScroll - this.currentScroll) * this.scrollDamp;

    // smooth mouse parallax damping
    this.currentMouseX += (this.targetMouseX - this.currentMouseX) * this.mouseDamp;
    this.currentMouseY += (this.targetMouseY - this.currentMouseY) * this.mouseDamp;

    const scroll = this.currentScroll;
    const isMobile = this.camera.aspect < 1.0;

    // phase 1: mountain pass and falcon ascent (0.00 to 0.35)
    if (scroll < 0.35) {
      const p1 = Math.max(0, Math.min(1, scroll / 0.35));
      this.scene1.container.visible = true;
      this.scene2.container.visible = false;
      this.lineTrails.container.visible = false;
      this.scene3.container.visible = false;

      this.updateScene1Camera(p1, isMobile);
      this.scene1.update(elapsedTime, deltaTime, p1, this.camera);
    }
    // phase 2: upper-sky floating island archipelago, neon flora, and ribbon trails (0.35 to 0.70)
    else if (scroll >= 0.35 && scroll < 0.70) {
      const p2 = (scroll - 0.35) / 0.35;

      this.scene1.container.visible = p2 < 0.15;
      this.scene2.container.visible = true;
      this.lineTrails.container.visible = true;
      this.scene3.container.visible = p2 > 0.85;

      // animate volumetric energetic ribbons around islands
      const ribbonOpacity = Math.sin(p2 * Math.PI) * 1.3;
      this.lineTrails.update(elapsedTime, Math.min(1.0, ribbonOpacity));

      // drive wing flapping skeletal animation
      if (this.scene1.birdUniforms) {
        this.scene1.birdUniforms.u_animationFrame.value = elapsedTime * 38.0;
      }

      // update floating islands and evaluate 7-point spline for camera and falcon
      this.scene2.update(elapsedTime, p2, this.camera, this.scene1.birdMesh);

      // keep scene 3 pre-warmed for seamless landing
      if (p2 > 0.8) {
        this.scene3.update(elapsedTime, 0.0, this.camera, isMobile);
      }
    }
    // phase 3: lake sanctuary and water simulation (0.70 to 1.00)
    else {
      const p3 = Math.max(0, Math.min(1, (scroll - 0.70) / 0.30));

      this.scene1.container.visible = false;
      this.scene2.container.visible = false;
      this.lineTrails.container.visible = false;
      this.scene3.container.visible = true;

      // hide falcon when resting at the lake sanctuary
      if (this.scene1.birdMesh) {
        this.scene1.birdMesh.visible = p3 < 0.3;
      }

      this.scene3.update(elapsedTime, p3, this.camera, isMobile);
    }

    // apply subtle mouse parallax tilt on top of active camera orientation
    const maxLookAngle = 0.05;
    this.mouseEuler.set(this.currentMouseY * maxLookAngle, -this.currentMouseX * maxLookAngle, 0);
    this.mouseQuat.setFromEuler(this.mouseEuler);
    this.camera.quaternion.multiply(this.mouseQuat);
  }

  // updates camera position from sc_01_camera trajectory
  private updateScene1Camera(progress: number, isMobile: boolean): void {
    const keyframes = this.scene1.cameraKeyframes;
    if (keyframes.positions && keyframes.orientations && keyframes.count > 0) {
      const keyframeFloat = progress * (keyframes.count - 1);
      const k0 = Math.floor(keyframeFloat);
      const k1 = Math.min(k0 + 1, keyframes.count - 1);
      const alpha = keyframeFloat - k0;

      this.camPos0.fromArray(keyframes.positions, k0 * 3);
      this.camPos1.fromArray(keyframes.positions, k1 * 3);
      this.camera.position.lerpVectors(this.camPos0, this.camPos1, alpha);

      this.camQuat0.fromArray(keyframes.orientations, k0 * 4);
      this.camQuat1.fromArray(keyframes.orientations, k1 * 4);
      this.camera.quaternion.slerpQuaternions(this.camQuat0, this.camQuat1, alpha);

      const focalArray = isMobile && keyframes.mobileFocal ? keyframes.mobileFocal : keyframes.focal;
      if (focalArray) {
        const f0 = focalArray[k0];
        const f1 = focalArray[k1];
        const focal = THREE.MathUtils.lerp(f0, f1, alpha);
        const aperture = 41.42;
        const apy = (window.innerHeight * aperture) / window.innerWidth;
        const computedFov = 2 * Math.atan(apy / 2 / focal) * (180 / Math.PI);
        if (Number.isFinite(computedFov) && computedFov > 15 && computedFov < 120) {
          this.camera.fov = computedFov;
          this.camera.updateProjectionMatrix();
        }
      }
    }
  }

  // smoothly warps camera through floating islands directly into lake sanctuary
  public warpToLake(): void {
    if (typeof window === "undefined") return;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScrollY = docHeight * 0.88;
    window.scrollTo({
      top: targetScrollY,
      behavior: "smooth",
    });
  }

  // renders active 3d scene
  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  // updates target scroll progress normalized between 0.0 and 1.0
  public setScrollProgress(progress: number): void {
    this.targetScroll = THREE.MathUtils.clamp(progress, 0, 1);
  }

  // updates normalized mouse coordinates (-1.0 to 1.0)
  public setMousePosition(normalizedX: number, normalizedY: number): void {
    this.targetMouseX = THREE.MathUtils.clamp(normalizedX, -1, 1);
    this.targetMouseY = THREE.MathUtils.clamp(normalizedY, -1, 1);
  }

  // handles window resize and updates renderer and camera projection
  public onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
  }

  // completely disposes renderer, scene geometries, materials, and textures
  public destroy(): void {
    this.stop();

    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else if (mesh.material) {
          mesh.material.dispose();
        }
      }
    });

    this.renderer.dispose();
  }
}
