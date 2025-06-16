// Script to update service and project registries
// This should be run whenever new services or projects are added via CMS

const fs = require("fs");
const path = require("path");

function updateRegistry(directory, registryFile, key) {
  try {
    // Read all .yml files in the directory
    const files = fs
      .readdirSync(directory)
      .filter((file) => file.endsWith(".yml"))
      .sort();

    // Create registry content
    const registryContent = `${key}:\n${files
      .map((file) => `  - ${file}`)
      .join("\n")}\n`;

    // Write registry file
    fs.writeFileSync(registryFile, registryContent);
    console.log(`Updated ${registryFile} with ${files.length} files`);
  } catch (error) {
    console.error(`Error updating ${registryFile}:`, error);
  }
}

// Update services registry
updateRegistry(
  path.join(__dirname, "_data", "services"),
  path.join(__dirname, "_data", "services-registry.yml"),
  "services"
);

// Update projects registry
updateRegistry(
  path.join(__dirname, "_data", "projects"),
  path.join(__dirname, "_data", "projects-registry.yml"),
  "projects"
);

console.log("Registry update complete!");
