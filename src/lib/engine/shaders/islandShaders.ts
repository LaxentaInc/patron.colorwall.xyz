// vertex shader for scene 2 floating shattered island monoliths
export const islandVertexShader = /* glsl */ `
varying vec3 v_modelPosition;
varying vec3 v_worldPosition;
varying vec3 v_viewPosition;
varying vec3 v_viewNormal;

void main() {
  vec3 transformedPos = position;
  // slight geometric taper along height for floating shattered monolith silhouette
  transformedPos.z *= mix(1.0, 0.9, max(0.0, (transformedPos.y - 3.0) / 20.0));

  vec4 viewPos = modelViewMatrix * vec4(transformedPos, 1.0);
  gl_Position = projectionMatrix * viewPos;

  v_modelPosition = position;
  v_worldPosition = (modelMatrix * vec4(transformedPos, 1.0)).xyz;
  v_viewPosition = -viewPos.xyz;
  v_viewNormal = normalize(normalMatrix * normal);
}
`;

// fragment shader for scene 2 floating islands with dual flow mapping and energy veins
export const islandFragmentShader = /* glsl */ `
uniform sampler2D u_texturePrev;
uniform sampler2D u_texture;
uniform sampler2D u_textureNext;
uniform sampler2D u_flowTexture;
uniform sampler2D u_trailMaskTexture;
uniform vec3 u_trailMaskMixer;
uniform float u_flowStrength;
uniform float u_flowTime;
uniform vec2 u_size;
uniform float u_tileIndex;
uniform vec3 u_skyColor0;
uniform vec3 u_skyColor1;
uniform float u_fogNear;
uniform float u_fogFar;

varying vec3 v_modelPosition;
varying vec3 v_worldPosition;
varying vec3 v_viewPosition;
varying vec3 v_viewNormal;

// dual-phase flow uv mapping helper
vec3 flowUvw(vec2 uv, vec2 flowVector, float time, float phaseOffset) {
  float progress = fract(time + phaseOffset);
  vec3 uvw;
  uvw.xy = uv - flowVector * progress;
  uvw.z = 1.0 - abs(1.0 - 2.0 * progress);
  return uvw;
}

vec3 getSkyColor(vec3 worldPos) {
  float h = clamp(normalize(worldPos).y * 0.5 + 0.5, 0.0, 1.0);
  float t = smoothstep(0.1, 0.85, h);
  return mix(u_skyColor0, u_skyColor1, t);
}

vec4 getFogColor(vec3 col, vec3 sky, float viewZ) {
  float fogFactor = clamp((viewZ - u_fogNear) / (u_fogFar - u_fogNear), 0.0, 1.0);
  return vec4(mix(col, sky, fogFactor), 1.0);
}

void main() {
  vec2 fullUv = (v_modelPosition.zx) / u_size;
  fullUv += 0.5;

  // calculate local directional flow vectors from flow map texture
  vec2 flowVector = clamp((texture2D(u_flowTexture, fullUv).rg * 255.0 - 128.0) / 127.0, -1.0, 1.0);
  vec3 uvwA = flowUvw(fullUv, flowVector / u_flowStrength, u_flowTime, 0.0);
  vec3 uvwB = flowUvw(fullUv, flowVector / u_flowStrength, u_flowTime, 0.5);

  uvwA.y *= 6.0;
  uvwA.y -= (5.0 - u_tileIndex);
  uvwB.y *= 6.0;
  uvwB.y -= (5.0 - u_tileIndex);

  // sample adjacent tile textures for seamless boundary transitions
  vec4 texA = uvwA.y > 1.0
    ? texture2D(u_texturePrev, uvwA.xy - vec2(0.0, 1.0))
    : uvwA.y >= 0.0
    ? texture2D(u_texture, uvwA.xy)
    : texture2D(u_textureNext, uvwA.xy + vec2(0.0, 1.0));

  vec4 texB = uvwB.y > 1.0
    ? texture2D(u_texturePrev, uvwB.xy - vec2(0.0, 1.0))
    : uvwB.y >= 0.0
    ? texture2D(u_texture, uvwB.xy)
    : texture2D(u_textureNext, uvwB.xy + vec2(0.0, 1.0));

  vec3 color = (texA.rgb * uvwA.z + texB.rgb * uvwB.z);
  float luma = dot(color, vec3(0.299, 0.587, 0.114));

  // compute additive chromatic energy trails along surface crevices
  float trail = dot(u_trailMaskMixer, texture2D(u_trailMaskTexture, fullUv).rgb);
  float maxTrail = max(u_trailMaskMixer.r, max(u_trailMaskMixer.g, u_trailMaskMixer.b));
  vec3 saturatedColor = mix(vec3(luma), color, 1.35);

  color = mix(
    color,
    color * 0.2 + (saturatedColor * trail) * mix(0.8, 3.0, clamp(v_modelPosition.y / 20.0, 0.0, 1.0)),
    maxTrail
  );
  color = clamp(color, 0.0, 1.0);

  // atmospheric depth fog blending
  vec3 skyColor = pow(getSkyColor(v_worldPosition), vec3(2.2));
  vec4 fogColor = getFogColor(pow(color, vec3(2.2)), skyColor, length(v_viewPosition));
  color = fogColor.rgb;

  // convert back to srgb gamma space
  gl_FragColor = vec4(pow(color, vec3(1.0 / 2.2)), 1.0);
}
`;

