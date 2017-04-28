// an attribute will receive data from a buffer
attribute vec3 a_position;
attribute vec2 a_texcoord;
attribute vec3 a_normal;
attribute vec4 a_weight;

uniform mat4 u_worldViewProjection;

varying vec3 v_position;
varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec4 v_weight;

// all shaders have a main function
void main() {
    // gl_Position is a special variable a vertex shader
    // is responsible for setting (clip space)
    gl_Position = u_worldViewProjection*vec4(a_position, 1.0);

    v_position = a_position;
    v_texcoord = a_texcoord;
    v_normal = a_normal;
    v_weight = a_weight;
}

