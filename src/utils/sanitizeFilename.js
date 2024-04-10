const sanitizeFilename = (filename) => {
  // Replace any characters other than alphanumeric, underscore, dash, or period with an underscore
  return filename.replace(/[^a-zA-Z0-9-_]/g, '_');
};

export default sanitizeFilename;
