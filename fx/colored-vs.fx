// an attribute will receive data from a buffer
attribute vec4 a_position;
attribute vec4 a_color;
uniform mat4 mvp;
varying lowp vec4 vColor;

// all shaders have a main function
void main() {
    // gl_Position is a special variable a vertex shader
    // is responsible for setting (clip space)

    gl_Position = mvp * a_position;
    vColor = a_color;
}

