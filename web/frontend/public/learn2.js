const sideNav = document.getElementById("sideNav");
const headings = document.querySelectorAll("h1, h2");

function getHeadingsStructure() {
  const structure = [];
  let currentH1 = null;

  headings.forEach((heading) => {
    if (heading.tagName === "H1") {
      currentH1 = {
        element: heading,
        h2: [],
        textContent: heading.textContent,
      };
      structure.push(currentH1);
    } else if (heading.tagName === "H2" && currentH1) {
      currentH1.h2.push({ element: heading, textContent: heading.textContent });
    }
  });

  return structure;
}
const hi = getHeadingsStructure();
console.log(hi);

function createAnchorLinks() {
  headings.forEach((h) => {
    h.id = `${h.textContent.replace(" ", "_")}`;
    // const anchor = document.createElement("a");
    // anchor.href = `#${h1.id}`;
    // anchor.textContent = h1.textContent;
    // h1.appendChild(anchor);
  });
}
createAnchorLinks();

function createSideNav() {
  const list1 = document.createElement("ul");
  hi.forEach((h1) => {
    const list1Item = document.createElement("li");
    const link = document.createElement("a");
    const list2 = document.createElement("ul");

    link.href = `#${h1.textContent.replace(" ", "_")}`;
    link.textContent = h1.textContent;

    list1Item.appendChild(link);
    list1Item.appendChild(list2);
    list1.appendChild(list1Item);

    h1.h2.forEach((h2) => {
      const list2Item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${h2.textContent.replace(" ", "_")}`;
      console.log(link.href);
      link.textContent = h2.textContent;
      list2Item.appendChild(link);
      list2.appendChild(list2Item);
    });
  });
  sideNav.appendChild(list1);
}
createSideNav();

// function generateHeadingsNavigation() {
//   const headings = [...document.querySelectorAll("h1, h2")];
//   const structure = [];
//   const sideNav = document.createElement("nav");
//   const ul = document.createElement("ul");
//   let currentH1 = null;
//   let headingIndex = 0;

//   headings.forEach((heading) => {
//     // Assign a unique ID if missing
//     if (!heading.id) {
//       heading.id = `heading-${headingIndex++}`;
//     }

//     // Create anchor link for navigation
//     const link = document.createElement("a");
//     link.href = `#${heading.id}`;
//     link.textContent = heading.textContent.trim();

//     if (heading.tagName === "H1") {
//       // Create structure entry
//       currentH1 = { text: heading.textContent.trim(), id: heading.id, h2: [] };
//       structure.push(currentH1);

//       // Create nav entry
//       const li = document.createElement("li");
//       li.appendChild(link);
//       const subUl = document.createElement("ul");
//       li.appendChild(subUl);
//       ul.appendChild(li);

//       // Attach the sublist to the current H1
//       currentH1.navElement = subUl;
//     } else if (heading.tagName === "H2" && currentH1) {
//       // Add to structure
//       currentH1.h2.push({ text: heading.textContent.trim(), id: heading.id });

//       // Add to nav
//       const subLi = document.createElement("li");
//       subLi.appendChild(link);
//       currentH1.navElement.appendChild(subLi);
//     }
//   });

//   sideNav.appendChild();

//   return structure; // Return structured data
// }

// // Run the function and log the structured output
// console.log(generateHeadingsNavigation());

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});
