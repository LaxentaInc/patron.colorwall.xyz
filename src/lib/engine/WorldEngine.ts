import * as THREE from "three";
import { BufLoader } from "./BufLoader";
import { Scene1 } from "./Scene1";

// primary 3d world engine coordinator handling rendering, camera motion, and scene transitions
export class WorldEngine {
  public renderer: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;
  public scene: THREE.Scene;

  private loader: BufLoader;
  private textureLoader: THREE.TextureLoader;
  public scene1: Scene1;

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

  // temporary math structures for camera animation calculation
  private camPos0 = new THREE.Vector3();
  private camPos1 = new THREE.Vector3();
  private camQuat0 = new THREE.Quaternion();
  private camQuat1 = new THREE.Quaternion();
  private mouseQuat = new THREE.Quaternion();
  private mouseEuler = new THREE.Euler(0, 0, 0, "YXZ");

  constructor(public canvas: HTMLCanvasElement) {
    // initialize WebGL renderer with high color fidelity
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

    // initialize camera
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 10, 4000);
    this.camera.position.set(0, 150, 800);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#050c18");

    // instantiate loaders and scenes
    this.loader = new BufLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.scene1 = new Scene1(this.loader, this.textureLoader);
    this.scene.add(this.scene1.container);
  }

  // boots the engine and loads all 3d scenes asynchronously
  public async init(): Promise<void> {
    await this.scene1.load();
    this.onResize();
    this.start();
  }

  // starts the requestAnimationFrame animation loop
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

  // stops the animation loop
  public stop(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // updates scroll, camera trajectory, mouse parallax, and scene elements
  private update(): void {
    const deltaTime = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. smooth scroll progress interpolation (lerp)
    this.currentScroll += (this.targetScroll - this.currentScroll) * this.scrollDamp;

    // 2. smooth mouse parallax look-at damping
    this.currentMouseX += (this.targetMouseX - this.currentMouseX) * this.mouseDamp;
    this.currentMouseY += (this.targetMouseY - this.currentMouseY) * this.mouseDamp;

    // 3. update camera position and orientation from keyframes or parametric fallback
    this.updateCamera(this.currentScroll);

    // 4. update scene 1 elements (bird, sky, mountains, fog, title)
    this.scene1.update(elapsedTime, deltaTime, this.currentScroll, this.camera);
  }

  // updates camera position from sc_01_camera trajectory or smooth fallback
  private updateCamera(scrollProgress: number): void {
    const keyframes = this.scene1.cameraKeyframes;
    const isMobile = this.camera.aspect < 1.0;

    if (keyframes.positions && keyframes.orientations && keyframes.count > 0) {
      // sample camera path keyframes along scroll progress
      const keyframeFloat = THREE.MathUtils.clamp(scrollProgress, 0, 1) * (keyframes.count - 1);
      const k0 = Math.floor(keyframeFloat);
      const k1 = Math.min(k0 + 1, keyframes.count - 1);
      const alpha = keyframeFloat - k0;

      this.camPos0.fromArray(keyframes.positions, k0 * 3);
      this.camPos1.fromArray(keyframes.positions, k1 * 3);
      this.camera.position.lerpVectors(this.camPos0, this.camPos1, alpha);

      this.camQuat0.fromArray(keyframes.orientations, k0 * 4);
      this.camQuat1.fromArray(keyframes.orientations, k1 * 4);
      this.camera.quaternion.slerpQuaternions(this.camQuat0, this.camQuat1, alpha);

      // apply focal length if available
      const focalArray = isMobile && keyframes.mobileFocal ? keyframes.mobileFocal : keyframes.focal;
      if (focalArray) {
        const f0 = focalArray[k0];
        const f1 = focalArray[k1];
        const focal = THREE.MathUtils.lerp(f0, f1, alpha);
        // focal to vertical fov conversion
        const aperture = 41.42;
        const apy = (window.innerHeight * aperture) / window.innerWidth;
        const computedFov = 2 * Math.atan(apy / 2 / focal) * (180 / Math.PI);
        if (Number.isFinite(computedFov) && computedFov > 15 && computedFov < 120) {
          this.camera.fov = computedFov;
          this.camera.updateProjectionMatrix();
        }
      }
    } else {
      // parametric cinematic fallback camera dolly
      const targetZ = THREE.MathUtils.lerp(900, -200, scrollProgress);
      const targetY = THREE.MathUtils.lerp(180, 40, scrollProgress);
      const targetX = Math.sin(scrollProgress * Math.PI) * 120;
      this.camera.position.set(targetX, targetY, targetZ);
      this.camera.lookAt(0, 100, -500);
    }

    // apply subtle mouse parallax tilt on top of the camera orientation
    const maxLookAngle = 0.08;
    this.mouseEuler.set(this.currentMouseY * maxLookAngle, -this.currentMouseX * maxLookAngle, 0);
    this.mouseQuat.setFromEuler(this.mouseEuler);
    this.camera.quaternion.multiply(this.mouseQuat);
  }

  // renders the 3d scene with the active camera
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
