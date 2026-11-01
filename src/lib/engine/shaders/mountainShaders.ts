// vertex shader for mountain peaks, ridges, and background terrain
export const mountainVertexShader = /* glsl */ `
varying vec2 v_uv;
varying vec3 v_worldPosition;
varying vec3 v_viewPosition;
varying vec3 v_viewNormal;

#ifdef HAS_ALPHA
attribute float alpha;
varying float v_alpha;
#endif

#ifdef IS_SCENE_1
attribute float shadowmask;
attribute float trailRatio;
uniform float u_dimRatio;
uniform float u_trailRatio;
varying float v_dimRatio;
#endif

void main() {
  vec3 pos = position;
  vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * viewPosition;

  v_uv = uv;
  v_worldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
  v_viewPosition = -viewPosition.xyz;
  v_viewNormal = normalize(normalMatrix * normal);

  #ifdef HAS_ALPHA
  v_alpha = alpha;
  #endif

  #ifdef IS_SCENE_1
  v_dimRatio = min(u_dimRatio, 1.0 - (shadowmask * smoothstep(trailRatio - 0.1, trailRatio, u_trailRatio)));
  #endif
}
`;

// fragment shader for realistic mountain lighting, texture sampling, and depth fog
export const mountainFragmentShader = /* glsl */ `
uniform sampler2D u_texture;
uniform float u_time;
uniform vec3 u_skyColor0;
uniform vec3 u_skyColor1;
uniform float u_fogNear;
uniform float u_fogFar;

varying vec2 v_uv;
varying vec3 v_worldPosition;
varying vec3 v_viewPosition;
varying vec3 v_viewNormal;

#ifdef HAS_ALPHA
varying float v_alpha;
#endif

#ifdef IS_SCENE_1
varying float v_dimRatio;
#endif

vec3 getSkyColor(vec3 worldPos) {
  float h = clamp(normalize(worldPos).y * 0.5 + 0.5, 0.0, 1.0);
  float t = smoothstep(0.1, 0.85, h);
  return mix(u_skyColor0, u_skyColor1, t);
}

vec4 getFogColor(vec3 col, vec3 sky, float viewZ) {
  // exponential depth fog calculation based on camera distance
  float fogFactor = clamp((viewZ - u_fogNear) / (u_fogFar - u_fogNear), 0.0, 1.0);
  return vec4(mix(col, sky, fogFactor), 1.0);
}

void main() {
  vec2 uv = v_uv;
  vec3 N = normalize(v_viewNormal);
  vec3 V = normalize(v_viewPosition);

  // directional light contribution from top-left
  vec3 lightDir = normalize(vec3(0.5, 0.8, 0.3));
  float diffuse = max(dot(N, lightDir), 0.0) * 0.4 + 0.6;

  // rim light fresnel effect for cinematic mountain silhouettes
  float NdV = clamp(abs(dot(N, V)), 0.001, 1.0);
  float fresnel = pow(1.0 - NdV, 4.0) * 0.25;

  // sample surface texture and apply gamma correction
  vec4 texColor = texture2D(u_texture, uv);
  vec3 color = pow(texColor.rgb, vec3(2.2)) * diffuse;
  color += fresnel * u_skyColor1;

  #ifdef IS_SCENE_1
  color *= mix(1.0, 0.3, v_dimRatio);
  #endif

  // atmospheric sky fog blending
  vec3 skyColor = pow(getSkyColor(v_worldPosition), vec3(2.2));
  vec4 fogColor = getFogColor(color, skyColor, length(v_viewPosition));
  color = fogColor.rgb;

  #ifdef HAS_ALPHA
  float alphaVal = pow(clamp(v_alpha, 0.0, 1.0), 0.5);
  color = mix(skyColor, color, alphaVal);
  #endif

  // encode final color back to gamma space for srgb presentation
  gl_FragColor = vec4(pow(color, vec3(1.0 / 2.2)), 1.0);
}
`;
