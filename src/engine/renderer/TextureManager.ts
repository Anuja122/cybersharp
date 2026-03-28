export class TextureManager {
  private device: GPUDevice;
  private textures: Map<string, GPUTexture> = new Map();

  constructor(device: GPUDevice) {
    this.device = device;
  }

  createTexture(
    name: string,
    width: number,
    height: number,
    format: GPUTextureFormat = 'rgba8unorm'
  ): GPUTexture {
    const texture = this.device.createTexture({
      size: [width, height],
      format,
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    this.textures.set(name, texture);
    return texture;
  }

  getTexture(name: string): GPUTexture | undefined {
    return this.textures.get(name);
  }

  async loadImageTexture(name: string, url: string): Promise<GPUTexture> {
    const response = await fetch(url);
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);

    const texture = this.device.createTexture({
      size: [imageBitmap.width, imageBitmap.height],
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    this.device.queue.copyExternalImageToTexture(
      { source: imageBitmap },
      { texture },
      [imageBitmap.width, imageBitmap.height]
    );

    this.textures.set(name, texture);
    return texture;
  }
}
