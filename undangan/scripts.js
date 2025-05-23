import { tambahUcapan, listenUcapanRealtime } from "./firebase.js";

window.onload = function () {
  showModal();
  changeNamaUndanganFromURL();
  autofillNamaForm();
  setViewportHeight();
};
window.addEventListener("resize", setViewportHeight);
window.addEventListener("load", setViewportHeight);

function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
  const outerFrame = document.getElementById("outerFrame");
  if (outerFrame) {
    outerFrame.style.height = `calc(var(--vh, 1vh) * 100 - 100px)`;
  }
}

function showModal() {
  const modal = document.getElementById("fullscreenModal");
  if (modal) modal.style.display = "flex";
}

document
  .getElementById("btnBukaUndangan")
  .addEventListener("click", bukaUndangan);

function bukaUndangan() {
  const modal = document.getElementById("fullscreenModal");
  if (!modal) return;

  modal.classList.add("close");

  setTimeout(() => {
    modal.style.display = "none";
  }, 500);

  const audio = document.getElementById("audioPlayer");
  if (audio) {
    audio.volume = 0.5;
    audio.play();
  }
}

function changeNamaUndanganFromURL() {
  const params = new URLSearchParams(window.location.search);
  const namaUndangan = params.get("kepada");
  if (namaUndangan) {
    const namaUndanganElement = document.querySelector(".modal-nama");
    if (namaUndanganElement) {
      namaUndanganElement.textContent = namaUndangan;
    }
  }
}

function autofillNamaForm() {
  const params = new URLSearchParams(window.location.search);
  const namaForm = params.get("kepada");
  if (namaForm) {
    const inputNama = document.querySelector("#nama");
    if (inputNama) {
      inputNama.value = namaForm;
    }
  }
}

document
  .getElementById("doaForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const nama = document.getElementById("nama").value.trim();
    const ucapan = document.getElementById("ucapan").value.trim();
    const kehadiran = document.getElementById("kehadiran").value === "Hadir";

    if (!nama || !ucapan) {
      alert("Nama dan ucapan tidak boleh kosong.");
      return;
    }

    try {
      const msg = await tambahUcapan(nama, ucapan, kehadiran);
      alert(msg);
      document.getElementById("doaForm").reset();
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim ucapan.");
    }
  });

const carousel = document.getElementById("carousel");
const slidesContainer = carousel ? carousel.querySelector(".slides") : null;

function populateSlides(data) {
  data.forEach((item) => {
    const slide = document.createElement("section");
    slide.classList.add("slide");

    const content = document.createElement("div");
    content.style.display = "flex";
    content.style.flexDirection = "column";
    content.style.alignItems = "center";

    const fullText = item.teks.replace(/\n/g, " ");
    const rawText = item.teks;

    const words = fullText.trim().split(/\s+/);
    const newlineCount = (item.teks.match(/\n/g) || []).length;
    const isLong = words.length > 14 || newlineCount > 2;

    const shortText = isLong ? words.slice(0, 14).join(" ") + "..." : fullText;

    const blockquote = document.createElement("blockquote");
    blockquote.innerHTML = `“${shortText}”`;

    const footer = document.createElement("footer");
    footer.textContent = `— ${item.pengirim}`;

    if (isLong) {
      blockquote.style.cursor = "pointer";
      blockquote.addEventListener("click", () => {
        showUcapanModal(rawText, item.pengirim);
      });
    }

    content.appendChild(blockquote);
    content.appendChild(footer);
    slide.appendChild(content);
    slidesContainer.appendChild(slide);
  });
}

function showUcapanModal(teks, pengirim) {
  const modal = document.getElementById("modalUcapan");
  if (!modal) return;

  document.getElementById("modalUcapanText").innerHTML = teks.replace(
    /\n/g,
    "<br>"
  );
  document.getElementById("modalUcapanNama").textContent = pengirim;
  modal.style.display = "flex";
}

document.getElementById("btnCloseModalUcapan").addEventListener("click", () => {
  const modal = document.getElementById("modalUcapan");
  if (modal) modal.style.display = "none";
});

// Inisialisasi real-time listener
listenUcapanRealtime((data) => {
  if (!slidesContainer) return;
  const tampil = data.map((item) => ({
    teks: item.ucapan,
    pengirim: item.nama,
  }));

  slidesContainer.innerHTML = "";
  populateSlides(tampil);
});
