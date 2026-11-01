// vertex shader for gpu skeletal bird animation with data texture bone lookup
export const birdVertexShader = /* glsl */ `
attribute vec2 boneIndices;
attribute vec2 boneWeights;
attribute float Cd;

uniform sampler2D u_positionTexture;
uniform sampler2D u_orientTexture;
uniform float u_boneCount;
uniform float u_animationFrameCount;
uniform float u_animationFrame;

varying vec3 v_viewPosition;
varying vec3 v_viewNormal;
varying float v_ao;
varying vec2 v_uv;

// quaternion vector rotation utility
vec3 qrotate(vec4 q, vec3 v) {
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

// samples bone position and orientation from data textures and blends influence
void applyAnimation(inout vec3 pos, inout vec3 nor, in float frame) {
  // first bone influence
  vec2 uv0 = vec2(boneIndices[0] + 0.5, frame + 0.5) / vec2(u_boneCount, u_animationFrameCount);
  vec4 tmpOrient0 = texture2D(u_orientTexture, uv0);
  vec3 tmpPos0 = texture2D(u_positionTexture, uv0).xyz;
  pos += (qrotate(tmpOrient0, position) + tmpPos0) * boneWeights[0];
  nor += (qrotate(tmpOrient0, normal)) * boneWeights[0];

  // second bone influence
  vec2 uv1 = vec2(boneIndices[1] + 0.5, frame + 0.5) / vec2(u_boneCount, u_animationFrameCount);
  vec4 tmpOrient1 = texture2D(u_orientTexture, uv1);
  vec3 tmpPos1 = texture2D(u_positionTexture, uv1).xyz;
  pos += (qrotate(tmpOrient1, position) + tmpPos1) * boneWeights[1];
  nor += (qrotate(tmpOrient1, normal)) * boneWeights[1];

  nor = normalize(nor);
}

void main() {
  vec3 pos0 = vec3(0.0);
  vec3 nor0 = vec3(0.0);
  vec3 pos1 = vec3(0.0);
  vec3 nor1 = vec3(0.0);

  // blend between adjacent frames for silky smooth sub-frame interpolation
  float frame0 = floor(mod(u_animationFrame, u_animationFrameCount));
  float frame1 = floor(mod(u_animationFrame + 1.0, u_animationFrameCount));
  float frameRatio = fract(u_animationFrame);

  applyAnimation(pos0, nor0, frame0);
  applyAnimation(pos1, nor1, frame1);

  vec3 pos = mix(pos0, pos1, frameRatio);
  vec3 nor = normalize(mix(nor0, nor1, frameRatio));

  vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
  v_viewPosition = -viewPosition.xyz;
  gl_Position = projectionMatrix * viewPosition;

  v_viewNormal = normalMatrix * nor;
  v_ao = Cd;
  v_uv = uv;
}
`;

// fragment shader for bird feather texturing, specular highlights, and ambient occlusion
export const birdFragmentShader = /* glsl */ `
uniform sampler2D u_texture;

varying vec3 v_viewPosition;
varying vec3 v_viewNormal;
varying float v_ao;
varying vec2 v_uv;

void main() {
  vec3 N = normalize(v_viewNormal);
  vec3 V = normalize(v_viewPosition);

  // directional light matching mountain atmosphere
  vec3 lightDir = normalize(vec3(0.4, 0.9, 0.5));
  float diff = max(dot(N, lightDir), 0.0) * 0.5 + 0.5;

  float NdV = clamp(abs(dot(N, V)), 0.001, 1.0);
  float fresnel = pow(1.0 - NdV, 3.0) * 0.4;

  vec4 tex = texture2D(u_texture, v_uv);
  if (tex.a < 0.1) discard;

  vec3 baseColor = pow(tex.rgb, vec3(2.2));
  vec3 finalColor = baseColor * diff * v_ao + fresnel * vec3(0.9, 0.95, 1.0) * v_ao;

  gl_FragColor = vec4(pow(finalColor, vec3(1.0 / 2.2)), tex.a);
}
`;
