import * as THREE from "three";
import { BufLoader } from "./BufLoader";
import { skyVertexShader, skyFragmentShader, cloudVertexShader, cloudFragmentShader } from "./shaders/skyShaders";
import { mountainVertexShader, mountainFragmentShader } from "./shaders/mountainShaders";
import { birdVertexShader, birdFragmentShader } from "./shaders/birdShaders";
import {
  titleOutlineVertexShader,
  titleOutlineFragmentShader,
  titleFillVertexShader,
  titleFillFragmentShader,
  titlePlaneVertexShader,
  titleFillPlaneFragmentShader,
  titleOutlinePlaneFragmentShader,
} from "./shaders/titleShaders";
import { fogVertexShader, fogFragmentShader } from "./shaders/fogShaders";
import { particlesVertexShader, particlesFragmentShader } from "./shaders/particlesShaders";

// scene 1 manager orchestrating mountains, bird flight, 3d title, and camera paths
export class Scene1 {
  public container = new THREE.Group();
  public titleGroup = new THREE.Group();
  public isLoaded = false;

  // shared uniforms for scene-wide color palette and fog
  private skyColor0 = new THREE.Color("#88bce8");
  private skyColor1 = new THREE.Color("#4a85d9");
  private dimSkyColor0 = new THREE.Color("#465b63");
  private dimSkyColor1 = new THREE.Color("#0c1c38");

  private sharedUniforms = {
    u_time: { value: 0 },
    u_skyColor0: { value: new THREE.Color("#88bce8") },
    u_skyColor1: { value: new THREE.Color("#4a85d9") },
    u_fogNear: { value: 1600 },
    u_fogFar: { value: 3000 },
    u_dimRatio: { value: 0 },
  };

  // title mesh references and animation uniforms
  private titleMesh: THREE.Mesh | null = null;
  private titleOutlineMesh: THREE.Mesh | null = null;
  private titleAspect = 3.2;
  private titleGlyphScale = 1.0;
  private titleUniforms = {
    u_time: { value: 0 },
    u_showRatio: { value: 0 },
    u_hideRatio: { value: 0 },
    u_thickness: { value: 1.0 },
    u_endRatio: { value: 1.0 },
    u_glowColor: { value: new THREE.Color("#ffdd88") },
    u_tintColor: { value: new THREE.Color("#f59e0b") },
  };

  // sky clouds group and animation references
  private cloudsGroup = new THREE.Group();
  private cloudMeshes: THREE.Mesh[] = [];
  private cloudBasePositions: THREE.Vector3[] = [];
  private cloudUniforms = {
    u_texture: { value: null as THREE.Texture | null },
    u_dimRatio: { value: 0 },
    u_opacity: { value: 0.8 },
    u_tintDay: { value: new THREE.Color("#ffffff") },
    u_tintNight: { value: new THREE.Color("#2c3e55") },
  };

  // bird mesh references and skeletal data textures
  private birdMesh: THREE.Mesh | null = null;
  private birdPathPositions: Float32Array | null = null;
  private birdPathOrients: Float32Array | null = null;
  private birdPathCount = 0;
  private birdUniforms = {
    u_positionTexture: { value: null as THREE.DataTexture | null },
    u_orientTexture: { value: null as THREE.DataTexture | null },
    u_boneCount: { value: 21 },
    u_animationFrameCount: { value: 158 },
    u_animationFrame: { value: 0 },
    u_texture: { value: null as THREE.Texture | null },
  };

  // camera animation keyframe arrays loaded from sc_01_camera.buf
  public cameraKeyframes = {
    positions: null as Float32Array | null,
    orientations: null as Float32Array | null,
    focal: null as Float32Array | null,
    mobileFocal: null as Float32Array | null,
    count: 0,
  };

  // temporary math vectors to avoid runtime gc allocation
  private tempV1 = new THREE.Vector3();
  private tempV2 = new THREE.Vector3();
  private tempQ1 = new THREE.Quaternion();
  private tempQ2 = new THREE.Quaternion();

  constructor(private loader: BufLoader, private textureLoader: THREE.TextureLoader) {}

  // asynchronously loads all scene 1 geometries, textures, and animation buffers
  public async load(): Promise<void> {
    try {
      // 1. load sky dome
      const skyGeo = new THREE.SphereGeometry(2200, 16, 16);
      const skyMat = new THREE.ShaderMaterial({
        vertexShader: skyVertexShader,
        fragmentShader: skyFragmentShader,
        uniforms: this.sharedUniforms,
        depthWrite: false,
        depthTest: false,
        side: THREE.BackSide,
      });
      const skyMesh = new THREE.Mesh(skyGeo, skyMat);
      skyMesh.renderOrder = -10;
      this.container.add(skyMesh);

      // 2. load background mountains & ridge textures
      const [bgTex, ridgeTex, mountainTex, cloudTex] = await Promise.all([
        this.loadTextureAsync("/assets/textures/scene1/SC_01_BACKGROUND_MOUNTAINS_TEXTURE.webp"),
        this.loadTextureAsync("/assets/textures/scene1/SC_01_RIDGE_TEXTURE.webp"),
        this.loadTextureAsync("/assets/textures/scene1/SC_01_MOUNTAIN_TEXTURE.webp"),
        this.loadTextureAsync("/assets/textures/cloud.png"),
      ]);

      // 3. load terrain models
      const [bgMountainsGeo, ridgeGeo, heroMountainGeo] = await Promise.all([
        this.loader.load("/assets/scene1/SC_01_BACKGROUND_MOUNTAINS.buf"),
        this.loader.load("/assets/scene1/SC_01_MOUNTAIN_RIDGE.buf"),
        this.loader.load("/assets/scene1/SC_01_MOUNTAIN.buf"),
      ]);

      // background mountains mesh
      const bgMountainsMat = new THREE.ShaderMaterial({
        vertexShader: mountainVertexShader,
        fragmentShader: mountainFragmentShader,
        uniforms: {
          ...this.sharedUniforms,
          u_texture: { value: bgTex },
        },
        defines: { HAS_ALPHA: 1, IS_SCENE_1: 1 },
      });
      const bgMountainsMesh = new THREE.Mesh(bgMountainsGeo, bgMountainsMat);
      this.container.add(bgMountainsMesh);

      // mountain ridge mesh
      const ridgeMat = new THREE.ShaderMaterial({
        vertexShader: mountainVertexShader,
        fragmentShader: mountainFragmentShader,
        uniforms: {
          ...this.sharedUniforms,
          u_texture: { value: ridgeTex },
        },
        defines: { IS_SCENE_1: 1 },
      });
      const ridgeMesh = new THREE.Mesh(ridgeGeo, ridgeMat);
      this.container.add(ridgeMesh);

      // hero mountain peak mesh
      const heroMountainMat = new THREE.ShaderMaterial({
        vertexShader: mountainVertexShader,
        fragmentShader: mountainFragmentShader,
        uniforms: {
          ...this.sharedUniforms,
          u_texture: { value: mountainTex },
        },
        defines: { IS_SCENE_1: 1 },
      });
      const heroMountainMesh = new THREE.Mesh(heroMountainGeo, heroMountainMat);
      this.container.add(heroMountainMesh);

      // 4. load hero fog mesh & flow textures
      try {
        const [fogGeo, fogTex, flowTex] = await Promise.all([
          this.loader.load("/assets/scene1/SC_01_HERO_FOG.buf"),
          this.loadTextureAsync("/assets/textures/scene1/fog.webp"),
          this.loadTextureAsync("/assets/textures/scene1/fog_flow.webp"),
        ]);
        fogTex.wrapS = fogTex.wrapT = THREE.RepeatWrapping;
        flowTex.wrapS = flowTex.wrapT = THREE.RepeatWrapping;

        const fogMat = new THREE.ShaderMaterial({
          vertexShader: fogVertexShader,
          fragmentShader: fogFragmentShader,
          uniforms: {
            u_fogTexture: { value: fogTex },
            u_flowTexture: { value: flowTex },
            u_time: this.sharedUniforms.u_time,
            u_opacity: { value: 0.45 },
            u_fogColor: { value: new THREE.Color("#c8dcfa") },
          },
          transparent: true,
          depthWrite: false,
          blending: THREE.NormalBlending,
        });
        const fogMesh = new THREE.Mesh(fogGeo, fogMat);
        fogMesh.renderOrder = 2;
        this.container.add(fogMesh);
      } catch (err) {
        console.warn("fog mesh load skipped:", err);
      }

      // 5. load bird models, skeletal animation textures, and flight spline
      await this.loadBirdAsync();

      // 6. load 3d title models
      await this.loadTitleAsync();

      // 7. create atmospheric sky clouds
      this.createClouds(cloudTex);

      // 8. create ambient floating particles
      this.createParticles();

      // 8. load camera animation path
      try {
        const cameraGeo = await this.loader.load("/assets/scene1/SC_01_CAMERA.buf");
        if (cameraGeo.attributes.position && cameraGeo.attributes.orient) {
          this.cameraKeyframes.positions = cameraGeo.attributes.position.array as Float32Array;
          this.cameraKeyframes.orientations = cameraGeo.attributes.orient.array as Float32Array;
          this.cameraKeyframes.count = cameraGeo.attributes.position.count;
          if (cameraGeo.attributes.focal) {
            this.cameraKeyframes.focal = cameraGeo.attributes.focal.array as Float32Array;
          }
          if (cameraGeo.attributes.mobileFocal) {
            this.cameraKeyframes.mobileFocal = cameraGeo.attributes.mobileFocal.array as Float32Array;
          }
        }
      } catch (err) {
        console.warn("camera trajectory load skipped:", err);
      }

      this.isLoaded = true;
    } catch (err) {
      console.error("failed to load scene 1 assets:", err);
    }
  }

  // loads and prepares the bird mesh and its skeletal data textures
  private async loadBirdAsync(): Promise<void> {
    try {
      const [birdGeo, birdAnimGeo, birdPathGeo, birdTex] = await Promise.all([
        this.loader.load("/assets/scene1/BIRD.buf"),
        this.loader.load("/assets/scene1/BIRD_ANIMATION.buf"),
        this.loader.load("/assets/scene1/BIRD_PATH.buf"),
        this.loadTextureAsync("/assets/textures/scene1/BIRD_TEXTURE_01.webp"),
      ]);

      // pack position and orientation keyframes into data textures
      const boneCount = 21;
      const frameCount = 158;
      const pixelCount = boneCount * frameCount;

      const posArray = birdAnimGeo.attributes.position.array as Float32Array;
      const posTexData = new Float32Array(pixelCount * 4);
      for (let i = 0, p = 0, d = 0; i < pixelCount; i++, p += 3, d += 4) {
        posTexData[d + 0] = posArray[p + 0];
        posTexData[d + 1] = posArray[p + 1];
        posTexData[d + 2] = posArray[p + 2];
        posTexData[d + 3] = 1.0;
      }
      const posDataTex = new THREE.DataTexture(posTexData, boneCount, frameCount, THREE.RGBAFormat, THREE.FloatType);
      posDataTex.needsUpdate = true;

      const orientArray = birdAnimGeo.attributes.orient.array as Float32Array;
      const orientDataTex = new THREE.DataTexture(orientArray, boneCount, frameCount, THREE.RGBAFormat, THREE.FloatType);
      orientDataTex.needsUpdate = true;

      this.birdUniforms.u_positionTexture.value = posDataTex;
      this.birdUniforms.u_orientTexture.value = orientDataTex;
      this.birdUniforms.u_texture.value = birdTex;

      if (birdPathGeo.attributes.position && birdPathGeo.attributes.orient) {
        this.birdPathPositions = birdPathGeo.attributes.position.array as Float32Array;
        this.birdPathOrients = birdPathGeo.attributes.orient.array as Float32Array;
        this.birdPathCount = birdPathGeo.attributes.position.count;
      }

      const birdMat = new THREE.ShaderMaterial({
        vertexShader: birdVertexShader,
        fragmentShader: birdFragmentShader,
        uniforms: this.birdUniforms,
        transparent: true,
        side: THREE.DoubleSide,
      });

      this.birdMesh = new THREE.Mesh(birdGeo, birdMat);
      this.birdMesh.frustumCulled = false;
      this.container.add(this.birdMesh);
    } catch (err) {
      console.warn("bird model loading skipped:", err);
    }
  }

  // loads 3d heading textures and constructs outline and fill meshes for the "ready?" title
  private async loadTitleAsync(): Promise<void> {
    try {
      // 1. await font load if supported by browser to ensure glyph accuracy
      if (typeof document !== "undefined" && document.fonts) {
        try {
          await document.fonts.load('280px "Feature Display"');
        } catch {
          // font load fallback handled gracefully
        }
      }

      // 2. generate crisp canvas textures for the "ready?" heading
      const { fillTexture, outlineTexture, aspect } = this.createTitleTextures("Ready?");
      this.titleAspect = aspect;

      // 3. construct title plane geometry matching the exact text aspect ratio
      const titleGeo = new THREE.PlaneGeometry(aspect, 1.0);

      // 4. solid face fill mesh with metallic champagne to amber gradient
      const titleFillMat = new THREE.ShaderMaterial({
        vertexShader: titlePlaneVertexShader,
        fragmentShader: titleFillPlaneFragmentShader,
        uniforms: {
          ...this.titleUniforms,
          u_texture: { value: fillTexture },
        },
        transparent: true,
        side: THREE.DoubleSide,
      });
      this.titleMesh = new THREE.Mesh(titleGeo, titleFillMat);
      this.titleMesh.frustumCulled = false;
      this.titleGroup.add(this.titleMesh);

      // 5. glowing neon outline stroke mesh with additive light blending
      const titleOutlineMat = new THREE.ShaderMaterial({
        vertexShader: titlePlaneVertexShader,
        fragmentShader: titleOutlinePlaneFragmentShader,
        uniforms: {
          ...this.titleUniforms,
          u_texture: { value: outlineTexture },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      this.titleOutlineMesh = new THREE.Mesh(titleGeo, titleOutlineMat);
      this.titleOutlineMesh.frustumCulled = false;
      this.titleOutlineMesh.renderOrder = 5;
      this.titleGroup.add(this.titleOutlineMesh);

      this.container.add(this.titleGroup);
    } catch (err) {
      console.warn("title geometry loading skipped:", err);
    }
  }

  // generates high-resolution canvas textures for the 3d title billboard
  private createTitleTextures(text: string): {
    fillTexture: THREE.CanvasTexture;
    outlineTexture: THREE.CanvasTexture;
    aspect: number;
  } {
    const fontSize = 280;
    const fontStr = `400 ${fontSize}px "Feature Display", Georgia, "Times New Roman", serif`;

    // measure text bounding dimensions on temporary scratch context
    const measureCanvas = document.createElement("canvas");
    const measureCtx = measureCanvas.getContext("2d")!;
    measureCtx.font = fontStr;
    const metrics = measureCtx.measureText(text);

    const textWidth = Math.ceil(metrics.width);
    const textHeight = Math.ceil(fontSize * 1.15);
    const paddingX = 80;
    const paddingY = 80;
    const canvasWidth = textWidth + paddingX * 2;
    const canvasHeight = textHeight + paddingY * 2;
    const aspect = canvasWidth / canvasHeight;

    // store inverse glyph ratio so camera scaling matches legacy font height
    this.titleGlyphScale = canvasHeight / textHeight;

    const x = paddingX;
    const y = paddingY + fontSize * 0.88;

    // 1. solid metallic gradient face texture
    const fillCanvas = document.createElement("canvas");
    fillCanvas.width = canvasWidth;
    fillCanvas.height = canvasHeight;
    const fillCtx = fillCanvas.getContext("2d")!;
    fillCtx.font = fontStr;

    // metallic vertical gradient from bright ivory shine to warm amber gold
    const grad = fillCtx.createLinearGradient(0, y - fontSize * 0.8, 0, y + fontSize * 0.15);
    grad.addColorStop(0.0, "#ffffff");
    grad.addColorStop(0.28, "#fff4e6");
    grad.addColorStop(0.65, "#fbbd5c");
    grad.addColorStop(1.0, "#d97706");
    fillCtx.fillStyle = grad;
    fillCtx.fillText(text, x, y);

    // fine champagne outline for crisp glyph separation
    fillCtx.strokeStyle = "rgba(255, 248, 235, 0.85)";
    fillCtx.lineWidth = 2.0;
    fillCtx.strokeText(text, x, y);

    // 2. luminous glowing outline texture
    const outlineCanvas = document.createElement("canvas");
    outlineCanvas.width = canvasWidth;
    outlineCanvas.height = canvasHeight;
    const outlineCtx = outlineCanvas.getContext("2d")!;
    outlineCtx.font = fontStr;

    // outer atmospheric luminous bloom
    outlineCtx.save();
    outlineCtx.shadowColor = "rgba(245, 158, 11, 0.95)";
    outlineCtx.shadowBlur = 36;
    outlineCtx.strokeStyle = "rgba(255, 221, 136, 0.85)";
    outlineCtx.lineWidth = 4.0;
    outlineCtx.strokeText(text, x, y);
    outlineCtx.restore();

    // inner neon edge stroke
    outlineCtx.strokeStyle = "rgba(255, 240, 210, 0.9)";
    outlineCtx.lineWidth = 2.2;
    outlineCtx.strokeText(text, x, y);

    // construct high-fidelity mipmapped three.js canvas textures
    const fillTexture = new THREE.CanvasTexture(fillCanvas);
    fillTexture.minFilter = THREE.LinearMipmapLinearFilter;
    fillTexture.magFilter = THREE.LinearFilter;
    fillTexture.generateMipmaps = true;

    const outlineTexture = new THREE.CanvasTexture(outlineCanvas);
    outlineTexture.minFilter = THREE.LinearMipmapLinearFilter;
    outlineTexture.magFilter = THREE.LinearFilter;
    outlineTexture.generateMipmaps = true;

    return { fillTexture, outlineTexture, aspect };
  }

  // creates floating atmospheric pollen / ember particles
  private createParticles(): void {
    const particleCount = 200;
    const geo = new THREE.PlaneGeometry(1, 1);
    const instGeo = new THREE.InstancedBufferGeometry();
    instGeo.index = geo.index;
    instGeo.attributes.position = geo.attributes.position;
    instGeo.attributes.uv = geo.attributes.uv;

    const posArray = new Float32Array(particleCount * 3);
    const randArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3 + 0] = (Math.random() - 0.5) * 2000;
      posArray[i * 3 + 1] = Math.random() * 800 + 50;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 1600;

      randArray[i * 3 + 0] = Math.random();
      randArray[i * 3 + 1] = Math.random();
      randArray[i * 3 + 2] = Math.random();
    }

    instGeo.setAttribute("a_instancePos", new THREE.InstancedBufferAttribute(posArray, 3));
    instGeo.setAttribute("a_instanceRands", new THREE.InstancedBufferAttribute(randArray, 3));

    const mat = new THREE.ShaderMaterial({
      vertexShader: particlesVertexShader,
      fragmentShader: particlesFragmentShader,
      uniforms: {
        u_time: this.sharedUniforms.u_time,
        u_scale: { value: 6.0 },
        u_color: { value: new THREE.Color("#fed7aa") },
        u_alpha: { value: 0.6 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Mesh(instGeo, mat);
    particlesMesh.frustumCulled = false;
    particlesMesh.renderOrder = 3;
    this.container.add(particlesMesh);
  }

  // generates sky cloud billboards with natural altitude distribution
  private createClouds(cloudTex: THREE.Texture): void {
    cloudTex.wrapS = THREE.ClampToEdgeWrapping;
    cloudTex.wrapT = THREE.ClampToEdgeWrapping;
    this.cloudUniforms.u_texture.value = cloudTex;

    const cloudAspect = 1024 / 556; // 1.8417 aspect ratio of cloud.png
    const cloudGeo = new THREE.PlaneGeometry(cloudAspect, 1.0);

    const cloudConfigs = [
      { x: -680, y: 460, z: -1100, scale: 440, opacity: 0.78 },
      { x: 740, y: 520, z: -1300, scale: 500, opacity: 0.72 },
      { x: -50, y: 600, z: -1500, scale: 390, opacity: 0.62 },
      { x: -1150, y: 350, z: -900, scale: 350, opacity: 0.65 },
      { x: 1100, y: 390, z: -1050, scale: 400, opacity: 0.70 },
      { x: -380, y: 410, z: -850, scale: 300, opacity: 0.58 },
    ];

    for (const cfg of cloudConfigs) {
      const mat = new THREE.ShaderMaterial({
        vertexShader: cloudVertexShader,
        fragmentShader: cloudFragmentShader,
        uniforms: {
          ...this.cloudUniforms,
          u_opacity: { value: cfg.opacity },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(cloudGeo, mat);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.scale.set(cfg.scale, cfg.scale, 1.0);
      mesh.renderOrder = -2;

      this.cloudMeshes.push(mesh);
      this.cloudBasePositions.push(mesh.position.clone());
      this.cloudsGroup.add(mesh);
    }

    this.container.add(this.cloudsGroup);
  }

  // helper to promisify texture loading
  private loadTextureAsync(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          resolve(tex);
        },
        undefined,
        (err) => reject(err),
      );
    });
  }

  // updates scene animations, bird flight, shaders, and responsive title positioning
  public update(time: number, deltaTime: number, scrollProgress: number, camera: THREE.PerspectiveCamera): void {
    if (!this.isLoaded) return;

    this.sharedUniforms.u_time.value = time;
    this.titleUniforms.u_time.value = time;

    // 1. time-of-day sky and fog dimming based on scroll
    const dimRatio = THREE.MathUtils.clamp((scrollProgress - 0.15) * 2.5, 0, 1);
    this.sharedUniforms.u_dimRatio.value = dimRatio;
    this.sharedUniforms.u_skyColor0.value.copy(this.skyColor0).lerp(this.dimSkyColor0, dimRatio);
    this.sharedUniforms.u_skyColor1.value.copy(this.skyColor1).lerp(this.dimSkyColor1, dimRatio);

    // 2. update 3d title animations and responsive camera space scaling
    this.updateTitle(time, scrollProgress, camera);

    // 3. update bird skeletal flapping and flight curve interpolation
    this.updateBird(time, scrollProgress);

    // 4. update sky clouds time-of-day dimming and ambient drift
    this.cloudUniforms.u_dimRatio.value = dimRatio;
    for (let i = 0; i < this.cloudMeshes.length; i++) {
      const mesh = this.cloudMeshes[i];
      const basePos = this.cloudBasePositions[i];
      mesh.position.x = basePos.x + Math.sin(time * 0.05 + i * 1.5) * 20;
    }
  }

  // calculates responsive title scale and reveal progress
  private updateTitle(time: number, scrollProgress: number, camera: THREE.PerspectiveCamera): void {
    if (!this.titleMesh || !this.titleOutlineMesh) return;

    // progressive reveal based on initial time and early scroll
    const showRatio = THREE.MathUtils.clamp((time - 0.4) * 0.9, 0, 1);
    const hideRatio = THREE.MathUtils.clamp((scrollProgress - 0.08) * 6.0, 0, 1);
    this.titleUniforms.u_showRatio.value = showRatio;
    this.titleUniforms.u_hideRatio.value = hideRatio;

    // responsive scale calculation based on camera fov and distance
    // this completely replaces the broken dom getboundingclientrect calculation
    const targetDistance = 750;
    const fovRad = (camera.fov * Math.PI) / 180;
    const viewportHeightAtDist = 2 * Math.tan(fovRad / 2) * targetDistance;
    const viewportWidthAtDist = viewportHeightAtDist * camera.aspect;

    // calculate responsive scale matching the exact optical height of legacy everswap glyphs
    const isMobile = camera.aspect < 1.0;
    const fillFraction = isMobile ? 0.88 : 0.68;
    const legacyHeightRatio = 0.243347 / 4.109; // exact height to aspect ratio of legacy everswap model
    const targetScale = viewportWidthAtDist * fillFraction * legacyHeightRatio * this.titleGlyphScale;

    // position title centered in front of the camera with subtle vertical offset
    this.titleGroup.position.copy(camera.position);
    this.titleGroup.quaternion.copy(camera.quaternion);
    this.titleGroup.translateZ(-targetDistance);
    this.titleGroup.translateY(isMobile ? 80 : 40);
    this.titleGroup.scale.setScalar(targetScale);

    // fade title visibility when scrolled past threshold
    this.titleGroup.visible = hideRatio < 0.99 && showRatio > 0.01;
  }

  // updates bird flight along its curve trajectory and wing flap cycles
  private updateBird(time: number, scrollProgress: number): void {
    if (!this.birdMesh || !this.birdPathPositions || !this.birdPathOrients || this.birdPathCount === 0) return;

    // wing flapping frequency driven by time and scroll movement
    const flapSpeed = 38.0;
    this.birdUniforms.u_animationFrame.value = time * flapSpeed;

    // flight progress along spline keyframes driven by scroll
    const flightProgress = THREE.MathUtils.clamp((scrollProgress - 0.02) * 1.8, 0, 1);
    const keyframeIndex = flightProgress * (this.birdPathCount - 1);
    const k0 = Math.floor(keyframeIndex);
    const k1 = Math.min(k0 + 1, this.birdPathCount - 1);
    const alpha = keyframeIndex - k0;

    this.tempV1.fromArray(this.birdPathPositions, k0 * 3);
    this.tempV2.fromArray(this.birdPathPositions, k1 * 3);
    this.tempV1.lerp(this.tempV2, alpha);
    this.birdMesh.position.copy(this.tempV1);

    this.tempQ1.fromArray(this.birdPathOrients, k0 * 4);
    this.tempQ2.fromArray(this.birdPathOrients, k1 * 4);
    this.tempQ1.slerp(this.tempQ2, alpha);
    this.birdMesh.quaternion.copy(this.tempQ1);

    // add subtle natural gliding roll banking
    const bankAngle = Math.sin(time * 1.5) * 0.08;
    this.birdMesh.rotateZ(bankAngle);
  }
}
