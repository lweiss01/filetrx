const state = {
  items: [],
  urls: [],
  view: "active"
};

const form = document.getElementById("share-form");
const statusNode = document.getElementById("status");
const itemsNode = document.getElementById("items");
const emptyNode = document.getElementById("empty-state");
const urlListNode = document.getElementById("url-list");
const template = document.getElementById("item-template");
const versionNode = document.getElementById("app-version");
const phoneSetupNode = document.getElementById("phone-setup");
const phoneSetupToggleButton = document.getElementById("phone-setup-toggle");
const viewActiveButton = document.getElementById("view-active");
const viewArchivedButton = document.getElementById("view-archived");
const activeCountNode = document.getElementById("active-count");
const archivedCountNode = document.getElementById("archived-count");

const PHONE_SETUP_STORAGE_KEY = "filetrx.phoneSetupCollapsed";
const INBOX_VIEW_STORAGE_KEY = "filetrx.inboxView";

function formatTime(iso) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function setStatus(message, isError = false) {
  statusNode.textContent = message;
  statusNode.style.color = isError ? "#8b1e19" : "";
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "absolute";
  helper.style.left = "-9999px";
  document.body.append(helper);
  helper.select();

  const copied = document.execCommand("copy");
  helper.remove();
  return copied;
}

function setPhoneSetupCollapsed(collapsed) {
  if (!phoneSetupNode || !phoneSetupToggleButton) {
    return;
  }

  phoneSetupNode.hidden = collapsed;
  phoneSetupToggleButton.textContent = collapsed ? "Show setup" : "Hide setup";
  phoneSetupToggleButton.setAttribute("aria-expanded", String(!collapsed));
}

function setupPhonePanelToggle() {
  if (!phoneSetupNode || !phoneSetupToggleButton) {
    return;
  }

  let collapsed = false;

  try {
    collapsed = localStorage.getItem(PHONE_SETUP_STORAGE_KEY) === "1";
  } catch (_error) {
    collapsed = false;
  }

  setPhoneSetupCollapsed(collapsed);

  phoneSetupToggleButton.addEventListener("click", () => {
    const nextCollapsed = !phoneSetupNode.hidden;
    setPhoneSetupCollapsed(nextCollapsed);

    try {
      localStorage.setItem(PHONE_SETUP_STORAGE_KEY, nextCollapsed ? "1" : "0");
    } catch (_error) {
      // Ignore browsers/settings that block localStorage.
    }
  });
}

function renderUrls(urls) {
  urlListNode.replaceChildren();

  urls.forEach((url) => {
    const anchor = document.createElement("a");
    anchor.className = "url-chip";
    anchor.href = url;
    anchor.textContent = url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer noopener";
    urlListNode.append(anchor);
  });
}

function isArchived(item) {
  return Boolean(item?.archivedAt);
}

function getVisibleItems() {
  if (state.view === "archived") {
    return state.items.filter((item) => isArchived(item));
  }
  return state.items.filter((item) => !isArchived(item));
}

function renderInboxCounts() {
  const activeCount = state.items.filter((item) => !isArchived(item)).length;
  const archivedCount = state.items.filter((item) => isArchived(item)).length;

  if (activeCountNode) {
    activeCountNode.textContent = String(activeCount);
  }
  if (archivedCountNode) {
    archivedCountNode.textContent = String(archivedCount);
  }
}

function syncViewButtons() {
  const activeSelected = state.view === "active";

  if (viewActiveButton) {
    viewActiveButton.classList.toggle("is-active", activeSelected);
    viewActiveButton.setAttribute("aria-selected", String(activeSelected));
  }

  if (viewArchivedButton) {
    viewArchivedButton.classList.toggle("is-active", !activeSelected);
    viewArchivedButton.setAttribute("aria-selected", String(!activeSelected));
  }
}

function setInboxView(nextView, shouldPersist = true) {
  state.view = nextView === "archived" ? "archived" : "active";
  syncViewButtons();
  renderItems();

  if (shouldPersist) {
    try {
      localStorage.setItem(INBOX_VIEW_STORAGE_KEY, state.view);
    } catch (_error) {
      // Ignore storage issues.
    }
  }
}

function setupInboxViewToggle() {
  let savedView = "active";

  try {
    const raw = localStorage.getItem(INBOX_VIEW_STORAGE_KEY);
    if (raw === "archived") {
      savedView = "archived";
    }
  } catch (_error) {
    savedView = "active";
  }

  if (viewActiveButton) {
    viewActiveButton.addEventListener("click", () => setInboxView("active"));
  }

  if (viewArchivedButton) {
    viewArchivedButton.addEventListener("click", () => setInboxView("archived"));
  }

  setInboxView(savedView, false);
}

async function updateArchiveState(itemId, archived) {
  const response = await fetch(`/api/items/${encodeURIComponent(itemId)}/archive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ archived })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Could not update archive state.");
  }

  return payload.item;
}

function renderItems() {
  const visibleItems = getVisibleItems();
  itemsNode.replaceChildren();

  emptyNode.hidden = visibleItems.length > 0;
  emptyNode.textContent =
    state.view === "archived"
      ? "No archived drops yet. Archive items from the Inbox tab to keep them for later."
      : "Nothing yet. Send a screenshot or link from your phone to see it here.";

  visibleItems.forEach((item) => {
    const fragment = template.content.cloneNode(true);
    const root = fragment.querySelector(".item");
    const pill = fragment.querySelector(".pill");
    const time = fragment.querySelector("time");
    const note = fragment.querySelector(".item-note");
    const link = fragment.querySelector(".item-link");
    const imageLink = fragment.querySelector(".item-image-link");
    const image = fragment.querySelector(".item-image");
    const pathButton = fragment.querySelector(".item-path-button");
    const archiveButton = fragment.querySelector(".item-archive-button");
    const archived = isArchived(item);

    pill.textContent = item.type;
    time.textContent = formatTime(item.createdAt);
    time.dateTime = item.createdAt;
    note.textContent = item.note || "";

    if (item.url) {
      link.href = item.url;
      link.textContent = item.url;
    } else {
      link.remove();
    }

    if (item.file?.url) {
      imageLink.href = item.file.url;
      image.title = item.file.displayName || "Open image";
      image.src = item.file.url;
    } else {
      imageLink.remove();
    }

    if (item.file?.absPath) {
      pathButton.addEventListener("click", async () => {
        const originalLabel = pathButton.textContent;

        try {
          const copied = await copyTextToClipboard(item.file.absPath);
          pathButton.textContent = copied ? "Copied" : "Copy failed";
          setStatus(copied ? "Copied image path to clipboard." : "Could not copy image path.", !copied);
        } catch (_error) {
          pathButton.textContent = "Copy failed";
          setStatus("Could not copy image path.", true);
        }

        setTimeout(() => {
          pathButton.textContent = originalLabel;
        }, 1200);
      });
    } else {
      pathButton.remove();
    }

    archiveButton.textContent = archived ? "Unarchive" : "Archive";
    archiveButton.classList.toggle("is-archived", archived);
    archiveButton.addEventListener("click", async () => {
      archiveButton.disabled = true;
      archiveButton.textContent = archived ? "Restoring..." : "Archiving...";

      try {
        const updatedItem = await updateArchiveState(item.id, !archived);
        state.items = state.items.map((entry) => (entry.id === updatedItem.id ? updatedItem : entry));
        renderInboxCounts();
        renderItems();
        setStatus(!archived ? "Archived drop." : "Drop restored to Inbox.");
      } catch (error) {
        setStatus(error.message || "Could not update archive state.", true);
      } finally {
        if (archiveButton.isConnected) {
          archiveButton.disabled = false;
          archiveButton.textContent = archived ? "Unarchive" : "Archive";
        }
      }
    });

    itemsNode.append(root);
  });
}

function applyState(nextState) {
  state.items = Array.isArray(nextState.items) ? nextState.items : [];
  state.urls = Array.isArray(nextState.urls) ? nextState.urls : [];

  if (versionNode) {
    const version = typeof nextState.appVersion === "string" ? nextState.appVersion : "--";
    versionNode.textContent = "v" + version;
  }

  renderUrls(state.urls);
  renderInboxCounts();
  renderItems();
}

async function loadState() {
  const response = await fetch("/api/state");
  const payload = await response.json();
  applyState(payload);
}

async function submitShare(event) {
  event.preventDefault();
  const button = form.querySelector("button");
  const payload = new FormData(form);

  button.disabled = true;
  setStatus("Sending...");

  try {
    const response = await fetch("/api/share", {
      method: "POST",
      body: payload
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Share failed.");
    }

    form.reset();
    setStatus("Sent. Your laptop inbox is updated.");
    setInboxView("active");
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    button.disabled = false;
  }
}

function connectEvents() {
  const source = new EventSource("/events");

  source.onmessage = (event) => {
    applyState(JSON.parse(event.data));
  };

  source.onerror = () => {
    source.close();
    setTimeout(connectEvents, 2000);
  };
}

setupPhonePanelToggle();
setupInboxViewToggle();
form.addEventListener("submit", submitShare);
loadState().catch(() => {
  setStatus("Could not load the current inbox.", true);
});
connectEvents();