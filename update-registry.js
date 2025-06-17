// Script to update service and project registries
// This should be run whenever new services or projects are added via CMS

const fs = require("fs");
const path = require("path");

// Function to scan directory and update registry
function updateRegistry(directory, registryFile, arrayKey) {
  console.log(`\n🔍 Scanning ${directory} for .yml files...`);

  try {
    // Read all files in the directory
    const files = fs
      .readdirSync(directory)
      .filter((file) => file.endsWith(".yml"))
      .sort();

    console.log(`📁 Found ${files.length} .yml files:`, files);

    // Read or create registry
    let registryData = {};
    if (fs.existsSync(registryFile)) {
      const registryContent = fs.readFileSync(registryFile, "utf8");
      // Simple YAML parsing for our structure
      const lines = registryContent.split("\n");
      let currentArray = [];
      let inArray = false;

      for (const line of lines) {
        if (line.trim().startsWith(arrayKey + ":")) {
          inArray = true;
          continue;
        }
        if (inArray && line.trim().startsWith("- ")) {
          currentArray.push(line.trim().substring(2));
        } else if (inArray && line.trim() && !line.startsWith(" ")) {
          break;
        }
      }
      registryData[arrayKey] = currentArray;
      console.log(
        `📋 Current registry has ${currentArray.length} files:`,
        currentArray
      );
    } else {
      registryData[arrayKey] = [];
      console.log(`📄 Creating new registry file: ${registryFile}`);
    }

    // Update registry with all found files
    const currentFiles = registryData[arrayKey] || [];
    const newFiles = files.filter((file) => !currentFiles.includes(file));
    const removedFiles = currentFiles.filter((file) => !files.includes(file));

    if (newFiles.length > 0) {
      console.log(`🆕 Adding ${newFiles.length} new files:`, newFiles);
    }

    if (removedFiles.length > 0) {
      console.log(
        `🗑️  Removing ${removedFiles.length} missing files:`,
        removedFiles
      );
    }

    // Update the registry
    registryData[arrayKey] = files;

    // Write back to registry file in proper YAML format
    const yamlContent = `${arrayKey}:\n${files
      .map((file) => `  - ${file}`)
      .join("\n")}\n`;

    fs.writeFileSync(registryFile, yamlContent, "utf8");
    console.log(`✅ Registry updated: ${registryFile}`);
    console.log(`📊 Total files in registry: ${files.length}`);

    return {
      total: files.length,
      added: newFiles.length,
      removed: removedFiles.length,
      files: files,
    };
  } catch (error) {
    console.error(
      `❌ Error updating registry for ${directory}:`,
      error.message
    );
    return null;
  }
}

// Main execution
console.log("🚀 Starting registry update...");

// Update projects registry
const projectsResult = updateRegistry(
  path.join(__dirname, "_data/projects"),
  path.join(__dirname, "_data/projects-registry.yml"),
  "projects"
);

// Update services registry
const servicesResult = updateRegistry(
  path.join(__dirname, "_data/services"),
  path.join(__dirname, "_data/services-registry.yml"),
  "services"
);

// Summary
console.log("\n📈 SUMMARY:");
if (projectsResult) {
  console.log(
    `   Projects: ${projectsResult.total} files (${projectsResult.added} added, ${projectsResult.removed} removed)`
  );
}
if (servicesResult) {
  console.log(
    `   Services: ${servicesResult.total} files (${servicesResult.added} added, ${servicesResult.removed} removed)`
  );
}

console.log("\n✨ Registry update complete!");
console.log(
  "💡 TIP: Run this script whenever you add/remove .yml files to keep registries in sync."
);
