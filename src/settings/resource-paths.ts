const INDICATOR_TYPE = {
  allowedValue: true
}

const OBJECT_TYPE = {
  allowedValue: true,
  next: {
    INDICATOR_TYPE
  }
}

const PLUGIN = {
  allowedValue: false,
  next: {
    OBJECT_TYPE
  }
}

const DEVICE = {
  allowedValue: true,
  next: {
    PLUGIN, OBJECT_TYPE
  }
};

const resourcePaths = {
  DEVICE
};

export { resourcePaths };
