precision mediump float;

varying lowp vec4 v_color;

uniform vec3 u_reverseLightDirection;

void main() {
    gl_FragColor = v_color;
}
