import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    isMultipart?: boolean;
     multipart(): Promise<{
      filename: string;
      mimetype: string;
      toBuffer(): Promise<Buffer>;
    }>;
    parts?: () => AsyncIterableIterator<any>;
  }
}
