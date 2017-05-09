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
varying vec4 v_refraction_map_sampling_pos;
varying vec2 v_bump_map_sampling_pos;

void main() {
    float u_wave_length = 0.1; // TODO: do not hardcode
    vec4 model = u_world*a_position;
    gl_Position = u_projection*u_view*model;
    v_reflection_map_sampling_pos = u_projection*u_reflection_view*model;
    v_refraction_map_sampling_pos = u_projection*u_view*model;
    v_bump_map_sampling_pos = a_texcoord/u_wave_length;
    v_position = model;
}
