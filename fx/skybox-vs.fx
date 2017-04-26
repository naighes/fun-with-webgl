uniform mat4 u_view;
uniform mat4 u_viewInverse;
uniform mat4 u_projection;

attribute vec4 a_position;

varying vec4 v_position;

void main() {
    v_position = a_position;
    gl_Position = u_projection*u_view*a_position;
}

