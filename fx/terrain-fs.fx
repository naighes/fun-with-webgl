// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

varying vec3 v_position;
varying vec2 v_texcoord;
varying vec3 v_normal;
varying vec4 v_weight;

uniform vec3 u_lightDirection;
uniform vec3 u_ambientLight;
uniform mat4 u_worldInverseTranspose;
uniform mat4 u_world;

uniform sampler2D u_sand_texture;
uniform sampler2D u_grass_texture;
uniform sampler2D u_rock_texture;
uniform sampler2D u_snow_texture;

void main() {
    // because v_normal is a varying it's interpolated
    // we it will not be a uint vector. Normalizing it
    // will make it a unit vector again
    vec3 normal = normalize(mat3(u_worldInverseTranspose)*v_normal);

    // calculate the location of this fragment (pixel)
    // in world coordinates
    vec3 position = vec3(u_world*vec4(v_position, 1.0));

    // calculate the vector from this pixels surface
    // to the light source
    vec3 surfaceToLight = normalize(u_lightDirection-position);

    // calculate the cosine of the angle of incidence
    float diffuseCoefficient = max(0.0, dot(normal, surfaceToLight));

    // calculate final color of the pixel, based on:
    // 1. the angle of incidence: brightness
    // 2. the color/intensities of the light
    // 3. the texture and texture coord
    vec4 surfaceColor = texture2D(u_sand_texture, v_texcoord)*v_weight.x+texture2D(u_grass_texture, v_texcoord)*v_weight.y+texture2D(u_rock_texture, v_texcoord)*v_weight.z+texture2D(u_snow_texture, v_texcoord)*v_weight.w;

    vec3 lightWeight = vec3(1.0); // TODO: move out from shader
    vec3 ambientCoefficient = vec3(0.15); // TODO: move out from shader
    vec3 ambient = ambientCoefficient*surfaceColor.rgb*lightWeight;
    vec3 diffuse = diffuseCoefficient*surfaceColor.rgb*lightWeight;

    gl_FragColor = vec4(ambient+diffuse, surfaceColor.a);
}

