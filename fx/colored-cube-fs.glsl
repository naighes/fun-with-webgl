precision mediump float;

varying lowp vec4 v_color;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
    float light = dot(v_normal, surfaceToLightDirection);

    gl_FragColor = v_color;
    gl_FragColor.rgb *= light;
}
