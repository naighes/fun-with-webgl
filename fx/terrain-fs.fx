// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

varying lowp vec4 v_color;
varying vec3 v_normal;

uniform vec3 u_reverseLightDirection;

void main() {
    // because v_normal is a varying it's interpolated
    // we it will not be a uint vector. Normalizing it
    // will make it a unit vector again
    vec3 normal = normalize(v_normal);
    float light = dot(normal, u_reverseLightDirection);

    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    gl_FragColor = v_color;

    // Lets multiply just the color portion (not the alpha)
    // by the light
    gl_FragColor.rgb *= light;
}

