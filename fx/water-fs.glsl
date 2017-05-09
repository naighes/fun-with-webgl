precision mediump float;

varying vec4 v_reflection_map_sampling_pos;

uniform sampler2D u_texture;

void main() {
    float x = v_reflection_map_sampling_pos.x/v_reflection_map_sampling_pos.w/2.0+0.5;
    float y = v_reflection_map_sampling_pos.y/v_reflection_map_sampling_pos.w/2.0+0.5;

    vec2 projectedTexCoords = vec2(x, y);

    gl_FragColor = texture2D(u_texture, projectedTexCoords);
}
