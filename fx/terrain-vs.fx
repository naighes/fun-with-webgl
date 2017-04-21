// an attribute will receive data from a buffer
attribute vec4 a_position;
attribute vec4 a_color;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;
uniform mat4 u_worldInverseTranspose;

varying lowp vec4 v_color;

// all shaders have a main function
void main() {
    // gl_Position is a special variable a vertex shader
    // is responsible for setting (clip space)
    gl_Position = u_worldViewProjection * a_position;

    v_color = a_color;
}

