precision mediump float;

varying vec4 v_reflection_map_sampling_pos;
varying vec4 v_refraction_map_sampling_pos;
varying vec2 v_bump_map_sampling_pos;
varying vec4 v_position;

uniform sampler2D u_reflection_texture;
uniform sampler2D u_refraction_texture;
uniform sampler2D u_waves_texture;
uniform vec3 u_camera_position;

void main() {
    float u_wave_height = 0.3; // TODO: do not hardcode
    float refl_x = v_reflection_map_sampling_pos.x/v_reflection_map_sampling_pos.w/2.0+0.5;
    float refl_y = v_reflection_map_sampling_pos.y/v_reflection_map_sampling_pos.w/2.0+0.5;

    vec2 projectedTexCoords = vec2(refl_x, refl_y);

    vec4 bumpColor = texture2D(u_waves_texture, v_bump_map_sampling_pos);
    vec2 perturbation = u_wave_height*(bumpColor.xy-0.5)*2.0;
    vec2 perturbatedTexCoords = projectedTexCoords+perturbation;
    vec4 reflectiveColor = texture2D(u_reflection_texture, perturbatedTexCoords);

    float refr_x = v_refraction_map_sampling_pos.x/v_refraction_map_sampling_pos.w/2.0+0.5;
    float refr_y = v_refraction_map_sampling_pos.y/v_refraction_map_sampling_pos.w/2.0+0.5;
    vec2 projectedRefrTexCoords = vec2(refr_x, refr_y);
    vec2 perturbatedRefrTexCoords = projectedRefrTexCoords+perturbation;
    vec4 refractiveColor = texture2D(u_refraction_texture, perturbatedRefrTexCoords);

    vec3 eyeVector = normalize(u_camera_position-v_position.xyz);
    vec3 normalVector = vec3(0.0, 1.0, 0.0);
    float fresnelTerm = dot(eyeVector, normalVector);
    vec4 combinedColor = mix(reflectiveColor, refractiveColor, fresnelTerm);

    vec4 dullColor = vec4(0.3, 0.3, 0.5, 1.0);

    gl_FragColor = mix(combinedColor, dullColor, 0.2);
}
