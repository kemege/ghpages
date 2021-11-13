#version 300 es
precision mediump float;

in vec3 a_position;
in vec3 a_normal;
in vec3 a_color;

uniform mat4 u_mv_matrix;
uniform mat4 u_p_matrix;
uniform mat4 u_normal_matrix;

out vec3 vNormal;
out vec3 vPosition;
out vec3 dColor;

void main() {
    // Calculate vertex position
    vec4 mvPosition = u_mv_matrix * vec4(a_position, 1.0);
    vPosition = vec3(mvPosition) / mvPosition.w;
    vNormal = (u_normal_matrix * vec4(a_normal, 0.0)).xyz;
    gl_Position = u_p_matrix * mvPosition; // Define vertex position
    dColor = a_color;
}
