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

// vertex shader for sky cloud billboards
export const cloudVertexShader = /* glsl */ `
varying vec2 v_uv;

void main() {
  v_uv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// fragment shader for realistic sky clouds with time of day dimming
export const cloudFragmentShader = /* glsl */ `
uniform sampler2D u_texture;
uniform float u_dimRatio;
uniform float u_opacity;
uniform vec3 u_tintDay;
uniform vec3 u_tintNight;

varying vec2 v_uv;

void main() {
  vec4 tex = texture2D(u_texture, v_uv);
  if (tex.a < 0.01) discard;

  // interpolate cloud color from crisp white to deep twilight indigo
  vec3 tint = mix(u_tintDay, u_tintNight, clamp(u_dimRatio, 0.0, 1.0));
  vec3 rgb = tex.rgb * tint;
  float alpha = tex.a * u_opacity * mix(1.0, 0.5, u_dimRatio);

  gl_FragColor = vec4(rgb, alpha);
}
`;


// vertex shader for valley cloud billboard planes
export const valleyCloudVertexShader = /* glsl */ `
varying vec2 v_uv;

void main() {
  v_uv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// fragment shader for valley clouds with scroll progress reveal and daylight dimming
export const valleyCloudFragmentShader = /* glsl */ `
uniform sampler2D u_texture;
uniform float u_scrollAlpha;
uniform float u_dimRatio;
uniform float u_opacity;
uniform vec3 u_tintDay;
uniform vec3 u_tintNight;

varying vec2 v_uv;

void main() {
  vec4 tex = texture2D(u_texture, v_uv);
  if (tex.a < 0.005) discard;

  // interpolate cloud color from soft alpine mist to deep twilight
  vec3 tint = mix(u_tintDay, u_tintNight, clamp(u_dimRatio, 0.0, 1.0));
  vec3 rgb = tex.rgb * tint;
  float alpha = tex.a * u_opacity * u_scrollAlpha;

  gl_FragColor = vec4(rgb, alpha);
}
`;

