#version 300 es
precision mediump float;

in vec3 a_position;
in vec3 a_normal;
in vec3 a_color; // diffuse color

uniform mat4 u_mv_matrix;
uniform mat4 u_p_matrix;
uniform mat4 u_normal_matrix;

// Reflection coefficient for ambient, diffuse and specular
uniform float Ka;
uniform float Kd;
uniform float Ks;
// Material color for ambient
uniform vec3 aColor;
// Point light sources, support up to 16 sources
uniform vec3 plPosition[16];
uniform float plIntensity[16];
uniform vec3 plColor[16];
// Directional light sources, support up to 16 sources
uniform vec3 dlDirection[16];
uniform float dlIntensity[16];
uniform vec3 dlColor[16];
// Shininess for specular
uniform float shininess;

out vec3 a_color2; // Transfer color to fragment shader

void main() {
    // Calculate vertex position
    vec4 mvPosition = u_mv_matrix * vec4(a_position, 1.0);
    vec3 vPosition = vec3(mvPosition) / mvPosition.w;
    gl_Position = u_p_matrix * mvPosition; // Define vertex position

    vec3 vNormal = normalize((u_normal_matrix * vec4(a_normal, 0.0)).xyz);
    vec3 dColor = a_color; // diffuse color

    // Calculate vertex color
    int i;
    float specularAmount = 0.0;
    float lambert;
    float totalLambert = 0.0;
    vec3 specularColor = vec3(0.0, 0.0, 0.0);
    vec3 reflected; // reflected light direction
    float specAngle; // specular angle
    vec3 direction = vec3(0, 0, 0);
    float validSources = 0.0;
    for (i = 0; i < 16; i++) {
        validSources = validSources + 1.0;
        // point light sources
        if (plIntensity[i] > 0.0) {
            direction = normalize(plPosition[i] - vPosition);
            float decay = 1.0 / pow(length(plPosition[i] - vPosition), 2.0);
            lambert = max(dot(vNormal, direction), 0.0);
            totalLambert = totalLambert + lambert;

            if (lambert > 0.0) {
                vec3 reflected = reflect(-direction, vNormal);
                float specAngle = max(dot(reflected, normalize(-vPosition)), 0.0);
                specularColor = specularColor + decay * plColor[i] * plIntensity[i] * pow(specAngle, shininess);
                specularAmount = specularAmount + plIntensity[i] * pow(specAngle, shininess);
            }

        }

        // directional light sources
        if (dlIntensity[i] > 0.0) {
            direction = normalize(dlDirection[i]);
            lambert = max(dot(vNormal, direction), 0.0);
            totalLambert = totalLambert + lambert;

            if (lambert > 0.0) {
                vec3 reflected = reflect(-direction, vNormal);
                float specAngle = max(dot(reflected, normalize(-vPosition)), 0.0);
                specularColor = specularColor + dlColor[i] * dlIntensity[i] * pow(specAngle, shininess);
                specularAmount = specularAmount + dlIntensity[i] * pow(specAngle, shininess);
            }
        }
    }

    a_color2 = Ka * aColor + Kd * totalLambert * dColor + Ks * specularColor;
}