// vertex shader for volumetric hero fog mesh
export const fogVertexShader = /* glsl */ `
varying vec2 v_uv;
varying vec3 v_worldPosition;
varying vec3 v_viewPosition;

void main() {
  vec3 pos = position;
  vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * viewPosition;

  v_uv = uv;
  v_worldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
  v_viewPosition = -viewPosition.xyz;
}
`;

// fragment shader for flowing fog distortion and atmospheric soft blend
export const fogFragmentShader = /* glsl */ `
uniform sampler2D u_fogTexture;
uniform sampler2D u_flowTexture;
uniform float u_time;
uniform float u_opacity;
uniform vec3 u_fogColor;

varying vec2 v_uv;
varying vec3 v_worldPosition;
varying vec3 v_viewPosition;

void main() {
  // sample flow vector to deform fog texture coordinates
  vec2 flow = (texture2D(u_flowTexture, v_uv * 0.5 + vec2(u_time * 0.015, 0.0)).rg - 0.5) * 0.15;
  vec2 distortedUv = v_uv + flow + vec2(u_time * 0.02, 0.0);

  vec4 fogSample = texture2D(u_fogTexture, distortedUv);
  float alpha = fogSample.r * u_opacity;

  // soft depth fade to avoid harsh clipping against camera near plane
  float dist = length(v_viewPosition);
  alpha *= smoothstep(50.0, 300.0, dist);

  gl_FragColor = vec4(u_fogColor, alpha);
}
`;
