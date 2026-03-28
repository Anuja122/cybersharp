export class ShaderManager {
  private device: GPUDevice;
  private shaders: Map<string, GPUShaderModule> = new Map();

  constructor(device: GPUDevice) {
    this.device = device;
  }

  async loadShaders() {
    this.createShader('basic-vertex', basicVertexShader);
    this.createShader('basic-fragment', basicFragmentShader);
    this.createShader('lighting', lightingShader);
    this.createShader('post-process', postProcessShader);
  }

  private createShader(name: string, code: string) {
    const shader = this.device.createShaderModule({
      label: name,
      code,
    });
    this.shaders.set(name, shader);
  }

  getShader(name: string): GPUShaderModule {
    const shader = this.shaders.get(name);
    if (!shader) {
      throw new Error(`Shader not found: ${name}`);
    }
    return shader;
  }
}

const basicVertexShader = `
struct VertexInput {
  @location(0) position: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) worldPos: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
}

struct Uniforms {
  modelMatrix: mat4x4f,
  viewMatrix: mat4x4f,
  projectionMatrix: mat4x4f,
  normalMatrix: mat4x4f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;

  let worldPos = uniforms.modelMatrix * vec4f(input.position, 1.0);
  output.worldPos = worldPos.xyz;
  output.position = uniforms.projectionMatrix * uniforms.viewMatrix * worldPos;
  output.normal = normalize((uniforms.normalMatrix * vec4f(input.normal, 0.0)).xyz);
  output.uv = input.uv;

  return output;
}
`;

const basicFragmentShader = `
struct FragmentInput {
  @location(0) worldPos: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
}

struct FragmentOutput {
  @location(0) albedo: vec4f,
  @location(1) normal: vec4f,
  @location(2) emissive: vec4f,
}

struct Material {
  baseColor: vec4f,
  emissive: vec3f,
  metallic: f32,
  roughness: f32,
}

@group(1) @binding(0) var<uniform> material: Material;

@fragment
fn main(input: FragmentInput) -> FragmentOutput {
  var output: FragmentOutput;

  output.albedo = material.baseColor;
  output.normal = vec4f(input.normal * 0.5 + 0.5, 1.0);
  output.emissive = vec4f(material.emissive, 1.0);

  return output;
}
`;

const lightingShader = `
@fragment
fn main(@location(0) uv: vec2f) -> @location(0) vec4f {
  return vec4f(1.0, 0.0, 1.0, 1.0);
}
`;

const postProcessShader = `
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var output: VertexOutput;
  let x = f32((vertexIndex & 1u) << 1u);
  let y = f32((vertexIndex & 2u));
  output.position = vec4f(x * 2.0 - 1.0, 1.0 - y * 2.0, 0.0, 1.0);
  output.uv = vec2f(x, y);
  return output;
}

@group(0) @binding(0) var colorTexture: texture_2d<f32>;
@group(0) @binding(1) var colorSampler: sampler;

struct PostFXParams {
  time: f32,
  chromaticAberration: f32,
  vignette: f32,
  scanlines: f32,
  bloom: f32,
  grain: f32,
}

@group(0) @binding(2) var<uniform> params: PostFXParams;

fn hash(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(12.9898, 78.233))) * 43758.5453);
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  var uv = input.uv;

  let center = vec2f(0.5, 0.5);
  let offset = (uv - center) * params.chromaticAberration * 0.005;

  let r = textureSample(colorTexture, colorSampler, uv - offset).r;
  let g = textureSample(colorTexture, colorSampler, uv).g;
  let b = textureSample(colorTexture, colorSampler, uv + offset).b;

  var color = vec3f(r, g, b);

  let dist = distance(uv, center);
  let vignette = smoothstep(0.8, 0.2, dist * params.vignette);
  color *= vignette;

  let scanline = sin(uv.y * 800.0) * 0.02 * params.scanlines;
  color += scanline;

  let grain = (hash(uv + params.time) - 0.5) * params.grain * 0.05;
  color += grain;

  return vec4f(color, 1.0);
}
`;
