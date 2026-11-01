import * as THREE from "three";
import { BufLoader } from "./BufLoader";
import { islandVertexShader, islandFragmentShader } from "./shaders/islandShaders";
import { skyVertexShader, skyFragmentShader, cloudVertexShader, cloudFragmentShader } from "./shaders/skyShaders";

// manager for scene 2 floating archipelago, neon flora, and aerial transition
export class Scene2 {
  public container = new THREE.Group();
  public isLoaded = false;

  // shared uniforms for scene 2 lighting and fog
  private skyColor0 = new THREE.Color("#204668");
  private skyColor1 = new THREE.Color("#081220");

  private sharedUniforms = {
    u_time: { value: 0 },
    u_flowTime: { value: 0 },
    u_flowStrength: { value: 8.0 },
    u_size: { value: new THREE.Vector2(1600, 600) },
    u_trailMaskMixer: { value: new THREE.Vector3(0.7, 0.4, 0.9) },
    u_skyColor0: { value: new THREE.Color("#204668") },
    u_skyColor1: { value: new THREE.Color("#081220") },
    u_fogNear: { value: 200 },
    u_fogFar: { value: 3500 },
  };

  // floating monolith meshes and materials
  private islandMeshes: THREE.Mesh[] = [];
  private islandMaterials: THREE.ShaderMaterial[] = [];
  private islandTextures: THREE.Texture[] = [];
  private flowTexture: THREE.Texture | null = null;
  private trailMaskTexture: THREE.Texture | null = null;

  // neon flora instances placed on floating islands
  private floraMeshes: THREE.Mesh[] = [];
  private skyDome: THREE.Mesh | null = null;
  private cloudMeshes: THREE.Mesh[] = [];

  // camera and bird trajectory curve connecting scene 1 exit to scene 3 lake entrance
  public flightSpline: THREE.CatmullRomCurve3;

  // temporary math structures to eliminate frame allocations
  private tempV1 = new THREE.Vector3();
  private tempV2 = new THREE.Vector3();
  private tempV3 = new THREE.Vector3();
  private tempQ1 = new THREE.Quaternion();
  private tempM1 = new THREE.Matrix4();

  constructor(private loader: BufLoader, private textureLoader: THREE.TextureLoader) {
    // create 7-point catmull-rom flight path weaving from mountain pass through floating islands to lake
    this.flightSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1549.9, 158.7, 522.8),   // exit of scene 1 mountain pass
      new THREE.Vector3(1050.0, 280.0, 360.0),   // climbing into lower cloud deck
      new THREE.Vector3(450.0, 330.0, 180.0),    // soaring above piece 1 and 2
      new THREE.Vector3(-80.0, 300.0, 110.0),    // passing between island 3 and 4 with neon flora
      new THREE.Vector3(-520.0, 260.0, 320.0),   // banking over island 5 and 6
      new THREE.Vector3(-420.0, 210.0, 1150.0),  // steep downward pitch through cloud mist
      new THREE.Vector3(-346.1, 185.8, 2175.3),  // entrance to scene 3 lake trajectory
    ]);
  }

  // loads all 6 island monoliths, flow textures, neon flora, and sky dome
  public async load(): Promise<void> {
    try {
      // 1. load sky dome
      const skyGeo = new THREE.SphereGeometry(2400, 16, 16);
      const skyMat = new THREE.ShaderMaterial({
        vertexShader: skyVertexShader,
        fragmentShader: skyFragmentShader,
        uniforms: {
          u_skyColor0: this.sharedUniforms.u_skyColor0,
          u_skyColor1: this.sharedUniforms.u_skyColor1,
          u_dimRatio: { value: 0 },
        },
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false,
      });
      this.skyDome = new THREE.Mesh(skyGeo, skyMat);
      this.skyDome.renderOrder = -1;
      this.skyDome.frustumCulled = false;
      this.container.add(this.skyDome);

      // 2. load flow map and trail mask textures
      const [flowTex, trailMaskTex] = await Promise.all([
        this.loadTextureAsync("/assets/textures/scene2/FLOW.webp"),
        this.loadTextureAsync("/assets/textures/scene2/TRAILS.webp"),
      ]);
      flowTex.wrapS = flowTex.wrapT = THREE.RepeatWrapping;
      trailMaskTex.wrapS = trailMaskTex.wrapT = THREE.RepeatWrapping;
      this.flowTexture = flowTex;
      this.trailMaskTexture = trailMaskTex;

      // 3. load 6 island piece textures
      const texPromises: Promise<THREE.Texture>[] = [];
      for (let i = 1; i <= 6; i++) {
        texPromises.push(this.loadTextureAsync(`/assets/textures/scene2/SC_02_P${i}_TEXTURE.webp`));
      }
      this.islandTextures = await Promise.all(texPromises);
      for (const t of this.islandTextures) {
        t.generateMipmaps = true;
      }

      // 4. load 6 monolith island geometries and assemble materials
      for (let i = 0; i < 6; i++) {
        try {
          const geo = await this.loader.load(`/assets/scene2/SC_02_PIECE_${i + 1}.buf`);
          const prevTex = this.islandTextures[Math.max(0, i - 1)];
          const curTex = this.islandTextures[i];
          const nextTex = this.islandTextures[Math.min(this.islandTextures.length - 1, i + 1)];

          const mat = new THREE.ShaderMaterial({
            vertexShader: islandVertexShader,
            fragmentShader: islandFragmentShader,
            uniforms: {
              u_texturePrev: { value: prevTex },
              u_texture: { value: curTex },
              u_textureNext: { value: nextTex },
              u_flowTexture: { value: this.flowTexture },
              u_trailMaskTexture: { value: this.trailMaskTexture },
              u_trailMaskMixer: this.sharedUniforms.u_trailMaskMixer,
              u_flowStrength: this.sharedUniforms.u_flowStrength,
              u_flowTime: this.sharedUniforms.u_flowTime,
              u_size: this.sharedUniforms.u_size,
              u_tileIndex: { value: i },
              u_skyColor0: this.sharedUniforms.u_skyColor0,
              u_skyColor1: this.sharedUniforms.u_skyColor1,
              u_fogNear: this.sharedUniforms.u_fogNear,
              u_fogFar: this.sharedUniforms.u_fogFar,
            },
            side: THREE.DoubleSide,
          });

          const mesh = new THREE.Mesh(geo, mat);
          mesh.renderOrder = 2;
          this.container.add(mesh);
          this.islandMeshes.push(mesh);
          this.islandMaterials.push(mat);
        } catch (islandErr) {
          console.warn(`sc_02_piece_${i + 1} load skipped:`, islandErr);
        }
      }

      // 5. load and scatter neon forest flora across the floating monoliths
      await this.loadFloraAsync();

      // 6. create ambient floating cloud layers
      await this.createCloudsAsync();

      this.isLoaded = true;
    } catch (err) {
      console.warn("scene 2 initialization error:", err);
    }
  }

  // loads downloaded neon forest models and populates them on the floating islands
  private async loadFloraAsync(): Promise<void> {
    const geomLoader = new THREE.BufferGeometryLoader();
    const floraFiles = [
      { file: "huge-flower.json", scale: 0.12, yOffset: 12 },
      { file: "flower03.json", scale: 0.28, yOffset: 8 },
      { file: "mdl_env_1_forest_mushroom_a_v01.json", scale: 0.35, yOffset: 6 },
      { file: "mdl_env_1_forest_mushroom_b_v01.json", scale: 0.3, yOffset: 6 },
      { file: "mdl_env_1_forest_tree_f_v01.json", scale: 0.25, yOffset: 4 },
      { file: "mdl_env_1_forest_tree_g_v01.json", scale: 0.25, yOffset: 4 },
      { file: "mdl_env_1_forest_rock_a_v01.json", scale: 0.4, yOffset: 4 },
    ];

    // shared unlit material utilizing vertex colors and atmospheric fog
    const floraMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.3,
      metalness: 0.15,
      emissive: new THREE.Color("#183048"),
      emissiveIntensity: 0.45,
    });

    for (let f = 0; f < floraFiles.length; f++) {
      const def = floraFiles[f];
      try {
        const res = await fetch(`/assets/neon_forest/${def.file}`);
        if (!res.ok) continue;
        const json = await res.json();
        const geo = geomLoader.parse(json);

        // scatter 6 clusters per flora type across the 1500 unit span of the islands
        for (let c = 0; c < 6; c++) {
          const mesh = new THREE.Mesh(geo, floraMat);
          const x = -650 + c * 240 + (Math.sin(c * 3.7 + f) * 60);
          const y = 18 + def.yOffset + Math.sin(c * 1.5) * 5;
          const z = (Math.cos(c * 2.3 + f) * 75);

          mesh.position.set(x, y, z);
          const s = def.scale * (0.8 + Math.random() * 0.4);
          mesh.scale.set(s, s, s);
          mesh.rotation.y = Math.random() * Math.PI * 2;
          mesh.renderOrder = 3;

          this.container.add(mesh);
          this.floraMeshes.push(mesh);
        }
      } catch (floraErr) {
        console.warn(`failed to populate flora ${def.file}:`, floraErr);
      }
    }
  }

  // creates drifting upper-sky cloud billboards
  private async createCloudsAsync(): Promise<void> {
    try {
      const cloudTex = await this.loadTextureAsync("/assets/textures/cloud.png");
      const cloudGeo = new THREE.PlaneGeometry(800, 360);
      const cloudMat = new THREE.ShaderMaterial({
        vertexShader: cloudVertexShader,
        fragmentShader: cloudFragmentShader,
        uniforms: {
          u_texture: { value: cloudTex },
          u_dimRatio: { value: 0 },
          u_opacity: { value: 0.65 },
          u_tintDay: { value: new THREE.Color("#c8dcfa") },
          u_tintNight: { value: new THREE.Color("#1a2b42") },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      // place 8 ambient cloud planes above and flanking the island chain
      for (let i = 0; i < 8; i++) {
        const mesh = new THREE.Mesh(cloudGeo, cloudMat);
        mesh.position.set(
          -700 + i * 200,
          250 + (i % 3) * 60,
          -250 + (i % 2) * 500
        );
        mesh.rotation.y = (i * 0.4) - 0.8;
        mesh.renderOrder = 1;
        this.container.add(mesh);
        this.cloudMeshes.push(mesh);
      }
    } catch (cloudErr) {
      console.warn("cloud billboards load skipped:", cloudErr);
    }
  }

  // helper to load textures asynchronously
  private loadTextureAsync(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(url, resolve, undefined, reject);
    });
  }

  // update island flow animations and evaluate flight spline for camera and falcon
  public update(time: number, sceneProgress: number, camera: THREE.PerspectiveCamera, falconMesh: THREE.Mesh | null): void {
    if (!this.isLoaded) return;

    this.sharedUniforms.u_time.value = time;
    this.sharedUniforms.u_flowTime.value = time * 0.08;

    // keep sky dome centered on active camera
    if (this.skyDome) {
      this.skyDome.position.copy(camera.position);
    }

    // animate gentle floating levitation on monolith islands
    for (let i = 0; i < this.islandMeshes.length; i++) {
      const mesh = this.islandMeshes[i];
      mesh.position.y = Math.sin(time * 0.8 + i * 1.2) * 4.0;
    }

    // sample camera position and look-at orientation along the 7-point catmull-rom flight spline
    const clampedProg = Math.max(0, Math.min(1, sceneProgress));
    this.flightSpline.getPoint(clampedProg, this.tempV1);
    camera.position.copy(this.tempV1);

    // evaluate forward tangent vector along spline for natural smooth camera orientation
    const nextProg = Math.min(1.0, clampedProg + 0.02);
    this.flightSpline.getPoint(nextProg, this.tempV2);
    this.tempM1.lookAt(this.tempV1, this.tempV2, THREE.Object3D.DEFAULT_UP);
    this.tempQ1.setFromRotationMatrix(this.tempM1);
    camera.quaternion.copy(this.tempQ1);

    // position falcon ahead of the camera leading through the islands and banking into turns
    if (falconMesh) {
      const birdLeadProg = Math.min(1.0, clampedProg + 0.06);
      this.flightSpline.getPoint(birdLeadProg, this.tempV3);
      falconMesh.position.copy(this.tempV3);

      const birdNextProg = Math.min(1.0, birdLeadProg + 0.02);
      this.flightSpline.getPoint(birdNextProg, this.tempV2);
      this.tempM1.lookAt(this.tempV3, this.tempV2, THREE.Object3D.DEFAULT_UP);
      falconMesh.quaternion.setFromRotationMatrix(this.tempM1);

      // add banking roll proportional to turn curvature
      const rollAngle = Math.sin(clampedProg * Math.PI * 3.0) * 0.25;
      falconMesh.rotateZ(rollAngle);
    }
  }
}

