// CMS Content Loader
class CMSLoader {
  constructor() {
    this.siteData = null;
    this.heroData = null;
    this.servicesData = [];
    this.servicesSectionData = null;
    this.projectsData = [];
    this.projectsSectionData = null;
  }

  // Load YAML content
  async loadYAML(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status}`);
      }
      const text = await response.text();
      return this.parseYAML(text);
    } catch (error) {
      console.warn(`Could not load ${url}, using fallback content:`, error);
      return null;
    }
  }

  // Load all YAML files from a directory using registry for efficiency
  async loadAllFilesFromDirectory(directoryPath, targetArray) {
    let registryFile = "";
    if (directoryPath.includes("services")) {
      registryFile = "/_data/services-registry.yml";
    } else if (directoryPath.includes("projects")) {
      registryFile = "/_data/projects-registry.yml";
    }

    // Try to load from registry first (fast approach)
    if (registryFile) {
      try {
        const registry = await this.loadYAML(registryFile);
        if (registry) {
          const fileList = directoryPath.includes("services")
            ? registry.services
            : registry.projects;
          if (fileList && Array.isArray(fileList)) {
            console.log(`Loading ${fileList.length} files from registry`);

            // Load all files in parallel for maximum speed
            const loadPromises = fileList.map(async (filename) => {
              try {
                const data = await this.loadYAML(`${directoryPath}${filename}`);
                if (data) {
                  return data;
                }
              } catch (error) {
                console.debug(`Could not load ${filename}:`, error);
              }
              return null;
            });

            const results = await Promise.all(loadPromises);
            results.forEach((data) => {
              if (data) {
                targetArray.push(data);
              }
            });

            return; // Exit early if registry worked
          }
        }
      } catch (error) {
        console.debug(
          "Registry not available, falling back to discovery:",
          error
        );
      }
    }

    // Fallback: Load known files only (no slow discovery)
    const fallbackFiles = directoryPath.includes("services")
      ? [
          "residential.yml",
          "commercial.yml",
          "solar.yml",
          "underground.yml",
          "generator.yml",
          "emergency.yml",
          "industrial.yml",
          "maintenance.yml",
          "lighting.yml",
          "smart-home.yml",
          "a.yml",
        ]
      : [
          "coastal-commercial.yml",
          "residential-upgrade.yml",
          "solar-installation.yml",
        ];

    console.log("Using fallback file loading");
    const loadPromises = fallbackFiles.map(async (filename) => {
      try {
        const data = await this.loadYAML(`${directoryPath}${filename}`);
        if (data) {
          return data;
        }
      } catch (error) {
        console.debug(`Fallback: Could not load ${filename}:`, error);
      }
      return null;
    });

    const results = await Promise.all(loadPromises);
    results.forEach((data) => {
      if (data) {
        targetArray.push(data);
      }
    });
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

      // Update hero features
      if (this.heroData.features && Array.isArray(this.heroData.features)) {
        const featuresContainer = document.querySelector(".hero-features");
        if (featuresContainer) {
          featuresContainer.innerHTML = "";
          this.heroData.features.forEach((feature) => {
            if (feature && feature.icon && feature.text) {
              const featureEl = document.createElement("div");
              featureEl.className = "feature";
              featureEl.innerHTML = `
                <i class="${feature.icon}"></i>
                <span>${feature.text}</span>
              `;
              featuresContainer.appendChild(featureEl);
            }
          });
        }
      }
    } else {
      console.warn("No hero data available");
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

    // Update projects content
    if (this.projectsData && this.projectsData.length > 0) {
      const projectsGrid = document.querySelector(".projects-grid");
      if (projectsGrid) {
        projectsGrid.innerHTML = "";
        this.projectsData.forEach((project) => {
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
        });
      }
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
