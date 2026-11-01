import * as THREE from "three";
import { BufLoader } from "./BufLoader";
import { waterVertexShader, waterFragmentShader } from "./shaders/waterShaders";
import { skyVertexShader, skyFragmentShader } from "./shaders/skyShaders";

// manager for scene 3 lake sanctuary and water simulation
export class Scene3 {
  public container = new THREE.Group();
  public isLoaded = false;

  // shared uniforms for scene 3 water and landscape
  private skyColor0 = new THREE.Color("#18304c");
  private skyColor1 = new THREE.Color("#081220");

  private sharedUniforms = {
    u_time: { value: 0 },
    u_skyColor0: { value: new THREE.Color("#18304c") },
    u_skyColor1: { value: new THREE.Color("#081220") },
    u_fogNear: { value: 300 },
    u_fogFar: { value: 2800 },
  };

  // mesh references and materials
  private landMesh: THREE.Mesh | null = null;
  private waterMesh: THREE.Mesh | null = null;
  private skyDome: THREE.Mesh | null = null;
  private lakeTexture: THREE.Texture | null = null;
  private waterNormalTexture: THREE.Texture | null = null;

  // camera trajectory keyframes loaded from sc_03_camera.buf
  public cameraKeyframes = {
    positions: null as Float32Array | null,
    orientations: null as Float32Array | null,
    focal: null as Float32Array | null,
    mobileFocal: null as Float32Array | null,
    count: 0,
  };

  // temporary math vectors and quaternions to avoid per-frame allocations
  private tempV1 = new THREE.Vector3();
  private tempV2 = new THREE.Vector3();
  private tempQ1 = new THREE.Quaternion();
  private tempQ2 = new THREE.Quaternion();

  constructor(private loader: BufLoader, private textureLoader: THREE.TextureLoader) {}

  // loads all scene 3 geometries, textures, and camera path
  public async load(): Promise<void> {
    try {
      // 1. load sky dome with expansive radius and luminous twilight gradient
      const skyGeo = new THREE.SphereGeometry(3500, 24, 24);
      const skyMat = new THREE.ShaderMaterial({
        vertexShader: skyVertexShader,
        fragmentShader: skyFragmentShader,
        uniforms: {
          u_skyColor0: { value: new THREE.Color("#244e78") },
          u_skyColor1: { value: new THREE.Color("#0c1c30") },
          u_dimRatio: { value: 0 },
        },
        side: THREE.BackSide,
        depthWrite: false,
      });
      this.skyDome = new THREE.Mesh(skyGeo, skyMat);
      this.skyDome.renderOrder = -1;
      this.skyDome.frustumCulled = false;
      this.container.add(this.skyDome);

      // 2. load textures for lake terrain and water ripples
      const [lakeTex, waterNormalTex] = await Promise.all([
        this.loadTextureAsync("/assets/textures/scene3/SC_03_LAKE_TEXTURE.webp"),
        this.loadTextureAsync("/assets/textures/waterNormal.jpg"),
      ]);
      lakeTex.generateMipmaps = true;
      waterNormalTex.wrapS = waterNormalTex.wrapT = THREE.RepeatWrapping;
      this.lakeTexture = lakeTex;
      this.waterNormalTexture = waterNormalTex;

      // 3. load shoreline land geometry
      try {
        const landGeo = await this.loader.load("/assets/scene3/SC_03_LAND.buf");
        const landMat = new THREE.ShaderMaterial({
          vertexShader: waterVertexShader,
          fragmentShader: waterFragmentShader,
          uniforms: {
            u_texture: { value: this.lakeTexture },
            u_waterNormal: { value: this.waterNormalTexture },
            u_time: this.sharedUniforms.u_time,
            u_skyColor0: this.sharedUniforms.u_skyColor0,
            u_skyColor1: this.sharedUniforms.u_skyColor1,
            u_fogNear: this.sharedUniforms.u_fogNear,
            u_fogFar: this.sharedUniforms.u_fogFar,
          },
          side: THREE.FrontSide,
        });
        this.landMesh = new THREE.Mesh(landGeo, landMat);
        this.landMesh.renderOrder = 3;
        // scale and position land mesh forward so foreground terrain fills past the bottom screen edge
        this.landMesh.scale.set(1.22, 1.22, 1.22);
        this.landMesh.position.set(-30, -5, 60);
        this.container.add(this.landMesh);
      } catch (landErr) {
        console.warn("sc_03_land load skipped:", landErr);
      }

      // 4. load water lake geometry
      try {
        const waterGeo = await this.loader.load("/assets/scene3/SC_03_WATER.buf");
        const waterMat = new THREE.ShaderMaterial({
          vertexShader: waterVertexShader,
          fragmentShader: waterFragmentShader,
          defines: {
            IS_WATER: "1",
          },
          uniforms: {
            u_texture: { value: this.lakeTexture },
            u_waterNormal: { value: this.waterNormalTexture },
            u_time: this.sharedUniforms.u_time,
            u_skyColor0: this.sharedUniforms.u_skyColor0,
            u_skyColor1: this.sharedUniforms.u_skyColor1,
            u_fogNear: this.sharedUniforms.u_fogNear,
            u_fogFar: this.sharedUniforms.u_fogFar,
          },
          transparent: true,
          side: THREE.DoubleSide,
        });
        this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
        this.waterMesh.renderOrder = 1;
        // scale and position water mesh in unison with shoreline land
        this.waterMesh.scale.set(1.22, 1.22, 1.22);
        this.waterMesh.position.set(-30, -5, 60);
        this.container.add(this.waterMesh);
      } catch (waterErr) {
        console.warn("sc_03_water load skipped:", waterErr);
      }

      // 5. load camera trajectory
      try {
        const camGeo = await this.loader.load("/assets/scene3/SC_03_CAMERA.buf");
        if (camGeo.attributes.position && camGeo.attributes.orient) {
          this.cameraKeyframes.positions = camGeo.attributes.position.array as Float32Array;
          this.cameraKeyframes.orientations = camGeo.attributes.orient.array as Float32Array;
          this.cameraKeyframes.count = camGeo.attributes.position.count;
          if (camGeo.attributes.focal) {
            this.cameraKeyframes.focal = camGeo.attributes.focal.array as Float32Array;
          }
          if (camGeo.attributes.mobileFocal) {
            this.cameraKeyframes.mobileFocal = camGeo.attributes.mobileFocal.array as Float32Array;
          }
        }
      } catch (camErr) {
        console.warn("sc_03_camera load skipped:", camErr);
      }

      this.isLoaded = true;
    } catch (err) {
      console.warn("scene 3 initialization error:", err);
    }
  }

  // helper to load textures asynchronously
  private loadTextureAsync(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(url, resolve, undefined, reject);
    });
  }

  // update lake animations and camera track interpolation
  public update(time: number, lakeProgress: number, camera: THREE.PerspectiveCamera, isMobile: boolean): void {
    if (!this.isLoaded) return;

    this.sharedUniforms.u_time.value = time;

    // keep sky dome anchored directly on camera center
    if (this.skyDome) {
      this.skyDome.position.copy(camera.position);
    }

    // interpolate camera position and rotation along the 120 keyframes of sc_03_camera.buf
    if (this.cameraKeyframes.positions && this.cameraKeyframes.orientations && this.cameraKeyframes.count > 1) {
      const clamped = Math.max(0, Math.min(1, lakeProgress));
      const floatIndex = clamped * (this.cameraKeyframes.count - 1);
      const index0 = Math.floor(floatIndex);
      const index1 = Math.min(index0 + 1, this.cameraKeyframes.count - 1);
      const ratio = floatIndex - index0;

      const pos = this.cameraKeyframes.positions;
      const ori = this.cameraKeyframes.orientations;

      this.tempV1.set(pos[index0 * 3], pos[index0 * 3 + 1], pos[index0 * 3 + 2]);
      this.tempV2.set(pos[index1 * 3], pos[index1 * 3 + 1], pos[index1 * 3 + 2]);
      camera.position.lerpVectors(this.tempV1, this.tempV2, ratio);

      this.tempQ1.set(ori[index0 * 4], ori[index0 * 4 + 1], ori[index0 * 4 + 2], ori[index0 * 4 + 3]);
      this.tempQ2.set(ori[index1 * 4], ori[index1 * 4 + 1], ori[index1 * 4 + 2], ori[index1 * 4 + 3]);
      camera.quaternion.slerpQuaternions(this.tempQ1, this.tempQ2, ratio);

      // adapt focal length / fov if specified in trajectory buffer with tightened zoom
      const focalArr = isMobile && this.cameraKeyframes.mobileFocal ? this.cameraKeyframes.mobileFocal : this.cameraKeyframes.focal;
      if (focalArr) {
        const f0 = focalArr[index0];
        const f1 = focalArr[index1];
        const focal = f0 + (f1 - f0) * ratio;
        if (focal > 10 && focal < 150) {
          const aperture = 34.0;
          const apy = (window.innerHeight * aperture) / window.innerWidth;
          const fov = 2 * Math.atan(apy / 2 / focal) * (180 / Math.PI);
          camera.fov = THREE.MathUtils.clamp(fov, 30, 52);
          camera.updateProjectionMatrix();
        }
      }

      // advance camera slightly forward to ensure foreground terrain extends well past the bottom viewport edge
      camera.translateZ(-95.0);
    }
  }
}

