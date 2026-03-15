const state = {
  items: [],
  urls: []
};

const form = document.getElementById("share-form");
const statusNode = document.getElementById("status");
const itemsNode = document.getElementById("items");
const emptyNode = document.getElementById("empty-state");
const urlListNode = document.getElementById("url-list");
const template = document.getElementById("item-template");

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

function renderItems(items) {
  itemsNode.replaceChildren();
  emptyNode.hidden = items.length > 0;

  items.forEach((item) => {
    const fragment = template.content.cloneNode(true);
    const root = fragment.querySelector(".item");
    const pill = fragment.querySelector(".pill");
    const time = fragment.querySelector("time");
    const note = fragment.querySelector(".item-note");
    const link = fragment.querySelector(".item-link");
    const imageLink = fragment.querySelector(".item-image-link");
    const image = fragment.querySelector(".item-image");

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

    itemsNode.append(root);
  });
}

function applyState(nextState) {
  state.items = Array.isArray(nextState.items) ? nextState.items : [];
  state.urls = Array.isArray(nextState.urls) ? nextState.urls : [];
  renderUrls(state.urls);
  renderItems(state.items);
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

form.addEventListener("submit", submitShare);
loadState().catch(() => {
  setStatus("Could not load the current inbox.", true);
});
connectEvents();