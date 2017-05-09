precision mediump float;

attribute vec4 a_position;
attribute vec2 a_texcoord;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_reflection_view;

varying vec4 v_position;
varying vec4 v_reflection_map_sampling_pos;

void main() {
    vec4 model = u_world*a_position;
    gl_Position = u_projection*u_view*model;
    v_reflection_map_sampling_pos = u_projection*u_reflection_view*model;
}
