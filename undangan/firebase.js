import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyCEtoMoBLmlhJyryb3dWbhCVVNgnj1HxSE",
  authDomain: "ucapanudangan.firebaseapp.com",
  projectId: "ucapanudangan",
  storageBucket: "ucapanudangan.appspot.com",
  messagingSenderId: "901453891089",
  appId: "1:901453891089:web:1643ac461cbb70711b53b0",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fungsi untuk menambahkan ucapan
export async function tambahUcapan(nama, ucapan, kehadiran) {
  try {
    await addDoc(collection(db, "ucapan"), {
      nama,
      ucapan,
      kehadiran,
      timestamp: new Date(),
      tampilkan: true,
    });
    return "Ucapan berhasil dikirim!";
  } catch (error) {
    throw new Error("Gagal menyimpan ucapan: " + error.message);
  }
}

// Fungsi untuk membaca semua ucapan yang tampil = true
export function listenUcapanRealtime(callback) {
  const q = query(collection(db, "ucapan"), orderBy("timestamp", "desc"));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs
      .map((doc) => doc.data())
      .filter((doc) => doc.tampilkan !== false); // hanya tampilkan jika true / undefined
    callback(data);
  });
}
