# Quizlet Benzeri Uygulama: Teknik ve İşlevsel Gereksinimler Belgesi

**Proje Adı:** Sınıf Öğrenme Platformu (Örnek)
**Hedef Kitle:** Sınıf Arkadaşları
**Uygulama Tipi:** Mobil Uyumlu Progresif Web Uygulaması (PWA)
**Geliştirme Amacı:** Sınıf arkadaşlarına özel, Quizlet'in temel öğrenme modlarını içeren, veritabanı ve kullanıcı kimlik doğrulamasına sahip bir çalışma aracı sunmak.

---

## 1. Uygulama Mimarisi ve Teknik Gereksinimler

### 1.1. Mimari Yaklaşım
Uygulama, modern bir **Progresif Web Uygulaması (PWA)** mimarisi kullanılarak geliştirilecektir. Bu yaklaşım, uygulamanın hem masaüstü hem de mobil cihazlarda yerel bir uygulama hissi vermesini, çevrimdışı çalışabilmesini ve tarayıcı üzerinden kolayca erişilebilir olmasını sağlayacaktır.

### 1.2. Teknoloji Yığını (Tech Stack)
Kullanıcı gereksinimleri (mobil uyumlu web uygulaması, veritabanı, kimlik doğrulama) göz önüne alınarak aşağıdaki teknoloji yığını önerilmektedir:

| Katman | Teknoloji | Amaç |
| :--- | :--- | :--- |
| **Ön Yüz (Frontend)** | React (Vite ile) + TypeScript | Hızlı, bileşen tabanlı ve tip güvenli kullanıcı arayüzü geliştirme. |
| **Stil/Tasarım** | Tailwind CSS | Hızlı ve duyarlı (responsive) tasarım için yardımcı program odaklı CSS çerçevesi. |
| **Arka Yüz (Backend)** | Node.js (Express/FastAPI) | Ölçeklenebilir ve yüksek performanslı API hizmetleri sunma. |
| **Veritabanı (Database)** | MySQL / TiDB | Güvenilir, ilişkisel veri depolama ve yüksek erişilebilirlik. |
| **ORM (Object-Relational Mapping)** | Drizzle ORM | Veritabanı etkileşimlerini kolaylaştırma ve tip güvenliği sağlama. |
| **Kimlik Doğrulama** | Manus-Oauth (veya muadili) | Güvenli kullanıcı kaydı, oturum yönetimi ve yetkilendirme. |

### 1.3. PWA Temel Gereksinimleri
Uygulamanın mobil cihazlarda uygulama gibi çalışabilmesi için aşağıdaki PWA özelliklerini desteklemesi gerekmektedir:
1.  **Web Uygulama Manifesti:** Uygulama adı, simgeleri, başlangıç URL'si ve görüntüleme modu (`standalone`) tanımlanacaktır.
2.  **Hizmet Çalışanı (Service Worker):** Uygulamanın temel varlıklarını (HTML, CSS, JS) önbelleğe alarak hızlı yükleme ve **çevrimdışı erişim** sağlayacaktır.
3.  **Güvenli Bağlantı (HTTPS):** PWA ve Service Worker gereksinimleri nedeniyle tüm iletişim HTTPS üzerinden yapılacaktır.

### 1.4. Kimlik Doğrulama ve Yetkilendirme
1.  **Kullanıcı Kaydı/Girişi:** E-posta/şifre tabanlı kayıt ve giriş sistemi.
2.  **Oturum Yönetimi:** Güvenli, HTTP-Only çerez tabanlı oturum yönetimi.
3.  **Yetkilendirme:** Kullanıcıların yalnızca kendi oluşturdukları veya kendileriyle paylaşılan çalışma setlerine erişebilmesi.

---

## 2. Veritabanı Şeması ve Veri Modelleri

Uygulamanın temel işlevlerini desteklemek için aşağıdaki ana veri modelleri ve ilişkileri gereklidir:

### 2.1. Kullanıcı (User) Modeli
| Alan Adı | Veri Tipi | Açıklama |
| :--- | :--- | :--- |
| `id` | UUID/INT | Birincil Anahtar |
| `email` | VARCHAR(255) | Kullanıcının e-posta adresi (Benzersiz) |
| `password_hash` | VARCHAR(255) | Şifrenin güvenli hash'i |
| `username` | VARCHAR(50) | Kullanıcı adı (Görünen ad) |
| `created_at` | TIMESTAMP | Kayıt tarihi |

### 2.2. Çalışma Seti (StudySet) Modeli
Bu model, Quizlet'teki "Set" kavramına karşılık gelir. Terim ve tanımların koleksiyonunu içerir.
| Alan Adı | Veri Tipi | Açıklama |
| :--- | :--- | :--- |
| `id` | UUID/INT | Birincil Anahtar |
| `user_id` | UUID/INT | Seti oluşturan kullanıcıya referans (Foreign Key) |
| `title` | VARCHAR(255) | Setin başlığı (Örn: "Veri Yapıları Final") |
| `description` | TEXT | Setin kısa açıklaması |
| `is_public` | BOOLEAN | Setin herkese açık olup olmadığı (Sınıf arkadaşlarına özel olduğu için varsayılan: `false`) |
| `created_at` | TIMESTAMP | Oluşturulma tarihi |

### 2.3. Terim (Term) Modeli
Bu model, bir Çalışma Seti içindeki tek bir kartı (terim-tanım çifti) temsil eder.
| Alan Adı | Veri Tipi | Açıklama |
| :--- | :--- | :--- |
| `id` | UUID/INT | Birincil Anahtar |
| `set_id` | UUID/INT | Ait olduğu Çalışma Setine referans (Foreign Key) |
| `term` | TEXT | Kartın ön yüzündeki terim |
| `definition` | TEXT | Kartın arka yüzündeki tanım |
| `image_url` | VARCHAR(255) | (Opsiyonel) Terimle ilişkili görselin URL'si |

### 2.4. Kullanıcı İlerlemesi (UserProgress) Modeli
Bu model, kullanıcının her bir terimdeki öğrenme durumunu (Quizlet'teki "Learn" modunun temelini) takip eder.
| Alan Adı | Veri Tipi | Açıklama |
| :--- | :--- | :--- |
| `id` | UUID/INT | Birincil Anahtar |
| `user_id` | UUID/INT | Kullanıcıya referans (Foreign Key) |
| `term_id` | UUID/INT | Terime referans (Foreign Key) |
| `mastery_level` | INT | 0 (Bilinmiyor) - 5 (Tamamen Öğrenildi) arası seviye. |
| `last_studied_at` | TIMESTAMP | Son çalışma tarihi |

### 2.5. Set Paylaşımı (SetSharing) Modeli
Sınıf arkadaşlarına özel paylaşım mekanizmasını sağlar.
| Alan Adı | Veri Tipi | Açıklama |
| :--- | :--- | :--- |
| `id` | UUID/INT | Birincil Anahtar |
| `set_id` | UUID/INT | Paylaşılan Sete referans (Foreign Key) |
| `shared_with_user_id` | UUID/INT | Setin paylaşıldığı kullanıcıya referans (Foreign Key) |
| `permission_level` | ENUM | `read` (sadece çalışma), `edit` (düzenleme izni) |

---

## 3. İşlevsel Gereksinimler (Özellikler)

### 3.1. Çalışma Seti Yönetimi
| ID | Gereksinim | Açıklama |
| :--- | :--- | :--- |
| **FR-SM-01** | Set Oluşturma | Kullanıcılar, bir başlık, açıklama ve en az bir terim-tanım çifti ile yeni bir set oluşturabilmelidir. |
| **FR-SM-02** | Set Düzenleme | Kullanıcılar, kendi oluşturdukları setleri (başlık, açıklama, terimler) düzenleyebilmelidir. |
| **FR-SM-03** | Terim Ekleme/Silme | Kullanıcılar, setlere yeni terimler ekleyebilmeli ve mevcut terimleri silebilmelidir. |
| **FR-SM-04** | Toplu İçerik Girişi | Kullanıcılar, metin kutusuna terim ve tanımları ayırıcılarla (örneğin, sekme veya virgül) toplu olarak yapıştırarak set oluşturabilmelidir. |
| **FR-SM-05** | Set Paylaşımı | Kullanıcılar, setlerini belirli sınıf arkadaşlarıyla (kullanıcı ID'si veya e-posta ile) paylaşabilmeli ve izin seviyesi (`read`/`edit`) belirleyebilmelidir. |

### 3.2. Öğrenme Modları (Quizlet Benzeri)

#### 3.2.1. Kartlar (Flashcards) Modu
| ID | Gereksinim | Açıklama |
| :--- | :--- | :--- |
| **FR-LM-01** | Kart Görüntüleme | Kullanıcılar, setin terimlerini ve tanımlarını dijital kartlar olarak görebilmelidir. |
| **FR-LM-02** | Kart Çevirme | Kartın ön yüzüne (terim) dokunulduğunda/tıklandığında arka yüzü (tanım) görünmelidir. |
| **FR-LM-03** | Sıralama Seçeneği | Kartlar, orijinal sırasına göre veya rastgele karıştırılmış sırada görüntülenebilmelidir. |

#### 3.2.2. Öğren (Learn) Modu
Bu mod, kullanıcının öğrenme seviyesine göre sorular sorarak adaptif bir öğrenme deneyimi sunar (Spaced Repetition System - SRS'nin basitleştirilmiş hali).
| ID | Gereksinim | Açıklama |
| :--- | :--- | :--- |
| **FR-LM-04** | Adaptif Sorular | Uygulama, kullanıcının `mastery_level`'ına göre çoktan seçmeli, doğru/yanlış ve yazılı sorular sormalıdır. |
| **FR-LM-05** | İlerleme Takibi | Her doğru cevapta terimin `mastery_level`'ı artırılmalı, yanlış cevapta düşürülmelidir. |
| **FR-LM-06** | Tamamlama | Kullanıcı, setteki tüm terimler için belirli bir `mastery_level`'a ulaştığında mod tamamlanmalıdır. |

#### 3.2.3. Yaz (Write) Modu
| ID | Gereksinim | Açıklama |
| :--- | :--- | :--- |
| **FR-LM-07** | Tanım/Terim Girişi | Uygulama, terimi gösterip kullanıcının tanımı yazmasını veya tanımı gösterip terimi yazmasını istemelidir. |
| **FR-LM-08** | Doğruluk Kontrolü | Kullanıcının girişi, orijinal tanım/terim ile karşılaştırılmalı ve doğru/yanlış geri bildirimi verilmelidir. |

#### 3.2.4. Eşleştir (Match) Modu
| ID | Gereksinim | Açıklama |
| :--- | :--- | :--- |
| **FR-LM-09** | Zamanlı Eşleştirme | Kullanıcıya bir dizi terim ve tanım sunulmalı ve bunları en kısa sürede doğru bir şekilde eşleştirmesi istenmelidir. |
| **FR-LM-10** | Skor Tablosu | En iyi tamamlama süreleri kaydedilmeli ve sınıf arkadaşları arasında bir skor tablosu gösterilmelidir. |

---

## 4. Kullanıcı Arayüzü (UI) ve Kullanıcı Deneyimi (UX) Gereksinimleri

### 4.3. Ekran Akışları ve Bileşenler

Uygulama, mobil öncelikli bir yaklaşımla tasarlanacaktır. Temel ekranlar ve bileşenler şunlardır:

#### 4.3.1. Ekran Akışları

| Ekran Adı | Amaç | Temel Bileşenler |
| :--- | :--- | :--- |
| **Giriş/Kayıt Ekranı** | Kullanıcı kimlik doğrulama. | E-posta/Şifre Giriş Alanları, Kayıt/Giriş Butonları, Şifremi Unuttum Linki. |
| **Ana Sayfa (Set Listesi)** | Kullanıcının setlerini ve paylaşılan setleri listeleme. | Arama Çubuğu, Set Kartları (Başlık, Terim Sayısı, Oluşturan), Yeni Set Oluşturma Butonu. |
| **Set Detay Ekranı** | Setin terimlerini ve çalışma modlarını görüntüleme. | Set Başlığı/Açıklaması, Terim Listesi (Terim/Tanım), Çalışma Modu Seçim Butonları (Kartlar, Öğren, Yaz, Eşleştir). |
| **Set Oluşturma/Düzenleme** | Yeni set oluşturma veya mevcut seti düzenleme. | Başlık/Açıklama Giriş Alanları, Terim/Tanım Giriş Alanları (Ekle/Sil Butonları ile), Toplu Giriş Alanı, Kaydet Butonu. |
| **Kartlar Modu Ekranı** | Kartlar modunda çalışma. | Büyük Kart Bileşeni (Çevirme Animasyonu ile), İlerleme Göstergesi, Karıştır/Ayarlar Butonları. |
| **Öğren Modu Ekranı** | Adaptif öğrenme sorularını yanıtlama. | Soru Tipi Bileşeni (Çoktan Seçmeli/Yazılı), Cevap Giriş Alanı/Butonları, Geri Bildirim Mesajı, İlerleme Çubuğu. |
| **Eşleştir Modu Ekranı** | Eşleştirme oyununu oynama. | Zamanlayıcı, Terim/Tanım Kutucukları (Sürükle-Bırak veya Tıklama ile Eşleştirme), Skor Tablosu. |

#### 4.3.2. Tasarım Bileşenleri

1.  **Kart Bileşeni:** Set listesinde ve çalışma modlarında kullanılan, terim sayısını ve başlığı gösteren etkileşimli kartlar.
2.  **Duyarlı Formlar:** Mobil klavye açıldığında içeriğin kaybolmasını engelleyen, kullanıcı dostu formlar.
3.  **Animasyonlar:** Kart çevirme, doğru/yanlış geri bildirimi ve sayfa geçişlerinde akıcı, performansı etkilemeyen animasyonlar kullanılacaktır.
4.  **Erişilebilirlik:** Ekran okuyucular ve klavye navigasyonu için uygun etiketleme (ARIA) ve semantik HTML yapısı kullanılacaktır.

---'}],path:

### 4.1. Genel Tasarım
1.  **Duyarlı Tasarım (Responsive Design):** Uygulama, tüm ekran boyutlarında (özellikle mobil dikey ve yatay) sorunsuz çalışmalıdır.
2.  **Basit ve Odaklanmış Arayüz:** Öğrenme deneyimini maksimize etmek için dikkat dağıtıcı unsurlardan kaçınılmalıdır.

### 4.2. Mobil Uyumluluk (PWA UX)
1.  **Hızlı Yükleme:** Uygulama, ilk yüklemeden sonra anında açılmalıdır (Service Worker önbellekleme sayesinde).
2.  **Yükleme İsteği:** Mobil tarayıcılarda kullanıcıya uygulamayı ana ekrana ekleme (`Add to Home Screen`) önerisi sunulmalıdır.
3.  **Tam Ekran Deneyimi:** Ana ekrandan başlatıldığında tarayıcı arayüzü (adres çubuğu vb.) gizlenmelidir.

---

## 5. API Endpoint'leri ve Backend İşlevleri

Aşağıdaki tabloda, uygulamanın temel işlevlerini destekleyecek ana API endpoint'leri listelenmiştir:

| İşlev | Metot | Endpoint | Açıklama |
| :--- | :--- | :--- | :--- |
| **Kullanıcı Kaydı** | `POST` | `/api/auth/register` | Yeni kullanıcı kaydı. |
| **Kullanıcı Girişi** | `POST` | `/api/auth/login` | Kullanıcı girişi ve oturum oluşturma. |
| **Set Oluşturma** | `POST` | `/api/sets` | Yeni bir çalışma seti oluşturur. |
| **Set Getirme** | `GET` | `/api/sets/{id}` | Belirli bir setin detaylarını ve terimlerini getirir. |
| **Set Listeleme** | `GET` | `/api/sets` | Kullanıcının oluşturduğu ve paylaşılan setleri listeler. |
| **Terim Ekleme** | `POST` | `/api/sets/{id}/terms` | Mevcut sete yeni terim ekler. |
| **İlerleme Güncelleme** | `POST` | `/api/progress` | Belirli bir terim için kullanıcının `mastery_level`'ını günceller. |
| **Set Paylaşımı** | `POST` | `/api/sets/{id}/share` | Seti başka bir kullanıcıyla paylaşır. |

### 5.1. Detaylı API Spesifikasyonları

#### 5.1.1. Kullanıcı Kaydı (`POST /api/auth/register`)

| Parametre | Tip | Zorunlu | Açıklama |
| :--- | :--- | :--- | :--- |
| `email` | String | Evet | Kullanıcının e-posta adresi. |
| `password` | String | Evet | Kullanıcının şifresi (Min. 8 karakter). |
| `username` | String | Evet | Kullanıcının görünen adı. |

**Başarılı Yanıt (201 Created):**
```json
{
  "message": "Kullanıcı başarıyla oluşturuldu.",
  "user": {
    "id": 123,
    "username": "kullanici_adi",
    "email": "kullanici@example.com"
  }
}
```

#### 5.1.2. Çalışma Seti Oluşturma (`POST /api/sets`)

| Parametre | Tip | Zorunlu | Açıklama |
| :--- | :--- | :--- | :--- |
| `title` | String | Evet | Setin başlığı. |
| `description` | String | Hayır | Setin açıklaması. |
| `is_public` | Boolean | Hayır | Setin herkese açık olup olmadığı (Varsayılan: `false`). |
| `terms` | Array<Object> | Evet | Terim ve tanım çiftlerinin listesi. |
| `terms[].term` | String | Evet | Kartın ön yüzündeki terim. |
| `terms[].definition` | String | Evet | Kartın arka yüzündeki tanım. |

**Başarılı Yanıt (201 Created):**
```json
{
  "message": "Çalışma seti başarıyla oluşturuldu.",
  "setId": 456,
  "title": "Veri Yapıları Final"
}
```

#### 5.1.3. İlerleme Güncelleme (`POST /api/progress`)

Bu endpoint, bir öğrenme modu sırasında kullanıcının bir terimdeki bilgisini günceller.

| Parametre | Tip | Zorunlu | Açıklama |
| :--- | :--- | :--- | :--- |
| `term_id` | Integer | Evet | İlerlemesi güncellenecek terimin ID'si. |
| `is_correct` | Boolean | Evet | Kullanıcının son soruyu doğru bilip bilmediği. |

**Başarılı Yanıt (200 OK):**
```json
{
  "message": "İlerleme güncellendi.",
  "new_mastery_level": 3,
  "term_id": 789
}
```

---'}],path:

---

## 6. PWA Gereksinimleri ve Mobil Optimizasyon Detayları

### 6.1. Manifest Dosyası (`manifest.json`)
| Alan | Değer Önerisi | Açıklama |
| :--- | :--- | :--- |
| `name` | Sınıf Öğrenme Platformu | Uygulamanın tam adı. |
| `short_name` | Sınıf Quiz | Ana ekranda görünecek kısa ad. |
| `display` | `standalone` | Uygulamanın tarayıcı arayüzü olmadan açılmasını sağlar. |
| `start_url` | `/` | Uygulamanın başlangıç sayfası. |
| `theme_color` | `#007bff` | Uygulamanın arayüz rengi (örneğin, durum çubuğu). |
| `background_color` | `#ffffff` | Uygulama yüklenirken gösterilen arka plan rengi. |
| `icons` | Çeşitli boyutlar | Mobil cihazlar için yüksek çözünürlüklü simgeler. |

### 6.2. Çevrimdışı Çalışma ve Veri Senkronizasyonu

1.  **Temel Varlıklar:** Service Worker, uygulamanın temel HTML, CSS ve JavaScript dosyalarını `Cache-First` stratejisiyle önbelleğe almalıdır. Bu, uygulamanın ilk yüklemeden sonra anında açılmasını sağlar.
2.  **Veri Önbellekleme:** Kullanıcının son çalıştığı setler ve ilerleme verileri, çevrimdışı çalışabilmek için **IndexedDB** kullanılarak yerel olarak önbelleğe alınmalıdır. Bu, büyük veri setlerinin depolanması için daha uygundur.
3.  **Arka Plan Senkronizasyonu (Background Sync):** Çevrimdışı yapılan ilerleme güncellemeleri ve set oluşturma/düzenleme işlemleri, tarayıcının **Background Sync API**'si (veya manuel senkronizasyon mekanizması) kullanılarak internet bağlantısı geri geldiğinde otomatik olarak sunucuyla senkronize edilmelidir. Bu, veri kaybını önler ve kullanıcı deneyimini kesintisiz hale getirir.

### 6.3. Performans Optimizasyonu

1.  **Kod Bölme (Code Splitting):** Uygulama, her bir öğrenme modu için ayrı ayrı kod bölmeleri kullanmalıdır. Bu, yalnızca o anki mod için gerekli olan JavaScript'in yüklenmesini sağlayarak ilk yükleme süresini kısaltır.
2.  **Görüntü Optimizasyonu:** Terimlere eklenecek görseller, mobil cihazlar için optimize edilmeli ve `WebP` gibi modern formatlar tercih edilmelidir.
3.  **Lazy Loading:** Görünür alanda olmayan (off-screen) bileşenler ve görseller, sayfa yükleme süresini hızlandırmak için tembel yükleme (lazy loading) ile yüklenmelidir.

---

## 7. Referanslar ve Ek Bilgiler

Bu belge, Quizlet'in temel işlevlerinin analizi ve modern web geliştirme standartları temel alınarak hazırlanmıştır.

| No | Kaynak | Açıklama |
| :--- | :--- | :--- |
| [1] | [Quizlet Study Modes](https://quizlet.com/en-gb/features/study-modes) | Quizlet'in sunduğu temel çalışma modları. |
| [2] | [Progressive Web Apps (PWA)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) | PWA'lar hakkında genel bilgi ve gereksinimler. |
| [3] | [Spaced Repetition System (SRS)](https://en.wikipedia.org/wiki/Spaced_repetition) | Öğrenme modunun temelini oluşturan aralıklı tekrar sistemi. |

---'}],path:

---

Bu belge, Quizlet benzeri uygulamanızın **eksiksiz teknik ve işlevsel temelini** oluşturmaktadır. Bu detaylar, geliştirme sürecinde yol haritası olarak kullanılacak ve yapay zekanın uygulamanın tüm inceliklerini anlamasını sağlayacaktır.
