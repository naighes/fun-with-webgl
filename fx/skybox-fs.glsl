precision mediump float;

uniform samplerCube skybox;
uniform bool u_enableReflectionClipping;

varying vec4 v_position;
varying float v_reflectionClipDist;

void main() {
    if (v_reflectionClipDist > 0.0 && u_enableReflectionClipping)
        discard;

    gl_FragColor = textureCube(skybox, v_position.xyz);
}
