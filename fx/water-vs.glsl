precision mediump float;

attribute vec4 a_position;
attribute vec2 a_texcoord;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;
uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_reflection_view;

uniform float u_time;

varying vec4 v_position;
varying vec4 v_reflection_map_sampling_pos;
varying vec4 v_refraction_map_sampling_pos;
varying vec2 v_bump_map_sampling_pos;

void main() {
    float wave_length = 0.1; // TODO: do not hardcode
    float wind_force = 0.002; // TODO: do not hardcode
    vec3 wind_direction = vec3(1.0, 0.0, 0.0); // TODO: do not hardcode
    vec4 model = u_world*a_position;
    v_position = model;

    gl_Position = u_projection*u_view*model;

    v_reflection_map_sampling_pos = u_projection*u_reflection_view*model;
    v_refraction_map_sampling_pos = u_projection*u_view*model;

    vec3 orth = cross(wind_direction, vec3(0.0, 1.0, 0.0));
    float y = dot(a_texcoord, wind_direction.xz);
    float x = dot(a_texcoord, orth.xz);
    vec2 move = vec2(x, y);
    move.y += u_time*wind_force;
    v_bump_map_sampling_pos = move/wave_length;
}
