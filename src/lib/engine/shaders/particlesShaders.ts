// vertex shader for instanced atmospheric glowing dust particles
export const particlesVertexShader = /* glsl */ `
attribute vec3 a_instancePos;
attribute vec3 a_instanceRands;

uniform float u_time;
uniform float u_scale;

varying vec2 v_uv;
varying vec3 v_instanceRands;
varying float v_dist;

void main() {
  // calculate organic drifting motion via trigonometric wave synthesis
  vec3 instancePos = a_instancePos;
  instancePos.x += sin(u_time * 0.4 + a_instanceRands.x * 6.28) * 40.0;
  instancePos.y += cos(u_time * 0.3 + a_instanceRands.y * 6.28) * 30.0;
  instancePos.z += sin(u_time * 0.2 + a_instanceRands.z * 6.28) * 40.0;

  float scale = u_scale * (a_instanceRands.x * 0.5 + 0.8);
  vec3 localPos = position * scale;

  vec4 mvPosition = modelViewMatrix * vec4(instancePos, 1.0);
  mvPosition.xyz += localPos;

  gl_Position = projectionMatrix * mvPosition;
  v_uv = uv;
  v_instanceRands = a_instanceRands;
  v_dist = -mvPosition.z;
}
`;

// fragment shader for soft glowing circular particle motes
export const particlesFragmentShader = /* glsl */ `
uniform vec3 u_color;
uniform float u_alpha;

varying vec2 v_uv;
varying vec3 v_instanceRands;
varying float v_dist;

void main() {
  float dist = length(v_uv - 0.5) * 2.0;
  if (dist > 1.0) discard;

  float alpha = smoothstep(1.0, 0.1, dist) * u_alpha * (0.4 + 0.6 * sin(v_instanceRands.x * 10.0));
  // depth fade near camera
  alpha *= smoothstep(50.0, 300.0, v_dist);

  gl_FragColor = vec4(u_color, alpha);
}
`;
