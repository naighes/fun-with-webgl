// an attribute will receive data from a buffer
attribute vec4 a_position;
attribute vec3 a_normal;

uniform mat4 u_worldViewProjection;
uniform mat4 u_world;
uniform mat4 u_worldInverseTranspose;
uniform vec3 u_lightWorldPosition;

varying vec3 v_normal;
varying vec3 v_surfaceToLight;

// all shaders have a main function
void main() {
    // compute the world position of the surfoace
    vec3 surfaceWorldPosition = (u_world * a_position).xyz;

    // compute the vector of the surface to the light
    // and pass it to the fragment shader
    v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;

    // gl_Position is a special variable a vertex shader
    // is responsible for setting (clip space)
    gl_Position = u_worldViewProjection * a_position;

    // orient the normals and pass to the fragment shader
    v_normal = mat3(u_worldInverseTranspose) * a_normal;
}

