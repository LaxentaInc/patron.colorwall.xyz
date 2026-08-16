import * as THREE from "three";

// attribute metadata interface defining binary buffer layout and quantization parameters
export interface BufAttributeMeta {
  id: string;
  componentSize: number;
  storageType: "Uint16Array" | "Uint32Array" | "Float32Array" | "Int16Array" | "Int8Array" | "Uint8Array";
  needsPack?: boolean;
  packedComponents?: Array<{
    from: number;
    delta: number;
  }>;
}

// scene node metadata for hierarchical meshes embedded in a single buffer
export interface BufSceneNode {
  name?: string;
  vertexIndex: number;
  vertexCount: number;
  faceIndex: number;
  faceCount: number;
  position?: [number, number, number];
  quaternion?: [number, number, number, number];
  scale?: [number, number, number];
  data?: Record<string, any>;
  material?: string;
  parentIndex?: number;
}

// root json header layout inside the binary buf file
export interface BufHeader {
  vertexCount: number;
  indexCount: number;
  meshType?: "Mesh" | "LineSegments" | "Points";
  attributes: BufAttributeMeta[];
  sceneData?: BufSceneNode[];
}

// standalone parser for custom binary buf geometry files
export class BufLoader {
  private cache = new Map<string, THREE.BufferGeometry>();

  // typed array constructor lookup map
  private static typedArrayMap: Record<string, any> = {
    Uint16Array,
    Uint32Array,
    Float32Array,
    Int16Array,
    Int8Array,
    Uint8Array,
  };

  // loads a .buf file from a url and parses it into buffer geometry
  public async load(url: string): Promise<THREE.BufferGeometry> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!.clone();
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`failed to load buf file from ${url}: status ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const geometry = this.parse(arrayBuffer);
    this.cache.set(url, geometry);
    return geometry.clone();
  }

  // parses a raw arraybuffer into three.js buffer geometry
  public parse(buffer: ArrayBuffer): THREE.BufferGeometry {
    // the first 4 bytes store a 32-bit unsigned integer representing the json header byte length
    const headerLengthView = new Uint32Array(buffer, 0, 1);
    const headerLength = headerLengthView[0];

    // decode the utf-8 json string following the 4-byte prefix
    const headerBytes = new Uint8Array(buffer, 4, headerLength);
    let jsonString = "";
    for (let i = 0; i < headerBytes.length; i++) {
      jsonString += String.fromCharCode(headerBytes[i]);
    }

    const header: BufHeader = JSON.parse(jsonString);
    const geometry = new THREE.BufferGeometry();

    // calculate the byte offset where packed vertex attribute data begins
    let byteOffset = 4 + headerLength;
    const vertexCount = header.vertexCount;
    const indexCount = header.indexCount;

    // iterate through each attribute descriptor and decode corresponding byte blocks
    for (let i = 0; i < header.attributes.length; i++) {
      const attr = header.attributes[i];
      const count = attr.id === "indices" ? indexCount : vertexCount;
      const totalElements = count * attr.componentSize;
      const TypedArrayConstructor = BufLoader.typedArrayMap[attr.storageType] || Float32Array;

      // create a view over the raw binary slice
      const rawView = new TypedArrayConstructor(buffer, byteOffset, totalElements);
      const bytesPerElement = TypedArrayConstructor.BYTES_PER_ELEMENT;

      let finalArray: ArrayLike<number> = rawView;

      // if quantized packing is enabled, reconstruct float32 coordinates from normalized integers
      if (attr.needsPack && attr.packedComponents) {
        const unpackedFloats = new Float32Array(totalElements);
        const compCount = attr.packedComponents.length;
        const isSigned = attr.storageType.indexOf("Int") === 0;
        const maxVal = 1 << (bytesPerElement * 8);
        const halfVal = isSigned ? maxVal * 0.5 : 0;
        const invMax = 1 / maxVal;

        let writeIndex = 0;
        for (let v = 0; v < count; v++) {
          for (let c = 0; c < compCount; c++) {
            const range = attr.packedComponents[c];
            unpackedFloats[writeIndex] = (rawView[writeIndex] + halfVal) * invMax * range.delta + range.from;
            writeIndex++;
          }
        }
        finalArray = unpackedFloats;
      }

      // assign to geometry either as index buffer or named vertex attribute
      if (attr.id === "indices") {
        geometry.setIndex(new THREE.BufferAttribute(finalArray as any, 1));
      } else {
        geometry.setAttribute(attr.id, new THREE.BufferAttribute(finalArray as any, attr.componentSize));
      }

      byteOffset += totalElements * bytesPerElement;
    }

    // store additional metadata on user data for scene hierarchies
    if (header.sceneData) {
      geometry.userData.sceneData = header.sceneData;
    }

    // compute normals automatically if not explicitly provided
    if (!geometry.attributes.normal && geometry.attributes.position) {
      geometry.computeVertexNormals();
    }

    return geometry;
  }
}
