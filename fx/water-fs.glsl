precision mediump float;

varying vec4 v_reflection_map_sampling_pos;
varying vec2 v_bump_map_sampling_pos;

uniform sampler2D u_reflection_texture;
uniform sampler2D u_waves_texture;

void main() {
    float u_wave_height = 0.3; // TODO: do not hardcode
    float x = v_reflection_map_sampling_pos.x/v_reflection_map_sampling_pos.w/2.0+0.5;
    float y = v_reflection_map_sampling_pos.y/v_reflection_map_sampling_pos.w/2.0+0.5;

    vec2 projectedTexCoords = vec2(x, y);

    vec4 bumpColor = texture2D(u_waves_texture, v_bump_map_sampling_pos);
    vec2 perturbation = u_wave_height*(bumpColor.xy-0.5)*2.0;
    vec2 perturbatedTexCoords = projectedTexCoords+perturbation;
    gl_FragColor = texture2D(u_reflection_texture, perturbatedTexCoords);
}
