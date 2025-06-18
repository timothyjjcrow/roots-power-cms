const fs = require("fs");
const path = require("path");

// Auto-update registry with comprehensive file discovery
function autoUpdateRegistry() {
  console.log("🤖 Auto-updating registries...");

  let totalUpdated = 0;

  // Update projects registry
  const projectsResult = updateDirectoryRegistry(
    path.join(__dirname, "_data/projects"),
    path.join(__dirname, "_data/projects-registry.yml"),
    "projects"
  );

  // Update services registry
  const servicesResult = updateDirectoryRegistry(
    path.join(__dirname, "_data/services"),
    path.join(__dirname, "_data/services-registry.yml"),
    "services"
  );

  if (projectsResult.updated || servicesResult.updated) {
    console.log("\n🔄 Registry changes detected, committing automatically...");

    // Auto-commit if we're in a git environment
    try {
      const { execSync } = require("child_process");

      // Add changed files
      if (projectsResult.updated) {
        execSync("git add _data/projects-registry.yml", { stdio: "inherit" });
        totalUpdated++;
      }
      if (servicesResult.updated) {
        execSync("git add _data/services-registry.yml", { stdio: "inherit" });
        totalUpdated++;
      }

      if (totalUpdated > 0) {
        const commitMessage = `Auto-update registries: ${
          projectsResult.added + servicesResult.added
        } added, ${projectsResult.removed + servicesResult.removed} removed`;
        execSync(`git commit -m "${commitMessage}"`, { stdio: "inherit" });
        console.log("✅ Auto-committed registry changes");

        // Optionally auto-push (uncomment if desired)
        // execSync('git push origin main', { stdio: 'inherit' });
        // console.log('🚀 Auto-pushed to remote');
      }
    } catch (error) {
      console.log(
        "⚠️ Auto-commit failed (may not be in git repo):",
        error.message
      );
    }
  }

  return {
    projects: projectsResult,
    services: servicesResult,
    totalUpdated,
  };
}

function updateDirectoryRegistry(directory, registryFile, arrayKey) {
  console.log(`\n🔍 Scanning ${directory} for .yml files...`);

  try {
    // Read all files in the directory
    const actualFiles = fs
      .readdirSync(directory)
      .filter((file) => file.endsWith(".yml"))
      .sort();

    console.log(`📁 Found ${actualFiles.length} .yml files:`, actualFiles);

    // Read current registry
    let registryFiles = [];
    let registryExists = false;

    if (fs.existsSync(registryFile)) {
      registryExists = true;
      const registryContent = fs.readFileSync(registryFile, "utf8");

      // Parse YAML registry
      const lines = registryContent.split("\n");
      let inArray = false;

      for (const line of lines) {
        if (line.trim().startsWith(arrayKey + ":")) {
          inArray = true;
          continue;
        }
        if (inArray && line.trim().startsWith("- ")) {
          registryFiles.push(line.trim().substring(2));
        } else if (inArray && line.trim() && !line.startsWith(" ")) {
          break;
        }
      }
      console.log(
        `📋 Current registry has ${registryFiles.length} files:`,
        registryFiles
      );
    } else {
      console.log(
        `📄 Registry file doesn't exist, will create: ${registryFile}`
      );
    }

    // Calculate differences
    const newFiles = actualFiles.filter(
      (file) => !registryFiles.includes(file)
    );
    const removedFiles = registryFiles.filter(
      (file) => !actualFiles.includes(file)
    );
    const hasChanges = newFiles.length > 0 || removedFiles.length > 0;

    if (newFiles.length > 0) {
      console.log(`🆕 Adding ${newFiles.length} new files:`, newFiles);
    }

    if (removedFiles.length > 0) {
      console.log(
        `🗑️  Removing ${removedFiles.length} missing files:`,
        removedFiles
      );
    }

    if (!hasChanges && registryExists) {
      console.log(`✅ Registry is up to date`);
      return {
        updated: false,
        added: 0,
        removed: 0,
        total: actualFiles.length,
        files: actualFiles,
      };
    }

    // Write updated registry
    const yamlContent = `${arrayKey}:\n${actualFiles
      .map((file) => `  - ${file}`)
      .join("\n")}\n`;
    fs.writeFileSync(registryFile, yamlContent, "utf8");

    console.log(`✅ Registry updated: ${registryFile}`);
    console.log(`📊 Total files in registry: ${actualFiles.length}`);

    return {
      updated: true,
      added: newFiles.length,
      removed: removedFiles.length,
      total: actualFiles.length,
      files: actualFiles,
    };
  } catch (error) {
    console.error(
      `❌ Error updating registry for ${directory}:`,
      error.message
    );
    return {
      updated: false,
      added: 0,
      removed: 0,
      total: 0,
      files: [],
    };
  }
}

// Export for use as module
module.exports = { autoUpdateRegistry, updateDirectoryRegistry };

// Run if called directly
if (require.main === module) {
  const result = autoUpdateRegistry();

  console.log("\n📈 FINAL SUMMARY:");
  if (result.projects.updated) {
    console.log(
      `   Projects: ${result.projects.total} files (${result.projects.added} added, ${result.projects.removed} removed)`
    );
  } else {
    console.log(`   Projects: ${result.projects.total} files (no changes)`);
  }

  if (result.services.updated) {
    console.log(
      `   Services: ${result.services.total} files (${result.services.added} added, ${result.services.removed} removed)`
    );
  } else {
    console.log(`   Services: ${result.services.total} files (no changes)`);
  }

  if (result.totalUpdated > 0) {
    console.log(
      `\n🎉 Updated ${result.totalUpdated} registry files successfully!`
    );
    console.log(
      "💡 Your new files will now be automatically discovered by the CMS!"
    );
  } else {
    console.log("\n✨ All registries are up to date!");
  }
}
