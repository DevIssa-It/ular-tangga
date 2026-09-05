import { QuizQuestion } from '../types';

export const DEFAULT_QUIZ_QUESTIONS: QuizQuestion[] = [
  // Kategori: Sains & Teknologi
  {
    id: 's-1', category: 'Sains',
    question: 'Planet apa yang dikenal sebagai Planet Merah dalam tata surya kita?',
    options: ['Venus', 'Mars', 'Jupiter', 'Merkurius'], correctIndex: 1,
    explanation: 'Mars tampak merah karena permukaan tanahnya kaya akan besi oksida (karat).'
  },
  {
    id: 's-2', category: 'Sains',
    question: 'Unsur kimia apa yang memiliki simbol "Au" di tabel periodik?',
    options: ['Perak', 'Tembaga', 'Emas', 'Aluminium'], correctIndex: 2,
    explanation: '"Au" berasal dari bahasa Latin "Aurum", yang berarti emas bersinar.'
  },
  {
    id: 's-3', category: 'Sains',
    question: 'Organ tubuh manusia mana yang berfungsi memompa darah ke seluruh tubuh?',
    options: ['Paru-paru', 'Hati', 'Ginjal', 'Jantung'], correctIndex: 3,
    explanation: 'Jantung berdetak memompa darah beroksigen ke seluruh jaringan tubuh.'
  },
  {
    id: 's-4', category: 'Sains',
    question: 'Gas apa yang paling banyak terkandung di atmosfer Bumi?',
    options: ['Oksigen', 'Nitrogen', 'Karbon Dioksida', 'Helium'], correctIndex: 1,
    explanation: 'Nitrogen mencakup sekitar 78% dari total volume atmosfer bumi kita.'
  },
  {
    id: 's-5', category: 'Sains',
    question: 'Siapakah ilmuwan yang mengemukakan Teori Relativitas?',
    options: ['Isaac Newton', 'Albert Einstein', 'Nikola Tesla', 'Galileo Galilei'], correctIndex: 1,
    explanation: 'Albert Einstein menerbitkan Teori Relativitas Khusus pada tahun 1905.'
  },
  {
    id: 's-6', category: 'Sains',
    question: 'Berapa jumlah kromosom normal pada sel tubuh manusia?',
    options: ['23 pasang (46)', '20 pasang (40)', '24 pasang (48)', '22 pasang (44)'], correctIndex: 0,
    explanation: 'Sel somatik manusia normal memiliki 23 pasang (total 46) kromosom.'
  },
  {
    id: 's-7', category: 'Sains',
    question: 'Satuan internasional untuk hambatan listrik adalah...',
    options: ['Volt', 'Ampere', 'Watt', 'Ohm'], correctIndex: 3,
    explanation: 'Ohm (lambang Ω) adalah satuan SI untuk resistansi / hambatan listrik.'
  },
  {
    id: 's-8', category: 'Sains',
    question: 'Apa proses perubahan wujud zat dari gas langsung menjadi padat?',
    options: ['Mengkristal (Deposisi)', 'Menyublim', 'Mengembun', 'Membeku'], correctIndex: 0,
    explanation: 'Deposisi atau mengkristal adalah perubahan fasa gas menjadi padat langsung.'
  },

  // Kategori: Logika & Matematika
  {
    id: 'l-1', category: 'Logika',
    question: 'Jika 3 kucing tangkap 3 tikus dalam 3 menit, berapa menit 100 kucing tangkap 100 tikus?',
    options: ['100 menit', '3 menit', '30 menit', '1 menit'], correctIndex: 1,
    explanation: 'Setiap 1 kucing butuh 3 menit untuk menangkap 1 tikus secara bersamaan.'
  },
  {
    id: 'l-2', category: 'Logika',
    question: 'Berapa hasil dari: 8 + 2 × 5 - 4 ?',
    options: ['46', '14', '18', '24'], correctIndex: 1,
    explanation: 'Operasi perkalian didahulukan: 2 × 5 = 10, lalu 8 + 10 = 18, dan 18 - 4 = 14.'
  },
  {
    id: 'l-3', category: 'Logika',
    question: 'Kelanjutan deret angka: 2, 4, 8, 16, 32, ... adalah?',
    options: ['48', '64', '56', '72'], correctIndex: 1,
    explanation: 'Setiap angka dikalikan 2: 32 × 2 = 64.'
  },
  {
    id: 'l-4', category: 'Logika',
    question: 'Teratai melipatgandakan luas tiap hari. Hari ke-20 penuh. Hari ke berapa separuh?',
    options: ['Hari ke-10', 'Hari ke-15', 'Hari ke-19', 'Hari ke-18'], correctIndex: 2,
    explanation: 'Sehari sebelum penuh (hari ke-19) luasnya adalah separuh kolam.'
  },
  {
    id: 'l-5', category: 'Logika',
    question: 'Manakah bilangan prima berikut ini?',
    options: ['21', '27', '29', '35'], correctIndex: 2,
    explanation: '29 hanya habis dibagi oleh angka 1 dan 29.'
  },
  {
    id: 'l-6', category: 'Logika',
    question: 'Ibu Budi punya 4 anak: Timur, Barat, Selatan. Siapakah anak keempat?',
    options: ['Utara', 'Tenggara', 'Budi', 'Barat Laut'], correctIndex: 2,
    explanation: 'Pertanyaan menyebutkan "Ibu Budi", jadi anak keempat adalah Budi.'
  },

  // Kategori: Pengetahuan Umum
  {
    id: 'u-1', category: 'Umum',
    question: 'Apa benua terluas di dunia berdasarkan luas daratan?',
    options: ['Afrika', 'Amerika Utara', 'Asia', 'Eropa'], correctIndex: 2,
    explanation: 'Benua Asia mencakup sekitar 30% dari total luas daratan di Bumi.'
  },
  {
    id: 'u-2', category: 'Umum',
    question: 'Samudra terluas dan terdalam di Bumi adalah...',
    options: ['Samudra Atlantik', 'Samudra Hindia', 'Samudra Pasifik', 'Samudra Arktik'], correctIndex: 2,
    explanation: 'Samudra Pasifik membentang lebih dari 165 juta kilometer persegi.'
  },
  {
    id: 'u-3', category: 'Umum',
    question: 'Negara manakah yang dijuluki Negeri Matahari Terbit?',
    options: ['Tiongkok', 'Korea Selatan', 'Jepang', 'Thailand'], correctIndex: 2,
    explanation: 'Nama Jepang (Nihon / Nippon) secara harfiah bermakna "asal muasal matahari".'
  },
  {
    id: 'u-4', category: 'Umum',
    question: 'Berapa warna yang terdapat pada pelangi secara klasik?',
    options: ['5', '6', '7', '8'], correctIndex: 2,
    explanation: 'Me-Ji-Ku-Hi-Bi-Ni-U (Merah, Jingga, Kuning, Hijau, Biru, Nila, Ungu) = 7 warna.'
  },
  {
    id: 'u-5', category: 'Umum',
    question: 'Mata uang resmi yang digunakan di negara Inggris (UK) adalah...',
    options: ['Euro', 'Poundsterling', 'Dolar', 'Franc'], correctIndex: 1,
    explanation: 'Poundsterling (£/GBP) adalah mata uang resmi negara Inggris.'
  },
  {
    id: 'u-6', category: 'Umum',
    question: 'Hewan mamalia darat terbesar yang masih hidup adalah...',
    options: ['Badak Putih', 'Gajah Afrika', 'Jerapah', 'Kuda Nil'], correctIndex: 1,
    explanation: 'Gajah Afrika jantan dewasa dapat memiliki berat mencapai 6.000 kg.'
  },

  // Kategori: Budaya & Nusantara
  {
    id: 'b-1', category: 'Budaya',
    question: 'Candi Buddha terbesar di dunia yang terletak di Magelang, Jawa Tengah adalah...',
    options: ['Candi Prambanan', 'Candi Borobudur', 'Candi Mendut', 'Candi Penataran'], correctIndex: 1,
    explanation: 'Borobudur dibangun pada abad ke-8 dan ke-9 Masehi pada masa Wangsa Syailendra.'
  },
  {
    id: 'b-2', category: 'Budaya',
    question: 'Alat musik tradisional Jawa Barat terbuat dari bambu dan digoyangkan adalah...',
    options: ['Sasando', 'Gamelan', 'Angklung', 'Kolintang'], correctIndex: 2,
    explanation: 'Angklung diakui UNESCO sebagai Warisan Budaya Lisan dan Nonbendawi.'
  },
  {
    id: 'b-3', category: 'Budaya',
    question: 'Rumah adat Minangkabau yang beratap runcing menyerupai tanduk kerbau bernama...',
    options: ['Rumah Gadang', 'Rumah Joglo', 'Rumah Tongkonan', 'Rumah Honai'], correctIndex: 0,
    explanation: 'Rumah Gadang memiliki atap gonjong khas melambangkan tanduk kerbau.'
  },
  {
    id: 'b-4', category: 'Budaya',
    question: 'Tari Saman yang terkenal dengan gerakan serempak cepat berasal dari provinsi...',
    options: ['Sumatera Barat', 'Aceh', 'Riau', 'Jambi'], correctIndex: 1,
    explanation: 'Tari Saman berasal dari suku Gayo di dataran tinggi Aceh.'
  },
  {
    id: 'b-5', category: 'Budaya',
    question: 'Danau vulkanik terbesar di Asia Tenggara yang terletak di Sumatera Utara adalah...',
    options: ['Danau Maninjau', 'Danau Singkarak', 'Danau Toba', 'Danau Matano'], correctIndex: 2,
    explanation: 'Danau Toba terbentuk dari letusan dahsyat supervulkan purba puluhan ribu tahun lalu.'
  },
  {
    id: 'b-6', category: 'Budaya',
    question: 'Senjata tradisional khas suku Dayak di Kalimantan yang terkenal adalah...',
    options: ['Keris', 'Rencong', 'Mandau', 'Badik'], correctIndex: 2,
    explanation: 'Mandau merupakan pusaka pedang tradisional khas suku Dayak.'
  }
];
