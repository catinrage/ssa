export enum SSAErrorCodeEnum {
  CORRUPTED_FILE,
  UNKNOWN_OPERATION,
}

export type SSAErrorOptions = {
  message: string;
  code: SSAErrorCodeEnum;
};

export class SSAError extends Error {
  constructor(options: SSAErrorOptions) {
    super(options.message);
  }
}

export type SSAErrorCorruptedFileData = {
  description: string;
  file: string;
};

export class SSAErrorCorruptedFile extends SSAError {
  constructor(public data: SSAErrorCorruptedFileData) {
    super({
      message: 'File is corrupted',
      code: SSAErrorCodeEnum.CORRUPTED_FILE,
    });
  }
}

export type SSAErrorUnknownOperationData = {
  operation: string;
  file: string;
};

export class SSAErrorUnknownOperation extends SSAError {
  constructor(public data: SSAErrorUnknownOperationData) {
    super({
      message: 'Unknown operation',
      code: SSAErrorCodeEnum.UNKNOWN_OPERATION,
    });
  }
}
