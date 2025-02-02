function moveContextSubmenu(evt) {
  let featureSelected = evt.currentTarget;

  featureSelected.children[0].style.top = featureSelected.offsetTop + "px";
  featureSelected.children[0].style.left = featureSelected.offsetWidth + "px";

  //prevent page overflow
  let winWidth = window.innerWidth;
  let winHeight = window.innerHeight;
  let submenuRect = featureSelected.children[0].getBoundingClientRect();

  if (submenuRect.x + submenuRect.width > winWidth) {
    featureSelected.children[0].style.left = -submenuRect.width + "px";
  }

  if (submenuRect.y + submenuRect.height > winHeight) {
    featureSelected.children[0].style.top =
      winHeight - submenuRect.height + "px";
  }
}

export { moveContextSubmenu };
