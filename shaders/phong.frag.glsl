#version 300 es
precision mediump float;

in vec3 vNormal;
in vec3 vPosition;
in vec3 dColor;

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

out vec4 fragColor;


void main() {
    vec3 N = normalize(vNormal);
    vec3 finalColor = Ka * aColor;

    for (int i = 0; i < 16; i++) {
        if (plIntensity[i] > 0.0) {
            vec3 L = normalize(plPosition[i] - vPosition);
            float decay = 1.0 / pow(length(plPosition[i] - vPosition), 2.0);
            // Lambert's cosine law
            float lambertian = max(dot(N, L), 0.0);
            float specular = 0.0;
            if (lambertian > 0.0) {
                vec3 R = reflect(-L, N);      // Reflected light vector
                vec3 V = normalize(-vPosition); // Vector to viewer
                // Compute the specular term
                float specAngle = max(dot(R, V), 0.0);
                specular = pow(specAngle, shininess);
            }
            finalColor += (Kd * lambertian * dColor + decay * Ks * plIntensity[i] * specular * plColor[i]);
        }

        if (dlIntensity[i] > 0.0) {
            vec3 L = normalize(-dlDirection[i]);

            // Lambert's cosine law
            float lambertian = max(dot(N, L), 0.0);
            float specular = 0.0;
            if (lambertian > 0.0) {
                vec3 R = reflect(-L, N);      // Reflected light vector
                vec3 V = normalize(-vPosition); // Vector to viewer
                // Compute the specular term
                float specAngle = max(dot(R, V), 0.0);
                specular = pow(specAngle, shininess);
            }
            finalColor += Kd * lambertian * dColor + Ks * dlIntensity[i] * specular * dlColor[i];
        }
    }
    fragColor = vec4(finalColor, 1.0);
}
