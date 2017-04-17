// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

varying lowp vec4 v_color;
varying vec3 v_normal;

uniform vec3 u_reverseLightDirection;

void main() {
    vec3 normal = normalize(v_normal);
    float light = dot(normal, u_reverseLightDirection);

    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    gl_FragColor = v_color;
    gl_FragColor.rgb *= light;
}

