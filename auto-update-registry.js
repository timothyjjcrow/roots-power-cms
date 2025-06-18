#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { execSync } = require("child_process");

// Configuration
const BASE_DIR = __dirname;
const PROJECTS_DIR = path.join(BASE_DIR, "_data", "projects");
const SERVICES_DIR = path.join(BASE_DIR, "_data", "services");
const PROJECTS_REGISTRY = path.join(BASE_DIR, "_data", "projects-registry.yml");
const SERVICES_REGISTRY = path.join(BASE_DIR, "_data", "services-registry.yml");

console.log("🤖 Auto-updating registries...\n");

// Function to scan directory for all .yml files
function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory ${dirPath} does not exist`);
    return [];
  }

  const files = fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith(".yml"))
    .sort();

  console.log(`🔍 Scanning ${dirPath} for .yml files...`);
  console.log(`📁 Found ${files.length} .yml files:`, files);

  return files;
}

// Function to read registry file
function readRegistry(registryPath, key) {
  try {
    if (!fs.existsSync(registryPath)) {
      console.log(
        `📄 Registry ${registryPath} does not exist, creating new one`
      );
      return [];
    }

    const content = fs.readFileSync(registryPath, "utf8");
    const data = yaml.load(content);

    if (!data || !Array.isArray(data[key])) {
      console.log(`📄 Registry ${registryPath} has invalid format, resetting`);
      return [];
    }

    const files = data[key].sort();
    console.log(`📋 Current registry has ${files.length} files:`, files);
    return files;
  } catch (error) {
    console.log(`❌ Error reading registry ${registryPath}:`, error.message);
    return [];
  }
}

// Function to write registry file
function writeRegistry(registryPath, key, files) {
  try {
    const data = { [key]: files.sort() };
    const yamlContent = yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });

    fs.writeFileSync(registryPath, yamlContent, "utf8");
    console.log(`✅ Registry updated: ${registryPath}`);
    console.log(`📊 Total files in registry: ${files.length}`);
    return true;
  } catch (error) {
    console.log(`❌ Error writing registry ${registryPath}:`, error.message);
    return false;
  }
}

// Function to compare arrays and show differences
function compareArrays(actual, registry, type) {
  const added = actual.filter((file) => !registry.includes(file));
  const removed = registry.filter((file) => !actual.includes(file));

  let changed = false;

  if (added.length > 0) {
    console.log(`🆕 Adding ${added.length} new files:`, added);
    changed = true;
  }

  if (removed.length > 0) {
    console.log(`🗑️  Removing ${removed.length} missing files:`, removed);
    changed = true;
  }

  if (!changed) {
    console.log(`✅ Registry is up to date`);
  }

  return { added, removed, changed };
}

// Function to commit changes automatically
function autoCommitChanges(changedFiles) {
  try {
    if (changedFiles.length === 0) {
      console.log("📝 No registry changes to commit");
      return;
    }

    console.log("\n🔄 Registry changes detected, committing automatically...");

    // Add the changed registry files
    changedFiles.forEach((file) => {
      execSync(`git add "${file}"`, { cwd: BASE_DIR, stdio: "pipe" });
    });

    // Count total changes
    let totalAdded = 0;
    let totalRemoved = 0;

    // We'll get these from the summary at the end
    const commitMessage = `Auto-update registries: sync with actual files`;

    execSync(`git commit -m "${commitMessage}"`, {
      cwd: BASE_DIR,
      stdio: "pipe",
    });
    console.log(`✅ Auto-committed registry changes`);
  } catch (error) {
    console.log(`⚠️  Could not auto-commit changes: ${error.message}`);
    console.log("💡 You may need to commit manually");
  }
}

// Main execution
function main() {
  let changedRegistries = [];
  let totalProjectsAdded = 0,
    totalProjectsRemoved = 0;
  let totalServicesAdded = 0,
    totalServicesRemoved = 0;

  // Process projects
  const actualProjects = scanDirectory(PROJECTS_DIR);
  const registryProjects = readRegistry(PROJECTS_REGISTRY, "projects");
  const projectsDiff = compareArrays(
    actualProjects,
    registryProjects,
    "projects"
  );

  if (projectsDiff.changed) {
    if (writeRegistry(PROJECTS_REGISTRY, "projects", actualProjects)) {
      changedRegistries.push(PROJECTS_REGISTRY);
      totalProjectsAdded = projectsDiff.added.length;
      totalProjectsRemoved = projectsDiff.removed.length;
    }
  }

  console.log(""); // Empty line for separation

  // Process services
  const actualServices = scanDirectory(SERVICES_DIR);
  const registryServices = readRegistry(SERVICES_REGISTRY, "services");
  const servicesDiff = compareArrays(
    actualServices,
    registryServices,
    "services"
  );

  if (servicesDiff.changed) {
    if (writeRegistry(SERVICES_REGISTRY, "services", actualServices)) {
      changedRegistries.push(SERVICES_REGISTRY);
      totalServicesAdded = servicesDiff.added.length;
      totalServicesRemoved = servicesDiff.removed.length;
    }
  }

  // Auto-commit if there are changes
  if (changedRegistries.length > 0) {
    autoCommitChanges(changedRegistries);
  }

  // Final summary
  console.log("\n📈 FINAL SUMMARY:");
  console.log(
    `   Projects: ${actualProjects.length} files (${
      totalProjectsAdded ? totalProjectsAdded + " added, " : ""
    }${
      totalProjectsRemoved
        ? totalProjectsRemoved + " removed"
        : totalProjectsAdded
        ? ""
        : "no changes"
    })`
  );
  console.log(
    `   Services: ${actualServices.length} files (${
      totalServicesAdded ? totalServicesAdded + " added, " : ""
    }${
      totalServicesRemoved
        ? totalServicesRemoved + " removed"
        : totalServicesAdded
        ? ""
        : "no changes"
    })`
  );

  if (changedRegistries.length > 0) {
    console.log(
      `\n🎉 Updated ${changedRegistries.length} registry files successfully!`
    );
    console.log(
      "💡 Your new files will now be automatically discovered by the CMS!"
    );
    console.log("🚀 Changes have been committed - push to deploy to live site");
  } else {
    console.log("\n✨ All registries are already up to date!");
  }
}

// Run the script
main();
