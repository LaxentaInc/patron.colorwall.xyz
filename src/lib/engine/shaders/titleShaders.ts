// vertex shader for title outline stroke extrusion
export const titleOutlineVertexShader = /* glsl */ `
attribute vec3 OP;
attribute float curveu;
attribute float perimeter;
attribute float radius;
attribute float id;

uniform float u_thickness;
uniform float u_showRatio;

varying float v_curveu;
varying float v_perimeter;
varying float v_radius;
varying vec2 v_pos2;
varying float v_showRatio;

vec4 hash42(vec2 p) {
  vec4 p4 = fract(vec4(p.xyxy) * vec4(0.1031, 0.1030, 0.0973, 0.1099));
  p4 += dot(p4, p4.wzxy + 33.33);
  return fract((p4.xxyz + p4.yzzw) * p4.zywx);
}

float linearStep(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {
  vec3 pos = mix(OP, position, max(0.2, u_thickness));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  v_curveu = curveu;
  v_perimeter = perimeter;
  v_radius = radius;
  v_pos2 = pos.xy;

  vec4 rands = hash42(vec2(id * 10.0, 20.0));
  v_showRatio = linearStep(0.0, 0.7, u_showRatio - rands.x * 0.3);
}
`;

// fragment shader for procedural glowing outline drawing and fade
export const titleOutlineFragmentShader = /* glsl */ `
uniform float u_time;
uniform float u_showRatio;
uniform float u_hideRatio;
uniform vec3 u_glowColor;

varying float v_curveu;
varying float v_perimeter;
varying float v_radius;
varying vec2 v_pos2;
varying float v_showRatio;

float exponentialOut(float t) {
  return t == 1.0 ? t : 1.0 - pow(2.0, -3.0 * t);
}

void main() {
  float radiusAlpha = 1.0 - v_radius;
  float easedShowRatio = exponentialOut(v_showRatio);
  float t = -fract(v_curveu - v_showRatio * 0.2 + 0.15) + easedShowRatio;
  float alpha = max(v_showRatio, step(0.0, t));
  alpha *= (1.0 - u_hideRatio);

  // pulsing light traveling along stroke perimeters
  float travel = mod(u_time * 0.5 - v_curveu * 2.0, 1.0);
  float pulse = smoothstep(0.0, 0.1, travel) * smoothstep(0.4, 0.1, travel);

  vec3 color = mix(vec3(1.0), u_glowColor, 0.3) + pulse * 0.4;
  gl_FragColor = vec4(color, alpha * radiusAlpha * u_showRatio);
}
`;

// vertex shader for solid title face fill
export const titleFillVertexShader = /* glsl */ `
uniform float u_endRatio;
varying vec2 v_pos2;
varying float v_shade;
varying vec3 v_normal;

void main() {
  vec3 pos = position;
  pos.z *= max(0.1, u_endRatio);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  v_pos2 = position.xy;

  vec3 viewNormal = normalize(normalMatrix * normal);
  v_normal = viewNormal;
  float d = dot(normal, normalize(vec3(-0.5, 0.8, 0.5)));
  v_shade = normal.z > 0.5 ? 1.0 : (d * 0.35 + 0.65);
}
`;

// fragment shader for solid title face reveal and gold/white gradient
export const titleFillFragmentShader = /* glsl */ `
uniform float u_showRatio;
uniform float u_time;
uniform vec3 u_tintColor;

varying vec2 v_pos2;
varying float v_shade;
varying vec3 v_normal;

void main() {
  float d = v_pos2.y * 0.5 + v_pos2.x * 0.2;
  float alpha = smoothstep(d - 1.5, d + 0.2, mix(-1.8, 1.2, u_showRatio));

  // elegant gradient from bright clean white down to warm gold/amber
  vec3 faceColor = mix(vec3(1.0, 0.98, 0.95), u_tintColor, smoothstep(0.5, -0.5, v_pos2.y));
  vec3 finalColor = faceColor * v_shade;

  gl_FragColor = vec4(finalColor, alpha);
}
`;

// vertex shader for planar title billboards projected in camera space
export const titlePlaneVertexShader = /* glsl */ `
varying vec2 v_uv;

void main() {
  v_uv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// fragment shader for solid title face fill with metallic gradient and wipe reveal
export const titleFillPlaneFragmentShader = /* glsl */ `
uniform sampler2D u_texture;
uniform float u_showRatio;
uniform float u_hideRatio;
uniform float u_time;
uniform vec3 u_tintColor;

varying vec2 v_uv;

float exponentialOut(float t) {
  return t == 1.0 ? t : 1.0 - pow(2.0, -3.0 * t);
}

void main() {
  vec4 tex = texture2D(u_texture, v_uv);
  if (tex.a < 0.002) discard;

  // progressive left to right reveal wipe driven by scene boot time
  float d = v_uv.x * 0.75 + v_uv.y * 0.25;
  float easedShow = exponentialOut(clamp(u_showRatio, 0.0, 1.0));
  float reveal = smoothstep(d - 0.2, d + 0.05, mix(-0.2, 1.2, easedShow));

  // scroll hide dissolve driven by camera descent into valley
  float fade = 1.0 - clamp(u_hideRatio, 0.0, 1.0);

  // subtle animated shimmer across metallic letter surfaces
  float shimmer = 1.0 + 0.05 * sin(u_time * 2.0 - v_uv.x * 6.0);

  vec3 rgb = tex.rgb * shimmer;
  float alpha = tex.a * reveal * fade;

  gl_FragColor = vec4(rgb, alpha);
}
`;

// fragment shader for additive glowing outline wireframe
export const titleOutlinePlaneFragmentShader = /* glsl */ `
uniform sampler2D u_texture;
uniform float u_showRatio;
uniform float u_hideRatio;
uniform float u_time;
uniform vec3 u_glowColor;

varying vec2 v_uv;

float exponentialOut(float t) {
  return t == 1.0 ? t : 1.0 - pow(2.0, -3.0 * t);
}

void main() {
  vec4 tex = texture2D(u_texture, v_uv);
  if (tex.a < 0.002) discard;

  // progressive left to right reveal wipe driven by scene boot time
  float d = v_uv.x * 0.75 + v_uv.y * 0.25;
  float easedShow = exponentialOut(clamp(u_showRatio, 0.0, 1.0));
  float reveal = smoothstep(d - 0.2, d + 0.05, mix(-0.2, 1.2, easedShow));

  // scroll hide dissolve driven by camera descent into valley
  float fade = 1.0 - clamp(u_hideRatio, 0.0, 1.0);

  // luminous pulse traveling across letter perimeter glow
  float pulse = 0.85 + 0.25 * sin(u_time * 3.0 - v_uv.x * 8.0);

  vec3 rgb = tex.rgb * pulse;
  float alpha = tex.a * reveal * fade;

  gl_FragColor = vec4(rgb, alpha);
}
`;
