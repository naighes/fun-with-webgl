// an attribute will receive data from a buffer
attribute vec4 a_position;
attribute vec2 a_texcoord;
attribute vec3 a_normal;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;
uniform mat4 u_worldInverseTranspose;

varying vec2 v_texcoord;
varying vec3 v_normal;

// all shaders have a main function
void main() {
    // gl_Position is a special variable a vertex shader
    // is responsible for setting (clip space)
    gl_Position = u_worldViewProjection * a_position;

    v_texcoord = a_texcoord;

    // Pass the normal to the fragment shader
    v_normal = a_normal;
}

