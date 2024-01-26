const loadLocalStorage = () => {
  const savedData = JSON.parse(localStorage.getItem("list"));

  if (Array.isArray(savedData)) {
    return savedData;
  } else {
    return [
      {
        id: 1,
        type: "file",
        name: "welcome",
        content: "welcome to my notes app.",
      },
    ];
  }
};

let notes = loadLocalStorage();
let allNotesElement;

const noteList = document.querySelector(".notes-container");
const noteTitleContent = document.querySelector(".title");
const noteContent = document.querySelector(".textarea");

document.addEventListener("DOMContentLoaded", () => {
  renderSidebar();
  if (noteContent.textContent.trim() === "") {
    noteContent.innerHTML = noContentElement();
  }
});

document.querySelector("#add-note").addEventListener("click", () => {
  const name = prompt("Nama notes : ");
  if (!name) return;
  notes.push({
    id: getLastUsedId() + 1,
    type: "file",
    name: name,
    content: "",
  });
  saveData();
  renderSidebar();
});

document.querySelector("#add-folder").addEventListener("click", () => {
  const name = prompt("Nama folder : ");
  if (!name) return;
  notes.push({
    id: getLastUsedId() + 1,
    type: "folder",
    name: name,
    files: [],
  });
  saveData();
  renderSidebar();
});

const saveData = () => {
  localStorage.setItem("list", JSON.stringify(notes));
};

// function on content
const clickedNote = (noteList) => {
  noteList.forEach((note) => {
    note.querySelector(".file-info").addEventListener("click", () => {
      const id = Number(note.id.split("-")[1]);
      renderContent(id);
    });
  });
};

const findNoteById = (id, data) => {
  for (const item of data) {
    if (item.id === id) {
      return item;
    }

    if (item.type === "folder" && item.files) {
      const result = findNoteById(id, item.files);
      if (result) {
        return result;
      }
    }
  }
  return null;
};

const renderContent = (id) => {
  let note = findNoteById(id, notes);
  if (!note) {
    noteTitleContent.innerHTML = "";
    noteContent.innerHTML = noContentElement();
    return;
  }

  if (note.type === "folder") return;

  noteTitleContent.innerHTML = noteTitleElement(note) + saveButtonElement();
  noteContent.innerHTML = noteContentElement(note);
  const input = document.querySelector("#input");
  input.value = note.content;

  const saveButton = document.querySelector(".save-button");
  saveButton.addEventListener("click", () => {
    saveNotes(id, input.value, notes);
    note = findNoteById(id, notes);
  });

  const closeButton = document.querySelector("#close-button");
  closeButton.addEventListener("click", () => {
    if (input.value != note.content) {
      const isSave = confirm("Close without save?");
      if (isSave) {
        noteTitleContent.innerHTML = "";
        noteContent.innerHTML = noContentElement();
        return;
      }
    } else {
      noteTitleContent.innerHTML = "";
      noteContent.innerHTML = noContentElement();
    }
  });
};

const saveNotes = (id, content, data) => {
  for (const note of data) {
    if (note.id === id && note.type === "file") {
      note.content = content;
    }

    if (note.type === "folder" && note.files) {
      saveNotes(id, content, note.files);
    }
  }
  saveData();
};

// function on sidebar
const renderSidebar = () => {
  let element = "";
  if (notes.length === 0) return (noteList.innerHTML = noNotesElement());
  notes.forEach((note) => {
    if (note.type === "folder") {
      element += folderElement(note);
    } else if (note.type === "file") {
      element += noteElement(note);
    }
    noteList.innerHTML = element;
  });
  allNotesElement = document.querySelectorAll(".note");
  clickedNote(allNotesElement);

  const folders = document.querySelectorAll(".folder");
  folders.forEach((folder) => {
    folder.querySelector(".toggle").addEventListener("click", () => {
      const list = folder.querySelector(`.note-list`);
      if (list.style.display !== "none") {
        folder.querySelector(".toggle").classList.remove("fa-angle-up");
        folder.querySelector(".toggle").classList.add("fa-angle-down");
        list.style.display = "none";
      } else {
        folder.querySelector(".toggle").classList.remove("fa-angle-down");
        folder.querySelector(".toggle").classList.add("fa-angle-up");
        list.style.display = "block";
      }
    });
    folder
      .querySelector("#add-file-to-folder")
      .addEventListener("click", () => {
        const id = Number(folder.id.split("-")[1]);
        const name = prompt("Nama file : ");
        if (!name) return;
        for (const note of notes) {
          if (note.id === id) {
            note.files.push({
              id: getLastUsedId() + 1,
              type: "file",
              name: name,
              content: "",
            });
          }
        }
        saveData();
        renderSidebar();
      });

    folder.querySelector(".rename").addEventListener("click", () => {
      const id = Number(folder.id.split("-")[1]);
      rename(id);
    });

    folder.querySelector(".delete").addEventListener("click", () => {
      const id = Number(folder.id.split("-")[1]);
      remove(id);
    });
  });

  const allNotes = document.querySelectorAll(".note");
  allNotes.forEach((note) => {
    note.querySelector(".rename").addEventListener("click", () => {
      const id = Number(note.id.split("-")[1]);
      rename(id);
    });

    note.querySelector(".delete").addEventListener("click", () => {
      const id = Number(note.id.split("-")[1]);
      remove(id);
    });
  });
};

const getLastUsedId = () => {
  let lastUsedId = 0;

  notes.forEach((note) => {
    if (note.id > lastUsedId) {
      lastUsedId = note.id;
    }

    if (note.type === "folder" && note.files) {
      note.files.forEach((file) => {
        if (file.id > lastUsedId) {
          lastUsedId = file.id;
        }
      });
    }
  });

  return lastUsedId;
};

const rename = (id) => {
  const newName = prompt("Nama baru : ");
  if (!newName) return;
  for (const note of notes) {
    if (note.type === "file") {
      if (note.id === id) {
        note.name = newName;
        break;
      }
    }
    if (note.type === "folder") {
      if (note.id === id) {
        note.name = newName;
        break;
      } else {
        if (note.files) {
          for (const noteInFolder of note.files) {
            if (noteInFolder.id === id) {
              noteInFolder.name = newName;
              break;
            }
          }
        }
      }
    }
  }
  saveData();
  renderSidebar();
  if (
    Number(noteTitleContent.querySelector(".note-title").id.split("-")[2]) ===
    findNoteById(id, notes).id
  ) {
    renderContent(id);
  }
};

const remove = (id) => {
  let noteInFolderId, openedNoteId;
  const isRemove = confirm("Hapus element?");
  if (!isRemove) return;

  if (document.querySelector(".note-title")) {
    openedNoteId = Number(
      document.querySelector(".note-title").id.split("-")[2]
    );
  }

  const folderToRemove = notes.find(
    (note) => note.type === "folder" && note.id === id
  );

  if (folderToRemove) {
    noteInFolderId = folderToRemove.files.find(
      (note) => note.id === openedNoteId
    ).id;
  }

  const newNotes = notes.filter((note) => {
    if (note.type === "file") {
      return note.id !== id;
    }
    if (note.type === "folder") {
      if (note.id !== id) {
        if (note.files) {
          note.files = note.files.filter((file) => file.id !== id);
        }
        return true;
      }
    }
    return false;
  });
  notes = newNotes;
  saveData();
  renderSidebar();
  if (openedNoteId === id || noteInFolderId === openedNoteId) {
    renderContent(id);
  }
};

// element function
const folderElement = (folder) => {
  const notes = folder.files.map((file) => noteElement(file)).join("");
  return `
    <div class="folder" id="folder-${folder.id}">
        <div class="info">
            <div>
            <i class="fa-solid fa-folder"></i>
            <p>${folder.name}</p>
            </div>
            <div>
              <i id="add-file-to-folder" class="fa-solid fa-square-plus"></i>
              <i class="fa-solid fa-square-pen rename" style="color: #fff;"></i>
              <i class="fa-solid fa-trash delete"></i>
              <i class="fa-solid fa-angle-up toggle"></i>
            </div>
        </div>
        <div class="note-list">
            ${notes}
        </div>
    </div>
  `;
};

const noteElement = (note) => {
  return `
    <div class="note" id="note-${note.id}">
      <div class="file-info">
        <i class="fa-solid fa-file" style="color: #27374d"></i>
        <p>${note.name}</p>
      </div>
      <div class="file-action">
        <i class="fa-solid fa-square-pen rename" style="color: #27374d;"></i>
        <i class="fa-solid fa-trash delete" style="color: #27374d"></i>
      </div>
    </div>
    `;
};

const noteTitleElement = (note) => {
  return `
    <div id="opened-note-${note.id}" class="note-title">
        <i class="fa-solid fa-file logo"></i>
        <p>${note.name}</p>
        <i id="close-button" class="fa-solid fa-xmark close"></i>
    </div>
    `;
};

const noteContentElement = (note) => {
  return `
    <textarea
        name="input"
        id="input"
        class="input-note-here"
    ></textarea>
    `;
};

const saveButtonElement = () => {
  return `
    <button class="save-button">
      Save
    </button>
  `;
};

const noContentElement = () => {
  return `
    <div class="no-content">
      <img src="assets/img/icon/favicon.svg" alt="icon app" />
      <h1>No notes have been opened yet.</h1>
    </div>
  `;
};

const noNotesElement = () => {
  return `
    <p class="no-notes">Nothing here.</p>
  `;
};
