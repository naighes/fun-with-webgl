precision mediump float;

attribute vec4 a_position;
attribute vec2 a_texcoord;
attribute vec3 a_normal;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;
uniform mat4 u_worldInverseTranspose;
uniform vec3 u_lightWorldPosition;

varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;

void main() {
    gl_Position = u_worldViewProjection*a_position;
    vec3 surfaceWorldPosition = (u_world*a_position).xyz;
    v_surfaceToLight = u_lightWorldPosition-surfaceWorldPosition;
    v_texcoord = a_texcoord;
    v_normal = mat3(u_worldInverseTranspose)*a_normal;
}
