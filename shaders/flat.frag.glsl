#version 300 es
precision mediump float;

in vec3 a_color2;

out vec4 outColor;

void main() {

    outColor = vec4(a_color2, 1.0);

}