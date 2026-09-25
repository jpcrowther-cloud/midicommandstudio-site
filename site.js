(function () {
  "use strict";

  document.documentElement.classList.add("site-nav-enhanced");

  var disclosureMenus = Array.prototype.slice.call(document.querySelectorAll("details[data-nav-menu]"));
  var mobileToggle = document.querySelector("[data-mobile-toggle]");
  var mobilePanel = mobileToggle
    ? document.getElementById(mobileToggle.getAttribute("aria-controls"))
    : null;

  if (!disclosureMenus.length && !mobileToggle) return;

  function getSummary(details) {
    return details.querySelector(":scope > summary");
  }

  function setExpanded(details) {
    var summary = getSummary(details);
    if (summary) summary.setAttribute("aria-expanded", details.open ? "true" : "false");
  }

  function closeMenu(details) {
    if (!details.open) return;
    details.open = false;
    setExpanded(details);
  }

  function closeSiblingMenus(details) {
    var parent = details.parentElement;
    if (!parent) return;

    Array.prototype.forEach.call(parent.children, function (candidate) {
      if (candidate !== details && candidate.matches("details[data-nav-menu]")) {
        closeMenu(candidate);
      }
    });
  }

  disclosureMenus.forEach(function (details) {
    setExpanded(details);

    details.addEventListener("toggle", function () {
      setExpanded(details);

      if (details.open) closeSiblingMenus(details);
    });
  });

  function setMobileOpen(open) {
    if (!mobileToggle || !mobilePanel) return;
    mobileToggle.setAttribute("aria-expanded", open ? "true" : "false");
    mobilePanel.hidden = !open;

    if (!open) {
      disclosureMenus.forEach(function (details) {
        if (mobilePanel.contains(details)) closeMenu(details);
      });
    }
  }

  if (mobileToggle && mobilePanel) {
    setMobileOpen(false);
    mobileToggle.addEventListener("click", function () {
      var willOpen = mobileToggle.getAttribute("aria-expanded") !== "true";
      setMobileOpen(willOpen);
      if (willOpen) {
        disclosureMenus.forEach(function (details) {
          if (!mobilePanel.contains(details)) closeMenu(details);
        });
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;

    var openMenus = disclosureMenus.filter(function (details) {
      return details.open && details.contains(document.activeElement);
    });

    if (!openMenus.length) {
      openMenus = disclosureMenus.filter(function (details) {
        return details.open;
      });
    }

    if (!openMenus.length) {
      if (mobileToggle && mobileToggle.getAttribute("aria-expanded") === "true") {
        setMobileOpen(false);
        mobileToggle.focus();
      }
      return;
    }

    var menu = openMenus[openMenus.length - 1];
    var summary = getSummary(menu);
    closeMenu(menu);
    if (summary) summary.focus();
  });

  document.addEventListener("click", function (event) {
    disclosureMenus.forEach(function (details) {
      if (details.open && !details.contains(event.target)) closeMenu(details);
    });

    if (
      mobileToggle &&
      mobilePanel &&
      mobileToggle.getAttribute("aria-expanded") === "true" &&
      !mobileToggle.contains(event.target) &&
      !mobilePanel.contains(event.target)
    ) {
      setMobileOpen(false);
    }
  });
})();
