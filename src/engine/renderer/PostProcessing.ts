export class PostProcessing {
  private device: GPUDevice;
  private format: GPUTextureFormat;
  private pipeline!: GPURenderPipeline;
  private bindGroup!: GPUBindGroup;
  private sampler!: GPUSampler;
  private paramsBuffer!: GPUBuffer;

  private params = {
    time: 0,
    chromaticAberration: 1.0,
    vignette: 1.2,
    scanlines: 0.3,
    bloom: 1.0,
    grain: 0.15,
  };

  constructor(device: GPUDevice, format: GPUTextureFormat) {
    this.device = device;
    this.format = format;
  }

  async initialize() {
    this.sampler = this.device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
    });

    this.paramsBuffer = this.device.createBuffer({
      size: 24,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.updateParams();
  }

  private updateParams() {
    this.params.time = performance.now() / 1000;

    const data = new Float32Array([
      this.params.time,
      this.params.chromaticAberration,
      this.params.vignette,
      this.params.scanlines,
      this.params.bloom,
      this.params.grain,
    ]);

    this.device.queue.writeBuffer(this.paramsBuffer, 0, data);
  }

  render(encoder: GPUCommandEncoder, targetView: GPUTextureView) {
    this.updateParams();
  }
}
