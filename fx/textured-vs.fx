// an attribute will receive data from a buffer
attribute vec4 a_position;
attribute vec2 a_texcoord;
uniform mat4 mvp;
varying vec2 v_texcoord;

// all shaders have a main function
void main() {
    // gl_Position is a special variable a vertex shader
    // is responsible for setting (clip space)

    gl_Position = mvp * a_position;
    v_texcoord = a_texcoord;
}

