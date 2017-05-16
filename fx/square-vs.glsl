precision mediump float;

attribute vec4 a_position;
attribute vec2 a_texcoord;

uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;

varying vec2 v_texcoord;

void main() {
    vec4 model = u_world*a_position;
    gl_Position = u_projection*u_view*model;
    v_texcoord = a_texcoord;
}
