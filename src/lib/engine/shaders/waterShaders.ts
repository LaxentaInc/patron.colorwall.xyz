// vertex shader for scene 3 water and land terrain meshes with mask attributes
export const waterVertexShader = /* glsl */ `
varying vec2 v_uv;
varying vec3 v_worldPosition;
varying vec3 v_viewPosition;
varying vec3 v_viewNormal;

#ifdef IS_WATER
attribute float mask;
varying float v_mask;
#endif

void main() {
  vec3 pos = position;
  vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * viewPosition;

  v_uv = uv;

  #ifdef IS_WATER
  v_mask = mask;
  #endif

  v_worldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
  v_viewPosition = -viewPosition.xyz;
  v_viewNormal = normalize(normalMatrix * normal);
}
`;

// fragment shader for scene 3 water and shoreline with simplex waves and fresnel reflection
export const waterFragmentShader = /* glsl */ `
varying vec2 v_uv;
varying vec3 v_worldPosition;
varying vec3 v_viewPosition;
varying vec3 v_viewNormal;

#ifdef IS_WATER
varying float v_mask;

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

float permute(float x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip) {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p, s;
  p.xyz = floor(fract(vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz * 2.0 - 1.0) * s.www;
  return p;
}

#define F4 0.309016994374947451

vec4 simplexNoiseDerivatives(vec4 v) {
  const vec4 C = vec4(
    0.138196601125011,
    0.276393202250021,
    0.414589803375032,
    -0.447213595499958
  );
  vec4 i = floor(v + dot(v, vec4(F4)));
  vec4 x0 = v - i + dot(i, C.xxxx);
  vec4 i0;
  vec3 isX = step(x0.yzw, x0.xxx);
  vec3 isYZ = step(x0.zww, x0.yyz);
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;
  vec4 i3 = clamp(i0, 0.0, 1.0);
  vec4 i2 = clamp(i0 - 1.0, 0.0, 1.0);
  vec4 i1 = clamp(i0 - 2.0, 0.0, 1.0);
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;
  i = mod289(i);
  float j0 = permute(permute(permute(permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute(permute(permute(permute(
    i.w + vec4(i1.w, i2.w, i3.w, 1.0)) + i.z + vec4(i1.z, i2.z, i3.z, 1.0)) + i.y + vec4(i1.y, i2.y, i3.y, 1.0)) + i.x + vec4(i1.x, i2.x, i3.x, 1.0));
  vec4 ip = vec4(1.0 / 294.0, 1.0 / 49.0, 1.0 / 7.0, 0.0);
  vec4 p0 = grad4(j0, ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4, p4));
  vec3 values0 = vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2));
  vec2 values1 = vec2(dot(p3, x3), dot(p4, x4));
  vec3 m0 = max(0.5 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
  vec2 m1 = max(0.5 - vec2(dot(x3, x3), dot(x4, x4)), 0.0);
  vec3 temp0 = -6.0 * m0 * m0 * values0;
  vec2 temp1 = -6.0 * m1 * m1 * values1;
  vec3 mmm0 = m0 * m0 * m0;
  vec2 mmm1 = m1 * m1 * m1;
  float dx = temp0[0] * x0.x + temp0[1] * x1.x + temp0[2] * x2.x + temp1[0] * x3.x + temp1[1] * x4.x + mmm0[0] * p0.x + mmm0[1] * p1.x + mmm0[2] * p2.x + mmm1[0] * p3.x + mmm1[1] * p4.x;
  float dy = temp0[0] * x0.y + temp0[1] * x1.y + temp0[2] * x2.y + temp1[0] * x3.y + temp1[1] * x4.y + mmm0[0] * p0.y + mmm0[1] * p1.y + mmm0[2] * p2.y + mmm1[0] * p3.y + mmm1[1] * p4.y;
  float dz = temp0[0] * x0.z + temp0[1] * x1.z + temp0[2] * x2.z + temp1[0] * x3.z + temp1[1] * x4.z + mmm0[0] * p0.z + mmm0[1] * p1.z + mmm0[2] * p2.z + mmm1[0] * p3.z + mmm1[1] * p4.z;
  float dw = temp0[0] * x0.w + temp0[1] * x1.w + temp0[2] * x2.w + temp1[0] * x3.w + temp1[1] * x4.w + mmm0[0] * p0.w + mmm0[1] * p1.w + mmm0[2] * p2.w + mmm1[0] * p3.w + mmm1[1] * p4.w;
  return vec4(dx, dy, dz, dw) * 49.0;
}
#endif

uniform sampler2D u_texture;
uniform sampler2D u_waterNormal;
uniform float u_time;
uniform vec3 u_skyColor0;
uniform vec3 u_skyColor1;
uniform float u_fogNear;
uniform float u_fogFar;

vec3 getSkyColor(vec3 worldPos) {
  // calculate vertical height ratio on the sky sphere normalized between 0 and 1
  float h = clamp(normalize(worldPos).y * 0.5 + 0.5, 0.0, 1.0);
  float t = smoothstep(0.1, 0.85, h);
  return mix(u_skyColor0, u_skyColor1, t);
}

vec4 getFogColor(vec3 col, vec3 sky, float viewZ) {
  // exponential depth fog calculation based on camera view distance
  float fogFactor = clamp((viewZ - u_fogNear) / (u_fogFar - u_fogNear), 0.0, 1.0);
  return vec4(mix(col, sky, fogFactor), 1.0);
}

void main() {
  vec2 uv = v_uv;
  vec3 N = normalize(v_viewNormal);
  vec3 V = normalize(v_viewPosition);

  #ifdef IS_WATER
  // compute 4d simplex noise derivatives to simulate animated liquid ripple turbulence
  vec4 noise = simplexNoiseDerivatives(vec4(0.02 * v_worldPosition * vec3(1.0, 0.0, 2.5), 0.4 * u_time));
  float maskCubed = v_mask * v_mask * v_mask;
  uv += 0.012 * maskCubed * noise.xy;

  // sample normal map with opposing directional flow vectors for organic water caustics
  vec2 normalUv1 = uv * 3.5 + vec2(u_time * 0.025, u_time * 0.015);
  vec2 normalUv2 = uv * 4.5 - vec2(u_time * 0.018, u_time * 0.022);
  vec3 nMap1 = texture2D(u_waterNormal, normalUv1).rgb * 2.0 - 1.0;
  vec3 nMap2 = texture2D(u_waterNormal, normalUv2).rgb * 2.0 - 1.0;
  vec3 waveNormal = normalize(nMap1 + nMap2);
  N = normalize(mix(N, waveNormal, 0.25 * v_mask));
  #endif

  // calculate schlick fresnel term for reflective grazing angles
  float NdV = clamp(abs(dot(N, V)), 0.001, 1.0);
  float fresnel = pow(1.0 - NdV, 5.0);

  // sample surface texture and convert to linear light space
  vec3 color = pow(texture2D(u_texture, uv).rgb, vec3(2.2));

  #ifdef IS_WATER
  // blend surface lake texture with sky reflection glint on water ripples
  vec3 waterSkyGlint = mix(vec3(0.3, 0.6, 0.9), vec3(0.9, 0.95, 1.0), fresnel);
  color = mix(color, waterSkyGlint, fresnel * 0.65);
  #endif

  // apply atmospheric sky color blending and depth fog
  vec3 skyColor = pow(getSkyColor(v_worldPosition), vec3(2.2));
  vec4 fogColor = getFogColor(color, skyColor, length(v_viewPosition));
  color = fogColor.rgb;

  // convert final color back to gamma space for srgb monitors
  gl_FragColor = vec4(pow(color, vec3(1.0 / 2.2)), 1.0);
}
`;

