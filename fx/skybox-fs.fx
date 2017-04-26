precision mediump float;

varying vec4 v_position;

uniform samplerCube skybox;

void main() {
    gl_FragColor = textureCube(skybox, v_position.xyz);
}

