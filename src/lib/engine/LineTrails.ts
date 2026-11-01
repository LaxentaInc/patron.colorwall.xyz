import * as THREE from "three";
import { BufLoader } from "./BufLoader";
import { trailVertexShader, trailFragmentShader } from "./shaders/trailShaders";

// manager for volumetric ribbon trails inspired by samsy lineengine
export class LineTrails {
  public container = new THREE.Group();
  public isLoaded = false;

  private trailMeshes: THREE.Mesh[] = [];
  private trailMaterials: THREE.ShaderMaterial[] = [];
  private smokeTexture: THREE.Texture | null = null;

  constructor(private loader: BufLoader, private textureLoader: THREE.TextureLoader) {}

  // loads ribbon trail buffers and smoke alpha texture
  public async load(): Promise<void> {
    try {
      // load smoke texture for chromatic dispersion
      this.smokeTexture = await new Promise<THREE.Texture>((resolve, reject) => {
        this.textureLoader.load(
          "/assets/textures/scene2/SMOKE.webp",
          (tex) => {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.generateMipmaps = false;
            resolve(tex);
          },
          undefined,
          reject
        );
      });

      // load 3 ribbon meshes sequentially
      for (let i = 0; i < 3; i++) {
        try {
          const geo = await this.loader.load(`/assets/scene2/TRAIL_${i}.buf`);

          // calculate total ribbon length from the dist attribute
          let ribbonLength = 1000;
          if (geo.attributes.dist && geo.attributes.dist.array.length > 0) {
            ribbonLength = geo.attributes.dist.array[geo.attributes.dist.array.length - 1];
          }

          // create additive shader material for luminous energetic ribbons
          const mat = new THREE.ShaderMaterial({
            vertexShader: trailVertexShader,
            fragmentShader: trailFragmentShader,
            uniforms: {
              u_smokeTexture: { value: this.smokeTexture },
              u_time: { value: 0 },
              u_index: { value: i },
              u_width: { value: 16.0 },
              u_length: { value: ribbonLength },
              u_fadeLength: { value: 35.0 },
              u_opacity: { value: 0 },
            },
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: THREE.CustomBlending,
            blendEquation: THREE.AddEquation,
            blendSrc: THREE.SrcAlphaFactor,
            blendDst: THREE.OneFactor,
          });

          const mesh = new THREE.Mesh(geo, mat);
          mesh.renderOrder = 10 + i;
          mesh.frustumCulled = false;

          this.container.add(mesh);
          this.trailMeshes.push(mesh);
          this.trailMaterials.push(mat);
        } catch (trailErr) {
          console.warn(`trail_${i} buffer skipped:`, trailErr);
        }
      }

      this.isLoaded = true;
    } catch (err) {
      console.warn("line trails initialization skipped:", err);
    }
  }

  // update ribbon animation time and visibility opacity based on warp progress
  public update(time: number, activeRatio: number): void {
    if (!this.isLoaded) return;

    this.container.visible = activeRatio > 0.001;
    if (!this.container.visible) return;

    for (let i = 0; i < this.trailMaterials.length; i++) {
      const mat = this.trailMaterials[i];
      mat.uniforms.u_time.value = time;
      mat.uniforms.u_opacity.value = activeRatio;
    }
  }
}

