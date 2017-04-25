// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

varying vec2 v_texcoord;
varying vec3 v_normal;

uniform vec3 u_reverseLightDirection;
uniform vec3 u_ambientLight;

uniform sampler2D u_texture;

void main() {
    // because v_normal is a varying it's interpolated
    // we it will not be a uint vector. Normalizing it
    // will make it a unit vector again
    vec3 normal = normalize(v_normal);
    float light = dot(normal, u_reverseLightDirection);

    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    gl_FragColor = texture2D(u_texture, v_texcoord);

    // Lets multiply just the color portion (not the alpha)
    // by the light
    gl_FragColor.rgb *= (light+u_ambientLight);
}

