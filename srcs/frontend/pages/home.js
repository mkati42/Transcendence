import { createUserOperationsPane } from "./userOperationsPane.js";

export async function homePage() {
  const container = document.createElement("div");
  container.className = "home-page container my-5";

  const title = document.createElement("h2");
  title.textContent = "Home Page";
  container.appendChild(title);

  const userPane = await createUserOperationsPane();
  container.appendChild(userPane);

  const otherContent = document.createElement("div");
  otherContent.className = "mt-5";
  otherContent.innerHTML = `
    <h3>Other Section</h3>
    <p>Put your additional home page content here.</p>
  `;
  container.appendChild(otherContent);

  return container;
}
