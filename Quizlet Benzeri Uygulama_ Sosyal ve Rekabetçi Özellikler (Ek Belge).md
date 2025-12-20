# Quizlet Benzeri Uygulama: Sosyal ve Rekabetçi Özellikler (Ek Belge)

Bu belge, daha önce hazırlanan temel gereksinimler belgesine ek olarak, uygulamanın **sınıf arkadaşlarına özel** yapısını destekleyecek sosyal ve rekabetçi özellikleri detaylandırmaktadır.

---

## 1. Veritabanı Şeması Eklemeleri

Uygulamanın "sınıfa özel" yapısını ve sosyal özelliklerini desteklemek için aşağıdaki yeni veri modelleri önerilmektedir:

### 1.1. Sınıf (Class) Modeli
| Alan Adı | Veri Tipi | Açıklama |
| :--- | :--- | :--- |
| `id` | UUID/INT | Birincil Anahtar |
| `name` | VARCHAR(100) | Sınıfın adı (Örn: "2025 Bahar Dönemi Veri Yapıları") |
| `owner_user_id` | UUID/INT | Sınıfı oluşturan kullanıcıya referans (Foreign Key) |
| `join_code` | VARCHAR(10) | Sınıfa katılmak için kullanılan benzersiz kod. |
| `created_at` | TIMESTAMP | Oluşturulma tarihi |

### 1.2. Sınıf Üyeliği (ClassMembership) Modeli
| Alan Adı | Veri Tipi | Açıklama |
| :--- | :--- | :--- |
| `id` | UUID/INT | Birincil Anahtar |
| `class_id` | UUID/INT | Sınıfa referans (Foreign Key) |
| `user_id` | UUID/INT | Üyeye referans (Foreign Key) |
| `role` | ENUM | `student` (öğrenci), `admin` (sınıf sahibi/yöneticisi) |
| `joined_at` | TIMESTAMP | Katılma tarihi |

### 1.3. Aktivite Kaydı (ActivityLog) Modeli
Kullanıcıların çalışma alışkanlıklarını ve aktiflik durumlarını takip etmek için kullanılır. Liderlik tablosu ve aktif kullanıcı listesi bu veriden türetilecektir.

| Alan Adı | Veri Tipi | Açıklama |
| :--- | :--- | :--- |
| `id` | UUID/INT | Birincil Anahtar |
| `user_id` | UUID/INT | Aktiviteyi yapan kullanıcıya referans (Foreign Key) |
| `class_id` | UUID/INT | Aktivitenin gerçekleştiği sınıfa referans (Foreign Key) |
| `activity_type` | ENUM | `set_studied`, `match_completed`, `term_mastered` |
| `set_id` | UUID/INT | (Opsiyonel) İlgili çalışma setine referans |
| `score` | INT | (Opsiyonel) Eşleştirme modu süresi (saniye) veya kazanılan puan. |
| `created_at` | TIMESTAMP | Aktivitenin gerçekleştiği zaman |

---

## 2. İşlevsel Gereksinimler Eklemeleri

### 2.1. Sınıf Yönetimi
| ID | Gereksinim | Açıklama |
| :--- | :--- | :--- |
| **FR-CL-01** | Sınıf Oluşturma | Kullanıcılar (sınıf sahibi), benzersiz bir `join_code` ile yeni bir sınıf oluşturabilmelidir. |
| **FR-CL-02** | Sınıfa Katılma | Kullanıcılar, bir `join_code` girerek ilgili sınıfa üye olabilmelidir. |
| **FR-CL-03** | Sınıf Üyelerini Görüntüleme | Sınıf üyeleri, sınıftaki diğer tüm üyeleri ve rollerini görebilmelidir. |
| **FR-CL-04** | Set Paylaşımı (Sınıf Bazında) | Sınıf sahibi, oluşturduğu setleri doğrudan sınıfla paylaşabilmelidir. Bu, `SetSharing` modeline sınıf bazında bir ilişki eklenmesini gerektirir. |

### 2.2. Liderlik Tablosu (Leaderboard)
| ID | Gereksinim | Açıklama |
| :--- | :--- | :--- |
| **FR-LB-01** | Liderlik Tablosu Görüntüleme | Kullanıcılar, üye oldukları sınıfların liderlik tablosunu görebilmelidir. |
| **FR-LB-02** | Skor Hesaplama | Liderlik tablosu, kullanıcıların son 7 gün veya tüm zamanlar boyunca tamamladığı öğrenme modlarına (Öğren, Yaz, Eşleştir) göre puanlanmalıdır. (Örn: Her öğrenilen terim için 1 puan, her Eşleştirme modu tamamlama için 5 puan). |
| **FR-LB-03** | Eşleştirme Skoru | Eşleştirme modunda en kısa sürede tamamlayanlar, o setin skor tablosunda üst sıralarda yer almalıdır. |

### 2.3. Aktif Kullanıcılar
| ID | Gereksinim | Açıklama |
| :--- | :--- | :--- |
| **FR-AU-01** | Aktiflik Durumu | Uygulama, kullanıcıların son 15 dakika içindeki aktivitelerini (sayfa görüntüleme, mod başlatma) baz alarak "Çevrimiçi" veya "Aktif" durumunu göstermelidir. |
| **FR-AU-02** | Sınıf Aktiflik Listesi | Sınıf üyeleri, kendi sınıflarındaki o an aktif olan diğer kullanıcıları görebilmelidir. |

---

## 3. API Endpoint Eklemeleri

Aşağıdaki tabloda, yeni sosyal işlevleri destekleyecek ana API endpoint'leri listelenmiştir:

| İşlev | Metot | Endpoint | Açıklama |
| :--- | :--- | :--- | :--- |
| **Sınıf Oluşturma** | `POST` | `/api/classes` | Yeni bir sınıf oluşturur. |
| **Sınıfa Katılma** | `POST` | `/api/classes/join` | `join_code` ile sınıfa katılır. |
| **Sınıf Üyeleri** | `GET` | `/api/classes/{id}/members` | Sınıfın üyelerini listeler. |
| **Sınıf Liderlik Tablosu** | `GET` | `/api/classes/{id}/leaderboard` | Sınıfın puan bazlı liderlik tablosunu getirir. |
| **Aktif Kullanıcılar** | `GET` | `/api/classes/{id}/active-users` | Sınıftaki son 15 dakikada aktif olan kullanıcıları listeler. |
| **Aktivite Kaydı** | `POST` | `/api/activity` | Kullanıcının bir aktivitesini (çalışma modu tamamlama vb.) kaydeder. |

### 3.1. Detaylı API Spesifikasyonları

#### 3.1.1. Sınıfa Katılma (`POST /api/classes/join`)

| Parametre | Tip | Zorunlu | Açıklama |
| :--- | :--- | :--- | :--- |
| `join_code` | String | Evet | Sınıfa katılmak için gereken benzersiz kod. |

**Başarılı Yanıt (200 OK):**
```json
{
  "message": "Sınıfa başarıyla katıldınız.",
  "class_id": 101,
  "class_name": "2025 Bahar Dönemi Veri Yapıları"
}
```

#### 3.1.2. Sınıf Liderlik Tablosu (`GET /api/classes/{id}/leaderboard`)

| Parametre | Tip | Zorunlu | Açıklama |
| :--- | :--- | :--- | :--- |
| `time_range` | String | Hayır | `all_time` veya `last_7_days` (Varsayılan: `all_time`). |

**Başarılı Yanıt (200 OK):**
```json
[
  {
    "rank": 1,
    "username": "kullanici_a",
    "total_score": 550,
    "last_activity": "2025-12-17T10:30:00Z"
  },
  {
    "rank": 2,
    "username": "kullanici_b",
    "total_score": 480,
    "last_activity": "2025-12-17T09:15:00Z"
  }
]
```

---

Bu ek belge, uygulamanın sosyal ve rekabetçi yönlerini tam olarak modelleyerek, yapay zekanın bu "sınıfa özel" gereksinimleri eksiksiz bir şekilde anlamasını sağlamaktadır.
