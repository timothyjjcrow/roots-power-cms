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
  async loadYAML(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status}`);
      }
      const text = await response.text();
      // Use proper js-yaml library for accurate parsing of multi-line strings
      return jsyaml.load(text);
    } catch (error) {
      console.warn(`Could not load ${url}, using fallback content:`, error);
      return null;
    }
  }

  // Load all YAML files from a directory using registry for efficiency
  async loadAllFilesFromDirectory(directoryPath, targetArray) {
    console.log(`🔍 Auto-discovering files in ${directoryPath}`);

    // Auto-discovery approach: try to load common file patterns
    const commonPatterns = [];

    if (directoryPath.includes("services")) {
      // Generate comprehensive service file patterns
      const serviceTypes = [
        "residential",
        "commercial",
        "industrial",
        "solar",
        "generator",
        "emergency",
        "emergency-services",
        "maintenance",
        "lighting",
        "smart-home",
        "underground",
        "electrical",
        "repair",
        "installation",
        "hvac",
        "plumbing",
        "automation",
        "security",
        "backup",
        "panel",
        "wiring",
        "outlet",
        "switch",
        "circuit",
        "breaker",
        "inspection",
        "troubleshooting",
        "upgrade",
        "retrofit",
        "code",
        "permit",
        "consultation",
        "design",
        "planning",
        "24-7",
        "emergency-repair",
        "service-call",
        "electrical-service",
        "power",
        "energy",
        "led",
        "fixture",
        "ceiling-fan",
      ];

      serviceTypes.forEach((type) => {
        commonPatterns.push(`${type}.yml`);
        commonPatterns.push(`${type}-service.yml`);
        commonPatterns.push(`${type}-services.yml`);
      });

      // Add common variations and abbreviations
      const variations = ["elec", "elect", "electric", "power", "energy"];
      variations.forEach((variation) => {
        commonPatterns.push(`${variation}.yml`);
        commonPatterns.push(`${variation}-service.yml`);
        commonPatterns.push(`${variation}-services.yml`);
      });
    } else if (directoryPath.includes("projects")) {
      // Generate comprehensive project file patterns
      const projectTypes = [
        "coastal-commercial",
        "residential-upgrade",
        "solar-installation",
        "commercial",
        "residential",
        "industrial",
        "office",
        "retail",
        "warehouse",
        "factory",
        "home",
        "apartment",
        "condo",
        "school",
        "hospital",
        "hotel",
        "restaurant",
        "church",
        "government",
        "medical",
        "dental",
        "veterinary",
        "automotive",
        "manufacturing",
        "tech",
        "startup",
        "nonprofit",
        "community",
        "municipal",
        "federal",
        "state",
        "county",
        "city",
        "township",
        "district",
        "authority",
        "agency",
        "department",
      ];

      projectTypes.forEach((type) => {
        commonPatterns.push(`${type}.yml`);
        commonPatterns.push(`${type}-project.yml`);
      });

      // Add numbered variations (project1, project2, etc.)
      for (let i = 1; i <= 20; i++) {
        commonPatterns.push(`project${i}.yml`);
        commonPatterns.push(`project-${i}.yml`);
      }
    }

    // Add some generic patterns to catch any other files
    const genericPatterns = [
      "a.yml",
      "b.yml",
      "c.yml",
      "d.yml",
      "e.yml",
      "f.yml",
      "g.yml",
      "h.yml",
      "test.yml",
      "new.yml",
      "temp.yml",
      "draft.yml",
      "sample.yml",
      "example.yml",
      "service.yml",
      "project.yml",
      "item.yml",
      "entry.yml",
      "content.yml",
    ];

    // Add hyphenated and compound word patterns for custom names
    const compoundPatterns = [];
    const words = [
      "big",
      "small",
      "new",
      "old",
      "main",
      "primary",
      "secondary",
      "first",
      "second",
      "third",
      "best",
      "top",
      "special",
      "custom",
      "dub",
      "hub",
      "lab",
      "pro",
      "max",
      "plus",
      "super",
      "ultra",
      "mega",
      "mini",
      "micro",
      "nano",
      "eco",
      "green",
      "blue",
      "red",
    ];

    words.forEach((word1) => {
      words.forEach((word2) => {
        if (word1 !== word2) {
          compoundPatterns.push(`${word1}-${word2}.yml`);
          compoundPatterns.push(`${word1}${word2}.yml`);
        }
      });
    });

    commonPatterns.push(...genericPatterns, ...compoundPatterns.slice(0, 100)); // Limit to avoid too many requests

    console.log(`🔍 Trying ${commonPatterns.length} potential file patterns`);

    // Load all potential files in parallel
    const loadPromises = commonPatterns.map(async (filename) => {
      try {
        const data = await this.loadYAML(`${directoryPath}${filename}`);
        if (data && data.title) {
          // Ensure it's a valid service/project with a title
          console.log(`✅ Found and loaded: ${filename}`);
          return { data, filename };
        }
      } catch (error) {
        // Silently ignore missing files - this is expected
      }
      return null;
    });

    const results = await Promise.all(loadPromises);
    const validResults = results.filter((result) => result !== null);

    // Remove duplicates based on title (in case same content is found multiple times)
    const uniqueResults = [];
    const seenTitles = new Set();

    validResults.forEach(({ data, filename }) => {
      if (!seenTitles.has(data.title)) {
        seenTitles.add(data.title);
        uniqueResults.push(data);
        console.log(`📝 Added unique item: ${data.title} (from ${filename})`);
      }
    });

    uniqueResults.forEach((data) => {
      targetArray.push(data);
    });

    console.log(
      `🎯 Auto-discovery complete: ${uniqueResults.length} unique files loaded from ${directoryPath}`
    );
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
      console.log("Loaded projects data:", this.projectsData);

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

    // Update projects content (only if we have valid data)
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
