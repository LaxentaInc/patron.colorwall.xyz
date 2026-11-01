import * as THREE from "three";
import { skyVertexShader, skyFragmentShader, cloudVertexShader, cloudFragmentShader } from "./shaders/skyShaders";

// manager for scene 2 atmospheric cloud expanse and aerial falcon flight
export class Scene2 {
  public container = new THREE.Group();
  public isLoaded = false;

  // shared uniforms for scene 2 lighting and fog
  private skyColor0 = new THREE.Color("#1c4266");
  private skyColor1 = new THREE.Color("#081220");

  private sharedUniforms = {
    u_time: { value: 0 },
    u_skyColor0: { value: new THREE.Color("#1c4266") },
    u_skyColor1: { value: new THREE.Color("#081220") },
    u_fogNear: { value: 300 },
    u_fogFar: { value: 3800 },
  };

  private skyDome: THREE.Mesh | null = null;
  private cloudMeshes: THREE.Mesh[] = [];
  private cloudBasePositions: THREE.Vector3[] = [];

  // camera and bird trajectory curve connecting scene 1 exit to scene 3 lake entrance
  public flightSpline: THREE.CatmullRomCurve3;

  // temporary math structures to eliminate frame allocations
  private tempV1 = new THREE.Vector3();
  private tempV2 = new THREE.Vector3();
  private tempV3 = new THREE.Vector3();
  private tempQ1 = new THREE.Quaternion();
  private tempM1 = new THREE.Matrix4();

  constructor(private textureLoader: THREE.TextureLoader) {
    // create 7-point catmull-rom flight path weaving from mountain pass through cloud banks to lake
    this.flightSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1549.9, 158.7, 522.8),   // exit of scene 1 mountain pass
      new THREE.Vector3(1050.0, 240.0, 360.0),   // climbing into upper cloud layer
      new THREE.Vector3(450.0, 260.0, 180.0),    // banking across open sky
      new THREE.Vector3(-80.0, 240.0, 110.0),    // soaring between towering cloud billows
      new THREE.Vector3(-480.0, 210.0, 320.0),   // banking left toward lake horizon
      new THREE.Vector3(-420.0, 170.0, 1150.0),  // steep downward dive through cloud mist
      new THREE.Vector3(-346.1, 185.8, 2175.3),  // entrance to scene 3 lake trajectory
    ]);
  }

  // loads sky dome and builds expansive layered cloud world
  public async load(): Promise<void> {
    try {
      // 1. load sky dome with deep atmospheric twilight gradient
      const skyGeo = new THREE.SphereGeometry(3200, 16, 16);
      const skyMat = new THREE.ShaderMaterial({
        vertexShader: skyVertexShader,
        fragmentShader: skyFragmentShader,
        uniforms: {
          u_skyColor0: { value: new THREE.Color("#224d74") },
          u_skyColor1: { value: new THREE.Color("#081422") },
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

      // 2. build expansive layered cloud banks
      await this.buildCloudWorldAsync();

      this.isLoaded = true;
    } catch (err) {
      console.warn("scene 2 initialization error:", err);
    }
  }

  // creates extensive cloud sea below, towering banks flanking flight curve, and wispy cirrus above
  private async buildCloudWorldAsync(): Promise<void> {
    try {
      const cloudTex = await this.loadTextureAsync("/assets/textures/cloud.png");

      // shared material for soft volumetric cloud billboards
      const cloudGeo = new THREE.PlaneGeometry(900, 480);
      const cloudMat = new THREE.ShaderMaterial({
        vertexShader: cloudVertexShader,
        fragmentShader: cloudFragmentShader,
        uniforms: {
          u_texture: { value: cloudTex },
          u_dimRatio: { value: 0 },
          u_opacity: { value: 0.75 },
          u_tintDay: { value: new THREE.Color("#e0eefc") },
          u_tintNight: { value: new THREE.Color("#1c334d") },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      // 1. continuous cloud ocean below the flight path (y: 20 to 80)
      for (let i = 0; i < 18; i++) {
        const mesh = new THREE.Mesh(cloudGeo, cloudMat);
        const x = 1400 - i * 140 + (Math.sin(i * 1.7) * 80);
        const y = 40 + Math.sin(i * 2.3) * 25;
        const z = -250 + (i % 3) * 350 + (Math.cos(i * 1.5) * 60);

        mesh.position.set(x, y, z);
        mesh.rotation.x = -Math.PI / 2 + (Math.sin(i) * 0.12);
        mesh.rotation.z = Math.cos(i * 1.1) * 0.25;
        mesh.scale.setScalar(1.0 + Math.random() * 0.4);
        mesh.renderOrder = 1;

        this.container.add(mesh);
        this.cloudMeshes.push(mesh);
        this.cloudBasePositions.push(mesh.position.clone());
      }

      // 2. towering cloud billows flanking the flight curve that the bird banks through
      const gatePositions = [
        new THREE.Vector3(1200, 200, 500),
        new THREE.Vector3(1000, 230, 200),
        new THREE.Vector3(700, 250, 350),
        new THREE.Vector3(500, 270, 50),
        new THREE.Vector3(200, 260, 300),
        new THREE.Vector3(-100, 240, -50),
        new THREE.Vector3(-350, 220, 250),
        new THREE.Vector3(-550, 200, 500),
        new THREE.Vector3(-450, 160, 950),
        new THREE.Vector3(-380, 140, 1450),
      ];

      for (let j = 0; j < gatePositions.length; j++) {
        const billowMesh = new THREE.Mesh(cloudGeo, cloudMat);
        const p = gatePositions[j];
        billowMesh.position.set(
          p.x + (Math.sin(j * 3.1) * 40),
          p.y + (Math.cos(j * 2.1) * 30),
          p.z + (Math.sin(j * 1.7) * 40)
        );
        billowMesh.rotation.y = (j * 0.4) - 0.6;
        billowMesh.scale.setScalar(1.1 + Math.random() * 0.35);
        billowMesh.renderOrder = 2;

        this.container.add(billowMesh);
        this.cloudMeshes.push(billowMesh);
        this.cloudBasePositions.push(billowMesh.position.clone());
      }
    } catch (cloudErr) {
      console.warn("cloud world load skipped:", cloudErr);
    }
  }

  // helper to load textures asynchronously
  private loadTextureAsync(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(url, resolve, undefined, reject);
    });
  }

  // update cloud animations and evaluate flight spline for camera and falcon
  public update(time: number, sceneProgress: number, camera: THREE.PerspectiveCamera, falconMesh: THREE.Mesh | null): void {
    if (!this.isLoaded) return;

    this.sharedUniforms.u_time.value = time;

    // keep sky dome anchored directly on camera center
    if (this.skyDome) {
      this.skyDome.position.copy(camera.position);
    }

    // animate gentle horizontal drift across all cloud billboards
    for (let i = 0; i < this.cloudMeshes.length; i++) {
      const c = this.cloudMeshes[i];
      const base = this.cloudBasePositions[i];
      if (base) {
        c.position.x = base.x + Math.sin(time * 0.06 + i * 0.8) * 15;
      }
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

    // position falcon ahead of the camera leading through the clouds and banking into turns
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
