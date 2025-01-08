function moveContextSubmenu(evt) {
    let featureSelected = evt.currentTarget;
    // let n = submenu.length;
    // console.log(featureSelected.offsetTop);
    // console.log(featureSelected.offsetLeft);
    // console.log(featureSelected.right);
    // console.log(featureSelected.bottom);
    // console.log(featureSelected.offsetWidth);
  
    // console.log(featureSelected);
    // console.log(featureSelected.children[0]);
  
    featureSelected.children[0].style.top = featureSelected.offsetTop + "px";
    featureSelected.children[0].style.left = featureSelected.offsetWidth + "px";
  
    // console.log(submenu.length);
    // console.log(submenu[1]);
  
    let x = evt.clientX;
    let y = evt.clientY;
    // list.style.display = "block";
    // // list.style.top = y + "px";
    // list.style.top = "0px";
    // list.style.left = x + "px";
  
    //prevent page overflow
    let winWidth = window.innerWidth;
    let winHeight = window.innerHeight;
    let secMargin = 20;
    let menuRect = featureSelected.getBoundingClientRect();
    let submenuRect = featureSelected.children[0].getBoundingClientRect();
  
    if (submenuRect.x + submenuRect.width > winWidth) {
      featureSelected.children[0].style.left = -submenuRect.width + "px";
    }
  
    if (submenuRect.y + submenuRect.height > winHeight) {
      featureSelected.children[0].style.top = winHeight - submenuRect.height + "px";
    }
  
    // console.log(winWidth);
    // console.log(winHeight);
    // console.log(secMargin);
  
    // if (x + menuWidth > winWidth) {
    //   list.style.left = winWidth - menuWidth - secMargin + "px";
    // }
  
    // if (y + menuHeight > winHeight) {
    //   list.style.top = winHeight - menuHeight - secMargin + "px";
    // }  
  }

  export { moveContextSubmenu }