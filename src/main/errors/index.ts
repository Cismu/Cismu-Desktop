export class CismuError extends Error {
  description: string;
}

export class CismuRepairError extends CismuError {
  description: string;

  constructor(name = "CISMU_EUNKNOWN") {
    const message = "An error occurred during repair";
    super(message);
    this.description = `\
    The error may be due to lack of permissions on the Cismu folder.
    Verify that you have permissions.`;
    this.name = name;
  }
}

export class CismuStartupError extends CismuError {
  description: string;

  constructor(name = "CISMU_EUNKNOWN") {
    const message = "Error during start-up";
    super(message);
    this.description = `\
    An error occurred while loading the program, probably a component could not be loaded.
    There is not much to do, contact support to solve your problem.`;
    this.name = name;
  }
}

export class CismuSetupError extends CismuError {
  description: string;

  constructor(name = "CISMU_ESETUP", description?: string) {
    const message = "Application configuration error";
    super(message);
    this.description = `\
    An error occurred when setting up the application, this may be due to external manipulation of the application files,
    which creates undefined behaviors. A possible solution is to run the application with the --restore-all-data flag.`;
    if (description) this.description = description;
    this.name = name;
  }
}

export class CismuPermissionError extends CismuError {
  description: string;

  constructor(error: any) {
    const message = "Permission error";
    super(message);
    this.description = `\
    A permissions error occurred during the execution of the operation. 
    This may be because you do not have the proper permissions to perform this action on the file system.
    To resolve this problem, try the following actions:
    - Verify that you have the necessary permissions to access and modify the files or directories involved.
    - Run the application with elevated privileges (as administrator) if necessary.
    - Make sure that the files or directories involved are not write-protected or modified.
    If the problem persists, contact technical support for further assistance.
    
    Path: ${error.path}
    syscall: ${error.syscall}`;

    this.name = error.name;
  }
}

export class CismuUnknownError extends CismuError {
  description: string;

  constructor(
    name: string = "Unknown Error",
    description: string = "Unknown Error",
    error?: Error
  ) {
    const message = "Unknown Error" || error.message;
    super(message);
    this.description = description;
    this.name = name;
  }
}

export class CismuPermissionNotGrantedError extends CismuError {
  description: string;

  constructor(name: string = "CISMU_EPERM") {
    const message = "User did not grant permission";
    super(message);
    this.description = `\
    It is necessary to grant elevated permissions to perform some tasks, such as repairing, installing and uninstalling the application.
    For the correct functioning of the application, you should grant these permissions.
    
    Don't worry, we will make good use of them.
    `;
    this.name = name;
  }
}

export class CismuMissingFiles extends CismuError {
  description: string;

  constructor(name = "CISMU_EMISS") {
    const message = "Missing files";
    super(message);
    this.description = `\
    Some files are missing in the application if you try to repair it may fix the problem or run as administrator.`;
    this.name = name;
  }
}

export class CismuAccessError extends CismuError {
  description: string;

  constructor(name = "CISMU_EACCS") {
    const message = "Access Error";
    super(message);
    this.description = `\
    This error is due to the system detecting that it does not have access to a resource.
    To fix it try to repair the program with the --repair-restart flag or run as administrator`;
    this.name = name;
  }
}

export class CismuOperatingSystemNotSupported extends CismuError {
  description: string;

  constructor(name = "CISMU_OSNS") {
    const message = "Operating system not supported";
    super(message);
    this.description = `\
    The application is not supported by the current operating system, the one that is running is rare,
    which indicates that it possibly is, so contact the developer in order to resolve this issue.`;
    this.name = name;
  }
}

export class CismuInvalidConfig extends CismuError {
  description: string;

  constructor(name = "CISMU_IN/COCfGF") {
    const message = "Invalid/corrupted configuration file";
    super(message);
    this.description = `\
    An invalid configuration file was detected, the default configuration will be used,
    if this keeps occurring it is a very serious bug and must be fixed, please notify the developer.`;
    this.name = name;
  }
}
