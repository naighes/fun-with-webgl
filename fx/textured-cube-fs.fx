// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;

uniform sampler2D u_texture;

void main() {
    vec3 normal = normalize(v_normal);

    vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
    float light = dot(v_normal, surfaceToLightDirection);

    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    gl_FragColor = texture2D(u_texture, v_texcoord);
    gl_FragColor.rgb *= light;
}

