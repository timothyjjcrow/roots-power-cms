#!/usr/bin/env node

// Fix Registry Script - Run this when new projects/services don't show up
// Usage: node fix-registry.js

const { execSync } = require("child_process");

console.log("🔧 Registry Fix Script Starting...\n");

try {
  // Update registries
  console.log("📋 Updating registries...");
  execSync("node update-registry.js", { stdio: "inherit" });

  // Check git status
  console.log("\n📊 Checking for changes...");
  const gitStatus = execSync("git status --porcelain", { encoding: "utf8" });

  if (gitStatus.trim()) {
    console.log("✅ Found registry changes, committing...");

    // Add and commit changes
    execSync(
      "git add _data/services-registry.yml _data/projects-registry.yml",
      { stdio: "inherit" }
    );
    execSync('git commit -m "🔧 Fix registries - manual update"', {
      stdio: "inherit",
    });

    // Push changes
    console.log("🚀 Pushing changes...");
    execSync("git push", { stdio: "inherit" });

    console.log(
      "\n🎉 Registry fix complete! Your new projects/services should now appear on the website."
    );
    console.log("💡 Wait 1-2 minutes for the deployment to complete.");
  } else {
    console.log("ℹ️  No registry changes needed - everything is up to date.");
  }
} catch (error) {
  console.error("❌ Error fixing registries:", error.message);
  console.log("\n🔍 Try running these commands manually:");
  console.log("1. node update-registry.js");
  console.log(
    "2. git add _data/services-registry.yml _data/projects-registry.yml"
  );
  console.log('3. git commit -m "Fix registries"');
  console.log("4. git push");
}
