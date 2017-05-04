precision mediump float;

attribute vec4 a_position;
attribute vec2 a_texcoord;
attribute vec3 a_normal;
attribute vec4 a_weight;

uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform vec4 u_refractionClipPlane;
uniform vec4 u_reflectionClipPlane;

varying vec4 v_position;
varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec4 v_weight;
varying float v_refractionClipDist;
varying float v_reflectionClipDist;

void main() {
    vec4 model = u_world*a_position;
    v_refractionClipDist = dot(model, u_refractionClipPlane);
    v_reflectionClipDist = dot(model, u_reflectionClipPlane);

    gl_Position = u_projection*u_view*model;

    v_position = a_position;
    v_texcoord = a_texcoord;
    v_normal = a_normal;
    v_weight = a_weight;
}

