window.onload = function () {
  showModal();
  changeNamaUndanganFromURL();
  autofillNamaForm();
};

// -- VIEWPORT HEIGHT --
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
  document.getElementById(
    "outerFrame"
  ).style.height = `calc(var(--vh, 1vh) * 100 - 100px)`;
}

window.addEventListener("resize", setViewportHeight);
window.addEventListener("load", setViewportHeight);

function showModal() {
  document.getElementById("fullscreenModal").style.display = "flex";
}

function bukaUndangan() {
  // Tambahkan kelas 'close' untuk memulai animasi
  const modal = document.getElementById("fullscreenModal");
  modal.classList.add("close");

  // Tunggu sampai animasi selesai (0.5s) dan kemudian sembunyikan modal
  setTimeout(function () {
    modal.style.display = "none";
  }, 500); // 500ms adalah durasi animasi
  var audio = document.getElementById("audioPlayer");
  audio.volume = 0.5;
  audio.play();
}

// Fungsi untuk mengambil parameter dari URL dan mengubah nama undangan
function changeNamaUndanganFromURL() {
  const params = new URLSearchParams(window.location.search);
  const namaUndangan = params.get("kepada"); // Mendapatkan nilai parameter 'nama'

  if (namaUndangan) {
    // Jika parameter 'nama' ada, kita ganti teks nama undangan
    const namaUndanganElement = document.querySelector(".modal-nama");
    if (namaUndanganElement) {
      namaUndanganElement.textContent = namaUndangan;
    }
  }
}

// Fungsi untuk menghapus simbol dan karakter khusus selain huruf dan spasi
function removeSpecialCharacters(str) {
  return str.replace(/[^a-zA-Z\s]/g, ""); // Menghapus karakter selain huruf dan spasi
}

// Fungsi untuk mengisi otomatis input nama pada form yang sudah ada
function autofillNamaForm() {
  const params = new URLSearchParams(window.location.search);
  const namaForm = params.get("kepada"); // Mendapatkan nilai parameter 'nama'

  if (namaForm) {
    // Hapus simbol dari nama sebelum mengisi form
    const cleanedNama = removeSpecialCharacters(namaForm);

    // Cek apakah input dengan ID yang sesuai ada di form
    const inputNama = document.querySelector("#nama"); // Ganti dengan ID 'nama'
    if (inputNama) {
      inputNama.value = cleanedNama; // Mengisi otomatis input dengan nama yang sudah dibersihkan
    }
  }
}

// Validasi real-time kolom ucapan
document.getElementById("ucapan").addEventListener("input", function (e) {
  const allowedRegex = /^[a-zA-ZÀ-ÿ.,\s]*$/;
  e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ.,\s]/g, "");
  e.target.value = e.target.value.replace(/[\n\r]/g, " ");
});

// Validasi real-time kolom nama
document.getElementById("nama").addEventListener("input", function (e) {
  e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
});

// Validasi akhir saat submit
document
  .getElementById("doaForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const nama = document.getElementById("nama").value.trim();
    const ucapan = document.getElementById("ucapan").value.trim();
    const kehadiran = document.getElementById("kehadiran").value;

    const ucapanValid = /^[a-zA-ZÀ-ÿ.,\s]{1,120}$/.test(ucapan);
    const namaValid = /^[a-zA-ZÀ-ÿ\s]{1,20}$/.test(nama);

    if (!namaValid) {
      alert("Nama hanya boleh huruf dan spasi (maks 20 karakter).");
      return;
    }

    if (!ucapanValid) {
      alert(
        "Ucapan hanya boleh huruf, spasi, titik, dan koma (maks 120 karakter)."
      );
      return;
    }

    const params = new URLSearchParams({
      ID: "1D8VHItia1C99ZyrHBPq0cv9eT__eYsfHbAs_p_LtgTQ",
      SH: "Sheet1",
      func: "Tambah",
      NAMA: nama,
      UCAPAN: ucapan,
      HADIR: kehadiran,
    });

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbzkHEY19deD1Hm06akSs7OmJGvSTaVdse2gVJx5Cqzd_B4CmoWBG3E0YIkMoV5YJlVaWg/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );

      const text = await response.text();
      alert(text);

      // Reset form
      document.getElementById("doaForm").reset();
    } catch (error) {
      console.error("Gagal mengirim data:", error);
      alert("Gagal mengirim data. Silakan coba lagi.");
    }
  });

const carousel = document.getElementById("carousel");
const slidesContainer = carousel.querySelector(".slides");
const pauseDuration = 5000;
let autoScrollTimer = null;
let index = 0;

// Ganti dengan URL Google Apps Script Anda
const GOOGLE_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbzkHEY19deD1Hm06akSs7OmJGvSTaVdse2gVJx5Cqzd_B4CmoWBG3E0YIkMoV5YJlVaWg/exec?ID=1D8VHItia1C99ZyrHBPq0cv9eT__eYsfHbAs_p_LtgTQ&SH=Sheet1&func=BacaSemua";

// Ambil data dari spreadsheet
async function fetchData() {
  try {
    const res = await fetch(GOOGLE_SHEET_URL);
    const textData = await res.text();
    const lines = textData.trim().split("\n");

    // Kolom: Waktu, Nama, Ucapan, Hadir, Tampilkan
    const ucapanList = lines
      .map((line) => {
        const [waktu, nama, ucapan, hadir, tampilkan] = line.split(",");
        return {
          teks: ucapan,
          pengirim: nama,
          tampilkan: tampilkan?.trim().toLowerCase() === "ya",
        };
      })
      .filter((item) => item.tampilkan); // Hanya tampilkan jika "Tampilkan" == "ya"

    populateSlides(ucapanList);
  } catch (err) {
    console.error("Gagal mengambil data:", err);
  }
}

function populateSlides(data) {
  data.forEach((item) => {
    const slide = document.createElement("section");
    slide.classList.add("slide");

    const content = document.createElement("div");
    content.style.display = "flex";
    content.style.flexDirection = "column";
    content.style.alignItems = "center";

    const blockquote = document.createElement("blockquote");
    blockquote.textContent = `“${item.teks}”`;

    const footer = document.createElement("footer");
    footer.textContent = `— ${item.pengirim}`;

    content.appendChild(blockquote);
    content.appendChild(footer);
    slide.appendChild(content);
    slidesContainer.appendChild(slide);
  });

  startAutoScroll();
}

function updateIndexFromScroll() {
  index = Math.round(carousel.scrollLeft / carousel.clientWidth);
}

function autoScroll() {
  updateIndexFromScroll();
  index = (index + 1) % slidesContainer.children.length;
  carousel.scrollTo({
    left: index * carousel.clientWidth,
    behavior: "smooth",
  });
  autoScrollTimer = setTimeout(autoScroll, pauseDuration);
}

function pauseAutoScroll() {
  clearTimeout(autoScrollTimer);
  autoScrollTimer = setTimeout(autoScroll, pauseDuration);
}

function startAutoScroll() {
  autoScrollTimer = setTimeout(autoScroll, pauseDuration);
}

let isTouching = false;
carousel.addEventListener("touchstart", () => {
  isTouching = true;
  pauseAutoScroll();
});
carousel.addEventListener("touchend", () => {
  isTouching = false;
});
carousel.addEventListener("mousedown", () => pauseAutoScroll());
carousel.addEventListener("scroll", () => {
  if (!isTouching) {
    pauseAutoScroll();
  }
});

// Jalankan fetch
fetchData();
