uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
uniform vec3 sunDirection;

varying vec3 vNormal;
varying vec2 vUv;

void main(){
    vec3 dayColor = texture2D(dayTexture, vUv).rgb;
    vec3 nightColor = texture2D(nightTexture, vUv).rgb;

    float consineAngleSunToNormal = dot(normalize(vNormal), sunDirection);

    consineAngleSunToNormal = clamp( consineAngleSunToNormal * 10.0, -1.0, 1.0);

    float mixAmount = consineAngleSunToNormal * 0.5 + 0.5;

    vec3  color = mix( nightColor, dayColor, mixAmount );

    gl_FragColor = vec4( color, 1.);
}
