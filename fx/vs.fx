// an attribute will receive data from a buffer
attribute vec4 a_position;
attribute vec4 a_color;

varying lowp vec4 vColor;

// all shaders have a main function
void main() {
    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = a_position;
    vColor = a_color;
}

