precision mediump float;

uniform mat4 u_view;
uniform mat4 u_world;
uniform mat4 u_viewInverse;
uniform mat4 u_projection;

attribute vec4 a_position;

varying vec4 v_position;

void main() {
    vec4 model = u_world*a_position;

    v_position = a_position;
    mat4 view = u_view;
    gl_Position = u_projection*view*model;
}
