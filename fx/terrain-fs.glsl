precision mediump float;

varying vec4 v_position;
varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec4 v_weight;

uniform vec3 u_lightPosition;
uniform vec3 u_ambientLight;
uniform mat4 u_worldInverseTranspose;
uniform mat4 u_world;
uniform bool u_enableRefractionClipping;

uniform sampler2D u_sand_texture;
uniform sampler2D u_grass_texture;
uniform sampler2D u_rock_texture;
uniform sampler2D u_snow_texture;

varying float v_refractionClipDist;

vec3 lightWeight = vec3(1.0); // TODO: move out from shader
vec3 ambientCoefficient = vec3(0.45); // TODO: move out from shader

vec4 calculateSurfaceColor(sampler2D sampler, vec2 texcoord, float weight) {
    vec4 t = texture2D(sampler, texcoord);

    return vec4(t.xyz*weight, t.w);
}

void main() {
    if (v_refractionClipDist > 0.0 && u_enableRefractionClipping)
        discard;

    vec3 worldNormal = normalize(mat3(u_worldInverseTranspose)*v_normal);
    vec4 model = u_world*v_position;

    vec3 surfaceToLight = normalize(u_lightPosition-model.xyz);
    float diffuseCoefficient = max(0.0, dot(worldNormal, surfaceToLight));

    vec4 sand = calculateSurfaceColor(u_sand_texture, v_texcoord, v_weight.x);
    vec4 grass = calculateSurfaceColor(u_grass_texture, v_texcoord, v_weight.y);
    vec4 rock = calculateSurfaceColor(u_rock_texture, v_texcoord, v_weight.z);
    vec4 snow = calculateSurfaceColor(u_snow_texture, v_texcoord, v_weight.w);

    vec4 surfaceColor = sand+grass+rock+snow;

    vec3 ambient = ambientCoefficient*surfaceColor.rgb*lightWeight;
    vec3 diffuse = diffuseCoefficient*surfaceColor.rgb*lightWeight;
    vec3 finalColor = ambient+diffuse;
    vec3 clamped = vec3(min(finalColor.x, 1.0), min(finalColor.y, 1.0), min(finalColor.z, 1.0));
    gl_FragColor = vec4(clamped, surfaceColor.a);
}

