precision mediump float;

varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;

uniform sampler2D u_texture;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
    float light = dot(v_normal, surfaceToLightDirection);
    gl_FragColor = texture2D(u_texture, v_texcoord);
    gl_FragColor.rgb *= light;
}
