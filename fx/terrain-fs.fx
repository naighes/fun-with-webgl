// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

varying vec3 v_position;
varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec4 v_weight;

uniform vec3 u_lightPosition;
uniform vec3 u_ambientLight;
uniform mat4 u_worldInverseTranspose;
uniform mat4 u_world;

uniform sampler2D u_sand_texture;
uniform sampler2D u_grass_texture;
uniform sampler2D u_rock_texture;
uniform sampler2D u_snow_texture;

varying float v_clipDist;

vec3 lightWeight = vec3(1.0); // TODO: move out from shader
vec3 ambientCoefficient = vec3(0.45); // TODO: move out from shader

vec3 worldSpaceNormal(mat4 worldInverseTranspose, vec3 normal) {
    return normalize(mat3(worldInverseTranspose)*normal);
}

vec3 worldSpacePosition(mat4 world, vec3 position) {
    return vec3(world*vec4(position, 1.0));
}

vec3 calculateSurfaceToLight(vec3 lightPosition, vec3 position) {
    return normalize(lightPosition-position);
}

float calculateDiffuseCoefficient(vec3 lightPosition, vec3 worldPosition, vec3 worldNormal) {
    // calculate the vector from this pixels surface
    // to the light source
    vec3 surfaceToLight = calculateSurfaceToLight(lightPosition, worldPosition);

    return max(0.0, dot(worldNormal, surfaceToLight));
}

vec4 calculateSurfaceColor(sampler2D sampler, vec2 texcoord, float weight) {
    vec4 t = texture2D(sampler, texcoord);

    return vec4(t.xyz*weight, t.w);
}

void main() {
    // Reject fragments behind the clip plane
    //if (v_clipDist < 0.0)
    //    discard;

    // because v_normal is a varying it's interpolated
    // we it will not be a uint vector. Normalizing it
    // will make it a unit vector again
    vec3 worldNormal = worldSpaceNormal(u_worldInverseTranspose, v_normal);

    // calculate the location of this fragment (pixel)
    // in world coordinates
    vec3 worldPosition = worldSpacePosition(u_world, v_position);

    // calculate the cosine of the angle of incidence
    float diffuseCoefficient = calculateDiffuseCoefficient(u_lightPosition, worldPosition, worldNormal);

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

