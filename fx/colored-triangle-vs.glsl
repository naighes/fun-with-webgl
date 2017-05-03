precision mediump float;

attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;

varying lowp vec4 v_color;

void main() {
    gl_Position = u_worldViewProjection*a_position;
    v_color = a_color;
}
