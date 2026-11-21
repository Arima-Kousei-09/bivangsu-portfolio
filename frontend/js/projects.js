
"use strict";

/*
 * Dynamic Projects Renderer
 *
 * Fetches project data from the FastAPI backend
 * and renders it inside the portfolio.
 */

const API_BASE_URL = "https://arima-kousei-zcia.onrender.com";

const projectsGrid = document.querySelector(".projects-grid");

async function loadProjects() {
  if (!projectsGrid) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.projects)) {
      throw new Error("Invalid projects response.");
    }

    renderProjects(data.projects);
  } catch (error) {
    // Keep the original HTML cards if the API is unavailable.
    console.error("Unable to load projects:", error);
  }
}

function createElement(tag, className, content) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (content !== undefined) {
    element.textContent = content;
  }

  return element;
}

function renderProjects(projects) {
  const fragment = document.createDocumentFragment();

  projects.forEach((project, index) => {
    const card = createElement(
      "article",
      index === 0 ? "project-card featured" : "project-card",
    );

    // Project metadata
    const top = createElement("div", "project-top");

    const number = createElement(
      "span",
      "project-number",
      `${String(index + 1).padStart(2, "0")} / ${project.category.toUpperCase()}`,
    );

    const status = createElement(
      "span",
      "project-status",
      project.status.toUpperCase(),
    );

    top.append(number, status);

    // Project title
    const title = createElement(
      "h3",
      "project-name",
      project.title,
    );

    // Project description
    const description = createElement(
      "p",
      "project-description",
      project.description,
    );

    // Technology tags
    const tags = createElement("div", "project-tags");

    project.technologies.forEach((technology) => {
      tags.append(
        createElement("span", "", technology),
      );
    });

    card.append(top, title, description, tags);
    fragment.append(card);
  });

  projectsGrid.replaceChildren(fragment);
}

// Start loading projects when the DOM is ready.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadProjects, {
    once: true,
  });
} else {
  loadProjects();
}
