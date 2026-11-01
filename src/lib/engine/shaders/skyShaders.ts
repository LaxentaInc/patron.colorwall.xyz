// vertex shader for spherical sky dome projection
export const skyVertexShader = /* glsl */ `
varying vec2 v_uv;
varying vec3 v_worldPosition;

void main() {
  vec3 pos = position;
  vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * viewPosition;
  v_uv = uv;
  v_worldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
}
`;

// fragment shader for procedural sky dome gradient and dimming
export const skyFragmentShader = /* glsl */ `
uniform vec3 u_skyColor0;
uniform vec3 u_skyColor1;
uniform float u_dimRatio;

varying vec2 v_uv;
varying vec3 v_worldPosition;

vec3 getSkyColor(vec3 worldPos) {
  // calculate vertical height ratio on the sphere normalized between 0 and 1
  float h = clamp(normalize(worldPos).y * 0.5 + 0.5, 0.0, 1.0);
  // smooth the gradient curve for natural atmospheric transition
  float t = smoothstep(0.1, 0.85, h);
  return mix(u_skyColor0, u_skyColor1, t);
}

void main() {
  vec3 skyColor = getSkyColor(v_worldPosition);
  // apply gamma conversion for proper linear blending in three.js pipeline
  gl_FragColor = vec4(skyColor, 1.0);
}
`;
