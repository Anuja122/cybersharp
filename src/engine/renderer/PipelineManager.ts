import { ShaderManager } from './ShaderManager';

export class PipelineManager {
  private device: GPUDevice;
  private format: GPUTextureFormat;
  private pipelines: Map<string, GPURenderPipeline> = new Map();

  constructor(device: GPUDevice, format: GPUTextureFormat) {
    this.device = device;
    this.format = format;
  }

  async createPipelines(shaderManager: ShaderManager) {
    const basicPipeline = this.device.createRenderPipeline({
      label: 'basic-pipeline',
      layout: 'auto',
      vertex: {
        module: shaderManager.getShader('basic-vertex'),
        entryPoint: 'main',
        buffers: [{
          arrayStride: 32,
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x3' },
            { shaderLocation: 1, offset: 12, format: 'float32x3' },
            { shaderLocation: 2, offset: 24, format: 'float32x2' },
          ],
        }],
      },
      fragment: {
        module: shaderManager.getShader('basic-fragment'),
        entryPoint: 'main',
        targets: [
          { format: 'rgba8unorm' },
          { format: 'rgba16float' },
          { format: 'rgba8unorm' },
        ],
      },
      primitive: {
        topology: 'triangle-list',
        cullMode: 'back',
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus',
      },
    });

    this.pipelines.set('basic', basicPipeline);
  }

  getPipeline(name: string): GPURenderPipeline {
    const pipeline = this.pipelines.get(name);
    if (!pipeline) {
      throw new Error(`Pipeline not found: ${name}`);
    }
    return pipeline;
  }
}
