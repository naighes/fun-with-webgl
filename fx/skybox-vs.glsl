precision mediump float;

uniform mat4 u_view;
uniform mat4 u_reflection_view;
uniform mat4 u_world;
uniform mat4 u_viewInverse;
uniform mat4 u_projection;
uniform vec4 u_reflectionClipPlane;
uniform bool u_enableReflectionClipping;

attribute vec4 a_position;

varying vec4 v_position;
varying float v_reflectionClipDist;

void main() {
    vec4 model = u_world*a_position;
    v_reflectionClipDist = dot(model, u_reflectionClipPlane);

    v_position = a_position;
    mat4 view = u_view;

    if (u_enableReflectionClipping) {
        view = u_reflection_view;
    }

    gl_Position = u_projection*view*model;
}
