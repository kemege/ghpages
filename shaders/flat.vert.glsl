#version 300 es
precision mediump float;

in vec3 a_position;
in vec3 a_normal;
in vec3 a_color;
uniform mat4 u_mvp_matrix;
out vec3 a_color2;

void main() {
    gl_Position = u_mvp_matrix * vec4(a_position, 1.0);
    a_color2 = a_color;
}