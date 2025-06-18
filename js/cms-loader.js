// CMS Content Loader
class CMSLoader {
  constructor() {
    this.siteData = null;
    this.heroData = null;
    this.aboutData = null;
    this.servicesData = [];
    this.servicesSectionData = null;
    this.projectsData = [];
    this.projectsSectionData = null;
  }

  // Load YAML content
  async loadYAML(url, suppressErrors = false) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status}`);
      }
      const text = await response.text();
      // Use proper js-yaml library for accurate parsing of multi-line strings
      return jsyaml.load(text);
    } catch (error) {
      if (!suppressErrors) {
        console.warn(`Could not load ${url}, using fallback content:`, error);
      }
      return null;
    }
  }

  // Load all YAML files from a directory using registry + comprehensive auto-discovery
  async loadAllFilesFromDirectory(directoryPath, targetArray) {
    const discoveredFiles = [];
    let filesToLoad = [];

    // Step 1: Try to load registry first
    const registryFile = directoryPath.includes("projects")
      ? "/_data/projects-registry.yml"
      : "/_data/services-registry.yml";
    const arrayKey = directoryPath.includes("projects")
      ? "projects"
      : "services";

    try {
      const registryData = await this.loadYAML(registryFile, true);
      if (registryData && Array.isArray(registryData[arrayKey])) {
        filesToLoad = [...registryData[arrayKey]];
        console.log(
          `📋 Registry found ${filesToLoad.length} files: ${filesToLoad.join(
            ", "
          )}`
        );
      }
    } catch (error) {
      console.log(`📄 Registry not found, will use direct discovery`);
    }

    // Step 2: Direct directory scanning - try common filenames to discover what exists
    console.log(`🔍 Scanning directory for all .yml files...`);

    // Generate a comprehensive list of potential filenames to test
    const potentialFiles = this.generateAllPossibleFilenames();

    // Test files in batches to find what actually exists
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < potentialFiles.length; i += batchSize) {
      batches.push(potentialFiles.slice(i, i + batchSize));
    }

    let totalFound = 0;
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(
        `🔄 Scanning batch ${batchIndex + 1}/${batches.length} (${
          batch.length
        } files)...`
      );

      const batchPromises = batch.map(async (filename) => {
        try {
          const data = await this.loadYAML(`${directoryPath}${filename}`, true);
          if (data && data.title) {
            return { filename, data };
          }
        } catch (error) {
          // Silently ignore - this is expected for discovery
        }
        return null;
      });

      const batchResults = await Promise.all(batchPromises);
      const foundFiles = batchResults.filter((result) => result !== null);

      foundFiles.forEach(({ filename, data }) => {
        if (!filesToLoad.includes(filename)) {
          discoveredFiles.push(filename);
          console.log(`🆕 Discovered: ${filename} - "${data.title}"`);
        }
        totalFound++;
      });

      // Stop early if we've found a reasonable number of files
      if (totalFound >= 50) {
        console.log(
          `🛑 Found ${totalFound} files, stopping scan to avoid overload`
        );
        break;
      }
    }

    // Add discovered files to load list
    if (discoveredFiles.length > 0) {
      console.log(
        `🎊 Total discovered: ${
          discoveredFiles.length
        } new files: ${discoveredFiles.join(", ")}`
      );
      filesToLoad.push(...discoveredFiles);

      // Auto-update registry
      await this.updateRegistryWithNewFiles(
        registryFile,
        discoveredFiles,
        arrayKey
      );
    }

    // Step 3: Fallback to known files if nothing found
    if (filesToLoad.length === 0) {
      if (directoryPath.includes("projects")) {
        filesToLoad = [
          "a-project.yml",
          "coastal-commercial.yml",
          "residential-upgrade.yml",
          "solar-installation.yml",
        ];
      } else if (directoryPath.includes("services")) {
        filesToLoad = [
          "residential.yml",
          "commercial.yml",
          "industrial.yml",
          "solar.yml",
          "generator.yml",
          "lighting.yml",
          "smart-home.yml",
          "underground.yml",
        ];
      }
      console.log(
        `🔧 Using fallback file list with ${filesToLoad.length} files`
      );
    }

    // Step 4: Load all identified files
    console.log(
      `📥 Loading ${filesToLoad.length} files: ${filesToLoad.join(", ")}`
    );

    const loadPromises = filesToLoad.map(async (filename) => {
      try {
        const fullPath = `${directoryPath}${filename}`;
        const data = await this.loadYAML(fullPath, false);
        if (data && data.title) {
          console.log(`✅ Successfully loaded: ${filename} - "${data.title}"`);
          return { data, filename };
        } else {
          console.warn(`⚠️ File ${filename} loaded but missing title field`);
          return null;
        }
      } catch (error) {
        console.error(`❌ Failed to load ${filename}:`, error.message);
        return null;
      }
    });

    const results = await Promise.all(loadPromises);
    const validResults = results.filter((result) => result !== null);

    // Step 5: Remove duplicates and add to target array
    const uniqueResults = [];
    const seenTitles = new Set();

    validResults.forEach(({ data, filename }) => {
      if (!seenTitles.has(data.title)) {
        seenTitles.add(data.title);
        uniqueResults.push(data);
        console.log(`📝 Added: ${data.title} (from ${filename})`);
      } else {
        console.warn(
          `⚠️ Duplicate title found: ${data.title} (from ${filename})`
        );
      }
    });

    uniqueResults.forEach((data) => {
      targetArray.push(data);
    });

    console.log(
      `🎯 Loading complete: ${uniqueResults.length} files loaded from ${directoryPath}`
    );
  }

  // Generate comprehensive list of possible filenames
  generateAllPossibleFilenames() {
    const filenames = [];

    // Single letters (a.yml, b.yml, etc.)
    for (let i = 97; i <= 122; i++) {
      filenames.push(`${String.fromCharCode(i)}.yml`);
    }

    // Numbers (1.yml, 2.yml, etc.)
    for (let i = 1; i <= 100; i++) {
      filenames.push(`${i}.yml`);
    }

    // Common words and combinations
    const words = [
      "new",
      "latest",
      "recent",
      "big",
      "main",
      "demo",
      "work",
      "job",
      "test",
      "task",
      "site",
      "shop",
      "sample",
      "office",
      "commercial",
      "project",
      "service",
      "residential",
      "home",
      "small",
      "build",
      "emergency",
      "maintenance",
      "repair",
      "installation",
      "electrical",
      "power",
      "lighting",
      "wiring",
      "panel",
      "upgrade",
      "install",
      "smart",
      "solar",
      "generator",
      "industrial",
      "underground",
      "first",
      "second",
      "third",
      "fourth",
      "fifth",
      "final",
      "temp",
      "draft",
      "client",
      "customer",
      "house",
      "business",
      "company",
      "corp",
      "enterprise",
      "solution",
      "system",
      "design",
      "custom",
      "special",
      "premium",
      "basic",
      "standard",
      "advanced",
      "pro",
      "lite",
      "full",
      "complete",
      "partial",
      "quick",
      "fast",
      "slow",
      "high",
      "low",
      "medium",
      "large",
      "tiny",
      "huge",
      "mini",
      "mega",
      "super",
      "ultra",
      "extra",
      "plus",
      "max",
      "min",
      "top",
      "bottom",
      "left",
      "right",
      "north",
      "south",
      "east",
      "west",
      "center",
      "middle",
      "inner",
      "outer",
      "front",
      "back",
      "side",
      "corner",
      "edge",
      "end",
      "start",
      "begin",
      "finish",
      "done",
      "ready",
      "pending",
      "active",
      "inactive",
      "old",
      "young",
      "fresh",
      "stale",
      "hot",
      "cold",
      "warm",
      "cool",
      "dry",
      "wet",
      "clean",
      "dirty",
      "clear",
      "dark",
      "light",
      "bright",
      "dim",
      "loud",
      "quiet",
      "red",
      "blue",
      "green",
      "yellow",
      "black",
      "white",
      "gray",
      "orange",
      "purple",
      "pink",
      "brown",
      "silver",
      "gold",
      "bronze",
    ];

    // Single words
    words.forEach((word) => {
      filenames.push(`${word}.yml`);
    });

    // Two-word combinations with hyphens
    for (let i = 0; i < Math.min(words.length, 30); i++) {
      for (let j = 0; j < Math.min(words.length, 30); j++) {
        if (i !== j) {
          filenames.push(`${words[i]}-${words[j]}.yml`);
        }
      }
    }

    // Word + number combinations
    words.slice(0, 20).forEach((word) => {
      for (let i = 1; i <= 20; i++) {
        filenames.push(`${word}${i}.yml`);
        filenames.push(`${word}-${i}.yml`);
        filenames.push(`${i}-${word}.yml`);
      }
    });

    // Letter + word combinations
    for (let i = 97; i <= 122; i++) {
      const letter = String.fromCharCode(i);
      words.slice(0, 10).forEach((word) => {
        filenames.push(`${letter}-${word}.yml`);
        filenames.push(`${word}-${letter}.yml`);
      });
    }

    return [...new Set(filenames)]; // Remove duplicates
  }

  // Auto-update registry when new files are discovered
  async updateRegistryWithNewFiles(registryFile, newFiles, arrayKey) {
    try {
      console.log(
        `🔄 Auto-updating registry ${registryFile} with new files: ${newFiles.join(
          ", "
        )}`
      );

      // Read current registry
      let currentFiles = [];
      try {
        const registryData = await this.loadYAML(registryFile, true);
        if (registryData && Array.isArray(registryData[arrayKey])) {
          currentFiles = registryData[arrayKey];
        }
      } catch (error) {
        console.log(`📄 Creating new registry as current one not found`);
      }

      // Add new files to registry
      const updatedFiles = [...currentFiles, ...newFiles];

      // Note: In a browser environment, we can't write files directly
      // This would need to be handled by a server endpoint or build process
      console.log(
        `💡 Registry should be updated to include: ${updatedFiles.join(", ")}`
      );
      console.log(`💡 Run 'node update-registry.js' to sync the registry file`);
    } catch (error) {
      console.error(`❌ Error updating registry:`, error);
    }
  }

  // Simple YAML parser for our basic structure
  parseYAML(text) {
    const result = {};
    const lines = text.split("\n");
    let currentObj = result;
    let objStack = [result];
    let indent = 0;
    let currentArray = null;
    let arrayKey = null;

    for (let line of lines) {
      line = line.replace(/^\s*#.*/, ""); // Remove comments
      if (!line.trim()) continue;

      // Check for array items
      const arrayMatch = line.match(/^(\s*)-\s*(.*)$/);
      if (arrayMatch) {
        const [, spaces, value] = arrayMatch;
        if (currentArray) {
          currentArray.push(value.replace(/^["']|["']$/g, "")); // Remove quotes
        }
        continue;
      }

      const match = line.match(/^(\s*)([^:]+):\s*(.*)$/);
      if (match) {
        const [, spaces, key, value] = match;
        const currentIndent = spaces.length;

        // Handle indentation changes
        if (currentIndent > indent) {
          // Deeper level
          indent = currentIndent;
        } else if (currentIndent < indent) {
          // Back to previous level
          const levels = (indent - currentIndent) / 2;
          for (let i = 0; i < levels; i++) {
            objStack.pop();
          }
          currentObj = objStack[objStack.length - 1];
          indent = currentIndent;
          currentArray = null;
          arrayKey = null;
        }

        if (value.trim()) {
          // Has value - parse different data types
          let parsedValue = value.replace(/^["']|["']$/g, ""); // Remove quotes

          // Parse booleans
          if (parsedValue === "true") {
            parsedValue = true;
          } else if (parsedValue === "false") {
            parsedValue = false;
          } else if (!isNaN(parsedValue) && !isNaN(parseFloat(parsedValue))) {
            // Parse numbers
            parsedValue = parseFloat(parsedValue);
          }

          currentObj[key.trim()] = parsedValue;
          currentArray = null;
          arrayKey = null;
        } else {
          // Object or array
          const keyName = key.trim();
          currentObj[keyName] = [];
          currentArray = currentObj[keyName];
          arrayKey = keyName;
        }
      }
    }

    return result;
  }

  // Load all CMS content
  async loadContent() {
    try {
      // Load site data
      this.siteData = await this.loadYAML("/_data/site.yml");

      // Load hero data
      this.heroData = await this.loadYAML("/_data/hero.yml");

      // Load about data
      this.aboutData = await this.loadYAML("/_data/about.yml");
      console.log("Loaded about data:", this.aboutData);

      // Load services section data
      this.servicesSectionData = await this.loadYAML(
        "/_data/services-section.yml"
      );

      // Load projects section data
      this.projectsSectionData = await this.loadYAML(
        "/_data/projects-section.yml"
      );

      // Load services data dynamically
      await this.loadAllFilesFromDirectory(
        "/_data/services/",
        this.servicesData
      );
      // Sort services by order
      this.servicesData.sort((a, b) => (a.order || 999) - (b.order || 999));

      // Load projects data dynamically
      await this.loadAllFilesFromDirectory(
        "/_data/projects/",
        this.projectsData
      );
      // Sort projects by order
      this.projectsData.sort((a, b) => (a.order || 999) - (b.order || 999));
      console.log("🔍 DEBUG: Loaded projects data:", this.projectsData);
      console.log("🔍 DEBUG: Projects count:", this.projectsData.length);
      this.projectsData.forEach((project, index) => {
        console.log(
          `🔍 DEBUG: Project ${index + 1}:`,
          project.title,
          project.description
        );
      });

      // Apply content to page
      this.applyContent();
    } catch (error) {
      console.error("Error loading CMS content:", error);
    }
  }

  // Apply loaded content to the page
  applyContent() {
    // Update site metadata
    if (this.siteData) {
      document.title = this.siteData.title || document.title;

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && this.siteData.description) {
        metaDesc.content = this.siteData.description;
      }

      // Update phone numbers
      const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
      phoneLinks.forEach((link) => {
        if (this.siteData.phone) {
          const cleanPhone = this.siteData.phone.replace(/\D/g, "");
          link.href = `tel:${cleanPhone}`;

          const phoneText = link.querySelector("i")
            ? link.innerHTML.replace(
                /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
                this.siteData.phone
              )
            : this.siteData.phone;

          if (!link.querySelector("i")) {
            link.textContent = this.siteData.phone;
          } else {
            link.innerHTML = link.innerHTML.replace(
              /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
              this.siteData.phone
            );
          }
        }
      });

      // Update email links
      const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
      emailLinks.forEach((link) => {
        if (this.siteData.email) {
          link.href = `mailto:${this.siteData.email}`;
          if (!link.querySelector("i")) {
            link.textContent = this.siteData.email;
          }
        }
      });

      // Update license info
      const licenseElements = document.querySelectorAll(
        "[data-license], .hero-badge span"
      );
      licenseElements.forEach((element) => {
        if (this.siteData.license) {
          const currentText = element.textContent;
          element.textContent = currentText.replace(
            /CSLB Lic\.# \d+/,
            this.siteData.license
          );
        }
      });
    }

    // Update hero content
    if (this.heroData) {
      console.log("Applying hero data:", this.heroData);

      const heroTitle = document.querySelector(".hero-title");
      if (heroTitle && this.heroData.title) {
        heroTitle.textContent = this.heroData.title;
      }

      const heroDescription = document.querySelector(".hero-description");
      if (heroDescription && this.heroData.description) {
        heroDescription.textContent = this.heroData.description;
      }

      const heroBadge = document.querySelector(".hero-badge span");
      if (heroBadge && this.heroData.badge) {
        heroBadge.textContent = this.heroData.badge;
      }

      // Update hero buttons
      const primaryBtn = document.querySelector(".hero-actions .btn-primary");
      if (primaryBtn && this.heroData.primary_button_text) {
        const icon = primaryBtn.querySelector("i");
        primaryBtn.innerHTML = icon
          ? `${icon.outerHTML} ${this.heroData.primary_button_text}`
          : this.heroData.primary_button_text;

        if (this.heroData.primary_button_link) {
          primaryBtn.href = this.heroData.primary_button_link;
        }
      }

      const secondaryBtn = document.querySelector(
        ".hero-actions .btn-secondary"
      );
      if (secondaryBtn && this.heroData.secondary_button_text) {
        const icon = secondaryBtn.querySelector("i");
        secondaryBtn.innerHTML = icon
          ? `${icon.outerHTML} ${this.heroData.secondary_button_text}`
          : this.heroData.secondary_button_text;

        if (this.heroData.secondary_button_link) {
          secondaryBtn.href = this.heroData.secondary_button_link;
        }
      }

      // Update hero features (only if we have valid CMS data)
      if (
        this.heroData.features &&
        Array.isArray(this.heroData.features) &&
        this.heroData.features.length > 0
      ) {
        console.log("Loading hero features from CMS:", this.heroData.features);
        const featuresContainer = document.querySelector(".hero-features");
        if (featuresContainer) {
          // Only clear if we have valid features to replace with
          const validFeatures = this.heroData.features.filter(
            (feature) => feature && feature.icon && feature.text
          );
          if (validFeatures.length > 0) {
            featuresContainer.innerHTML = "";
            validFeatures.forEach((feature) => {
              const featureEl = document.createElement("div");
              featureEl.className = "feature";
              featureEl.innerHTML = `
                <i class="${feature.icon}"></i>
                <span>${feature.text}</span>
              `;
              featuresContainer.appendChild(featureEl);
              console.log("Added feature:", feature.text);
            });
          } else {
            console.warn("No valid features found, keeping hardcoded features");
          }
        } else {
          console.warn("Hero features container not found");
        }
      } else {
        console.log(
          "Using hardcoded hero features (no CMS data or empty array)"
        );
        // Keep the existing hardcoded features if no CMS data
      }
    } else {
      console.warn("No hero data available");
    }

    // Show the hero section now that content is loaded
    const heroSection = document.querySelector(".hero");
    if (heroSection) {
      heroSection.classList.add("loaded");
      console.log("✅ Hero section made visible");
    }

    // Update about section
    if (this.aboutData) {
      console.log("Applying about data:", this.aboutData);

      const aboutTitle = document.querySelector(".about .section-header h2");
      if (aboutTitle && this.aboutData.title) {
        aboutTitle.textContent = this.aboutData.title;
      }

      const aboutSubtitle = document.querySelector(".about .section-header p");
      if (aboutSubtitle && this.aboutData.subtitle) {
        aboutSubtitle.textContent = this.aboutData.subtitle;
      }

      // Update about description paragraphs (only if we have valid data)
      if (
        this.aboutData.description &&
        Array.isArray(this.aboutData.description) &&
        this.aboutData.description.length > 0
      ) {
        const aboutDescription = document.querySelector(".about-description");
        if (aboutDescription) {
          // Only clear if we have valid descriptions to replace with
          const validDescriptions = this.aboutData.description.filter(
            (desc) => desc && desc.trim().length > 0
          );
          if (validDescriptions.length > 0) {
            aboutDescription.innerHTML = "";
            validDescriptions.forEach((paragraph) => {
              const p = document.createElement("p");
              p.textContent = paragraph;
              aboutDescription.appendChild(p);
            });
            console.log("Updated about description with CMS data");
          } else {
            console.warn(
              "No valid descriptions found, keeping hardcoded content"
            );
          }
        }
      } else {
        console.log(
          "Using hardcoded about description (no CMS data or empty array)"
        );
      }

      // Update about features (only if we have valid data)
      if (
        this.aboutData.features &&
        Array.isArray(this.aboutData.features) &&
        this.aboutData.features.length > 0
      ) {
        const featuresGrid = document.querySelector(".about .feature-grid");
        if (featuresGrid) {
          // Only clear if we have valid features to replace with
          const validFeatures = this.aboutData.features.filter(
            (feature) =>
              feature && feature.icon && feature.title && feature.description
          );
          if (validFeatures.length > 0) {
            featuresGrid.innerHTML = "";
            validFeatures.forEach((feature) => {
              const featureItem = document.createElement("div");
              featureItem.className = "feature-item";
              featureItem.innerHTML = `
                <div class="feature-icon">
                  <i class="${feature.icon}"></i>
                </div>
                <h4>${feature.title}</h4>
                <p>${feature.description}</p>
              `;
              featuresGrid.appendChild(featureItem);
              console.log("Added about feature:", feature.title);
            });
            console.log("Updated about features with CMS data");
          } else {
            console.warn("No valid features found, keeping hardcoded features");
          }
        } else {
          console.warn("About features grid not found");
        }
      } else {
        console.log(
          "Using hardcoded about features (no CMS data or empty array)"
        );
      }
    } else {
      console.warn("No about data available, using hardcoded content");
    }

    // Show the about section now that content is loaded
    const aboutSection = document.querySelector(".about");
    if (aboutSection) {
      aboutSection.classList.add("loaded");
      console.log("✅ About section made visible");
    }

    // Update projects section
    if (this.projectsSectionData) {
      const projectsTitle = document.querySelector(
        ".projects .section-header h2"
      );
      if (projectsTitle && this.projectsSectionData.title) {
        projectsTitle.textContent = this.projectsSectionData.title;
      }

      const projectsDescription = document.querySelector(
        ".projects .section-header p"
      );
      if (projectsDescription && this.projectsSectionData.description) {
        projectsDescription.textContent = this.projectsSectionData.description;
      }
    }

    // Update services section
    if (this.servicesSectionData) {
      const servicesTitle = document.querySelector(
        ".services .section-header h2"
      );
      if (servicesTitle && this.servicesSectionData.title) {
        servicesTitle.textContent = this.servicesSectionData.title;
      }

      const servicesDescription = document.querySelector(
        ".services .section-header p"
      );
      if (servicesDescription && this.servicesSectionData.description) {
        servicesDescription.textContent = this.servicesSectionData.description;
      }
    }

    // Update services content
    if (this.servicesData && this.servicesData.length > 0) {
      const servicesGrid = document.querySelector(".services-grid");
      if (servicesGrid) {
        servicesGrid.innerHTML = "";
        this.servicesData.forEach((service) => {
          const serviceCard = document.createElement("div");
          serviceCard.className = `service-card${
            service.featured ? " featured" : ""
          }`;

          const featuresHtml =
            service.features && Array.isArray(service.features)
              ? service.features
                  .map(
                    (feature) =>
                      `<li><i class="fas fa-check"></i> ${feature}</li>`
                  )
                  .join("")
              : "";

          serviceCard.innerHTML = `
            <div class="service-image">
              <img
                src="${service.image || "./service images/placeholder.jpg"}"
                alt="${service.title || "Service Image"}"
                loading="lazy"
              />
              <div class="service-overlay">
                <a href="${
                  service.button_link || "#contact"
                }" class="service-cta">
                  ${service.button_text || "Get Quote"}
                </a>
              </div>
            </div>
            <div class="service-content">
              <h3>${service.title || "Untitled Service"}</h3>
              <p>${service.description || "No description available."}</p>
              ${
                featuresHtml
                  ? `<ul class="service-features">${featuresHtml}</ul>`
                  : ""
              }
            </div>
          `;
          servicesGrid.appendChild(serviceCard);
        });
      }
    }

    // Show the services section now that content is loaded
    const servicesSection = document.querySelector(".services");
    if (servicesSection) {
      servicesSection.classList.add("loaded");
      console.log("✅ Services section made visible");
    }

    // Update projects content (only if we have valid data)
    console.log("🔍 DEBUG: Checking projects data for content update...");
    console.log("🔍 DEBUG: this.projectsData exists:", !!this.projectsData);
    console.log(
      "🔍 DEBUG: this.projectsData.length:",
      this.projectsData ? this.projectsData.length : "N/A"
    );
    if (this.projectsData && this.projectsData.length > 0) {
      const projectsGrid = document.querySelector(".projects-grid");
      if (projectsGrid) {
        // Only clear if we have valid projects to replace with
        const validProjects = this.projectsData.filter(
          (project) => project && project.title && project.description
        );
        if (validProjects.length > 0) {
          console.log("Loading projects from CMS:", validProjects);
          projectsGrid.innerHTML = "";
          validProjects.forEach((project) => {
            const projectCard = document.createElement("div");
            projectCard.className = "project-card";

            const tagsHtml =
              project.tags && Array.isArray(project.tags)
                ? project.tags
                    .map((tag) => `<span class="tag">${tag}</span>`)
                    .join("")
                : "";

            projectCard.innerHTML = `
              <div class="project-image">
                <img
                  src="${project.image || "./service images/placeholder.jpg"}"
                  alt="${project.title || "Project Image"}"
                  loading="lazy"
                />
                <div class="project-overlay">
                  <div class="project-tags">
                    ${tagsHtml}
                  </div>
                </div>
              </div>
              <div class="project-content">
                <h3>${project.title || "Untitled Project"}</h3>
                <p>${project.description || "No description available."}</p>
              </div>
            `;
            projectsGrid.appendChild(projectCard);
            console.log(
              "Added project:",
              project.title,
              "with description:",
              project.description
            );
            console.log(
              "Description length:",
              project.description ? project.description.length : 0
            );
          });
          console.log("Updated projects with CMS data");
        } else {
          console.warn("No valid projects found, keeping hardcoded projects");
        }
      } else {
        console.warn("Projects grid not found");
      }
    } else {
      console.warn("No projects data available, using hardcoded content");
    }

    // Show the projects section now that content is loaded
    const projectsSection = document.querySelector(".projects");
    if (projectsSection) {
      projectsSection.classList.add("loaded");
      console.log("✅ Projects section made visible");

      // Add a visual indicator that CMS content was loaded
      const timestamp = new Date().toLocaleTimeString();
      const indicator = document.createElement("div");
      indicator.style.cssText =
        "position: fixed; top: 10px; right: 10px; background: #4CAF50; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; z-index: 9999;";
      indicator.textContent = `CMS Updated: ${timestamp}`;
      document.body.appendChild(indicator);
      setTimeout(() => indicator.remove(), 3000);
    }

    console.log("CMS content applied successfully");
  }

  // Initialize CMS loading
  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.loadContent());
    } else {
      this.loadContent();
    }
  }
}

// Initialize CMS Loader
const cmsLoader = new CMSLoader();
cmsLoader.init();

// Netlify Identity integration
if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", (user) => {
    if (!user) {
      window.netlifyIdentity.on("login", () => {
        document.location.href = "/admin/";
      });
    }
  });
}
