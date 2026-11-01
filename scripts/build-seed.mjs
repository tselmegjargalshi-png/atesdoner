// Generates data/menu.json (the default menu shown before the admin saves anything).
// Source: printed Ateş Döner menu (PDF). Prices and most kcal values come from the PDF.
// Values marked kcalEstimated:true and all allergen lists are estimates to be confirmed by the owner.
// Run: node scripts/build-seed.mjs
import { writeFileSync } from 'node:fs';

let n = 0;
const id = (p) => `${p}_${(++n).toString(36)}`;

// Allergen shorthands
const A = {
  durumTavuk: ['gluten', 'sut', 'yumurta', 'hardal'],
  durumTavukPeynir: ['gluten', 'sut', 'yumurta', 'hardal'],
  gobit: ['gluten', 'sut', 'yumurta', 'hardal', 'susam'],
  durumEt: ['gluten', 'sut', 'yumurta'],
  durumEtMayo: ['gluten', 'sut', 'yumurta', 'hardal'],
  porsiyon: ['gluten', 'sut'],
};

const v = (label, price, kcal, est = false) => ({ label, price, kcal, ...(est ? { kcalEstimated: true } : {}) });

const sizesTK = (p, k = [150, 225, 300]) => [v('80 gr', p[0], k[0]), v('120 gr', p[1], k[1]), v('160 gr', p[2], k[2])];
const sizesTZ = (p, k = [190, 285, 380]) => [v('100 gr', p[0], k[0]), v('150 gr', p[1], k[1]), v('200 gr', p[2], k[2])];
const sizesEK = (p, k) => [v('60 gr', p[0], k[0]), v('80 gr', p[1], k[1]), v('100 gr', p[2], k[2])];
const sizesEZ = (p, k) => [v('80 gr', p[0], k[0]), v('100 gr', p[1], k[1]), v('120 gr', p[2], k[2])];

const P = (o) => ({
  id: id('p'),
  name: o.name,
  description: o.description,
  ingredients: o.ingredients || '',
  variants: o.variants,
  allergens: o.allergens || [],
  tags: o.tags || [],
  image: o.image || '',
  visible: true,
});

const categories = [
  {
    id: 'tavuk_klasik', name: 'Tavuk Klasik Dürüm', note: 'Hatay usulü, ince lavaşta soslu tavuk döner.',
    items: [
      P({ name: 'Ateş Klasik', ingredients: 'Patates, turşu, özel sos, mayonez', description: 'Hatay usulü özel soslu tavuk döner, çıtır patates ve turşuyla ince lavaşa sarılır. Ateş Döner’in imza lezzeti.', variants: sizesTK([225, 300, 350]), allergens: A.durumTavuk, tags: ['populer'] }),
      P({ name: 'Ateş Gurme', ingredients: 'Patates, turşu, özel sos, mayonez, kaşar', description: 'Klasik tarifimize eriyen kaşar eklenir; daha yumuşak ve doyurucu bir dürüm.', variants: sizesTK([275, 350, 400]), allergens: A.durumTavukPeynir, tags: ['peynirli'] }),
      P({ name: 'Ateş Acılı', ingredients: 'Patates, turşu, özel sos, mayonez', description: 'Acı sevenlere: özel sosumuz acı biberle güçlendirilir, her lokmada ateş hissedilir.', variants: sizesTK([225, 300, 350]), allergens: A.durumTavuk, tags: ['acili'] }),
      P({ name: 'Ateş Special', ingredients: 'Patates, turşu, özel sos, mayonez, soğan, domates', description: 'Taze soğan ve domatesle zenginleşen, ferah ve dengeli bir tavuk dürüm.', variants: sizesTK([225, 300, 350]), allergens: A.durumTavuk }),
      P({ name: 'Ateş Atom', ingredients: 'Patates, turşu, özel sos, mayonez, kaşar, cheddar', description: 'Kaşar ve cheddar bir arada; peynir tutkunları için en dolu dürümümüz.', variants: sizesTK([295, 370, 420]), allergens: A.durumTavukPeynir, tags: ['peynirli'] }),
    ],
  },
  {
    id: 'tavuk_zurna', name: 'Tavuk Zurna Dürüm', note: 'Uzun zurna lavaşta, daha bol porsiyon.',
    items: [
      P({ name: 'Ateş Zurna', ingredients: 'Patates, turşu, özel sos, mayonez', description: 'Klasik tarifimiz uzun zurna lavaşta; büyük iştahlar için bol ve soslu.', variants: sizesTZ([275, 350, 400]), allergens: A.durumTavuk, tags: ['populer'] }),
      P({ name: 'Ateş Zurna Gurme', ingredients: 'Patates, turşu, özel sos, mayonez, kaşar', description: 'Zurna lavaşta kaşarlı tavuk döner; uzun, sıcak ve doyurucu.', variants: sizesTZ([325, 400, 450]), allergens: A.durumTavukPeynir, tags: ['peynirli'] }),
      P({ name: 'Ateş Zurna Acılı', ingredients: 'Patates, turşu, özel sos, mayonez', description: 'Acılı özel sosla hazırlanan zurna dürüm; bol porsiyon, bol ateş.', variants: sizesTZ([275, 350, 400]), allergens: A.durumTavuk, tags: ['acili'] }),
      P({ name: 'Ateş Zurna Special', ingredients: 'Patates, turşu, özel sos, mayonez, soğan, domates', description: 'Soğan ve domatesle hazırlanan, ferah lezzetli zurna dürüm.', variants: sizesTZ([275, 350, 400]), allergens: A.durumTavuk }),
      P({ name: 'Ateş Zurna Atom', ingredients: 'Patates, turşu, özel sos, mayonez, kaşar, cheddar', description: 'Kaşar ve cheddarlı zurna; menünün en dolu tavuk dürümü.', variants: sizesTZ([345, 420, 470]), allergens: A.durumTavukPeynir, tags: ['peynirli'] }),
    ],
  },
  {
    id: 'tavuk_gobit', name: 'Tavuk Gobit', note: 'Gobit ekmeğinize soğan, patates ve sos isteğe göre ilave edilir.',
    items: [
      P({ name: 'Ateş Gobit', ingredients: 'Marul, domates, turşu, mayonez', description: 'Fırından taze gobit ekmeği arasında bol soslu tavuk döner ve çıtır sebzeler.', variants: sizesTK([225, 300, 350]), allergens: A.gobit, image: '/assets/img/food/tavuk-gobit.webp' }),
      P({ name: 'Ateş Gobit Gurme', ingredients: 'Marul, domates, turşu, mayonez, kaşar', description: 'Kaşarla eriyen tavuk döner, taze gobit ekmeğinde.', variants: sizesTK([275, 350, 400]), allergens: A.gobit, tags: ['peynirli'], image: '/assets/img/food/tavuk-gobit.webp' }),
      P({ name: 'Ateş Gobit Atom', ingredients: 'Marul, domates, turşu, mayonez, kaşar, cheddar', description: 'Kaşar ve cheddarlı, ekmek arası en doyurucu tavuk lezzeti.', variants: sizesTK([295, 370, 420]), allergens: A.gobit, tags: ['peynirli'], image: '/assets/img/food/tavuk-gobit.webp' }),
    ],
  },
  {
    id: 'tavuk_porsiyon', name: 'Tavuk Porsiyon', note: 'Porsiyonlar ikramlarıyla birlikte servis edilir.',
    items: [
      P({ name: 'Tavuk İskender', ingredients: 'Pide, yoğurt, salata, köz domates, köz biber ikramımızdır', description: 'Tereyağlı pide üzerinde tavuk döner, özel domates sosu ve yoğurtla; sıcak sahanda gelir.', variants: [v('140 gr', 385, 420), v('200 gr', 475, 470), v('Menü: Cips + Ayran', 480, 640, true), v('Menü: Cips + Kola', 500, 700, true)], allergens: A.porsiyon, tags: ['populer'], image: '/assets/img/food/tavuk-iskender.webp' }),
      P({ name: 'Tavuk Servis', ingredients: 'Lavaş, salata, patates, köz domates, köz biber ikramımızdır', description: 'Tabakta tavuk döner; lavaş, patates ve köz sebzelerle eksiksiz bir öğün.', variants: [v('140 gr', 385, 420), v('200 gr', 475, 470), v('Menü: Cips + Ayran', 480, 640, true), v('Menü: Cips + Kola', 500, 700, true)], allergens: A.porsiyon, image: '/assets/img/food/tavuk-servis.webp' }),
      P({ name: 'Pilav Üstü Tavuk', ingredients: 'Lavaş, salata, patates, köz domates, köz biber ikramımızdır', description: 'Tereyağlı pirinç pilavı üzerinde tavuk döner, yanında köz sebzeler ve salata.', variants: [v('140 gr', 385, 420), v('200 gr', 475, 470), v('Menü: Cips + Ayran', 480, 640, true), v('Menü: Cips + Kola', 500, 700, true)], allergens: A.porsiyon, image: '/assets/img/food/tavuk-pilav.webp' }),
    ],
  },
  {
    id: 'atesin_enleri', name: 'Ateşin Enleri', note: 'Tavuk dönerin en çok sevilen tabakları.',
    items: [
      P({ name: 'Ateş Efsane', ingredients: 'Turşu, maydanoz, mayonez, kaşar', description: '120 gr tavuk döner, kaşarla dürülüp dilimlenir; patates kızartması ve soslarla sunulur.', variants: [v('120 gr', 380, 335)], allergens: A.durumTavukPeynir, tags: ['populer'], image: '/assets/img/food/tavuk-efsane.webp' }),
      P({ name: 'Ateş Bomba', ingredients: 'Turşu, maydanoz, mayonez, kaşar, cheddar', description: '120 gr tavuk döner, kaşar ve cheddarla tost gibi kızartılır; patates ve soslarla gelir.', variants: [v('120 gr', 380, 335)], allergens: A.durumTavukPeynir, tags: ['peynirli'], image: '/assets/img/food/tavuk-bomba.webp' }),
    ],
  },
  {
    id: 'tavuk_menuler', name: 'Tavuk Menüler', note: 'Avantajlı menüler: içeceğinizi ayran ya da kola olarak seçin.',
    items: [
      P({ name: 'Gobit Menü', ingredients: 'Ateş Gobit + cips + ayran ya da kola', description: 'Ateş Gobit, çıtır cips ve soğuk içecek bir arada.', variants: [v('Ayran ile', 350, 560, true), v('Kola ile', 370, 610, true)], allergens: A.gobit, image: '/assets/img/food/tavuk-gobit.webp' }),
      P({ name: 'Avantaj 3’lü Klasik', ingredients: 'Ateş Klasik + patates + ayran ya da kola', description: 'Ateş Klasik dürüm, patates kızartması ve içecek.', variants: [v('Ayran ile', 350, 335), v('Kola ile', 370, 390)], allergens: A.durumTavuk }),
      P({ name: 'Avantaj 3’lü Special', ingredients: 'Ateş Special + patates + ayran ya da kola', description: 'Soğan ve domatesli Ateş Special, patates ve içecek.', variants: [v('Ayran ile', 350, 335), v('Kola ile', 370, 390)], allergens: A.durumTavuk }),
      P({ name: 'Avantaj 3’lü Gurme', ingredients: 'Ateş Gurme + patates + ayran ya da kola', description: 'Kaşarlı Ateş Gurme, patates ve içecek.', variants: [v('Ayran ile', 400, 385), v('Kola ile', 420, 440)], allergens: A.durumTavukPeynir }),
      P({ name: 'Avantaj 3’lü Zurna', ingredients: 'Ateş Zurna + patates + ayran ya da kola', description: 'Bol porsiyon Ateş Zurna, patates ve içecek.', variants: [v('Ayran ile', 400, 335), v('Kola ile', 420, 390)], allergens: A.durumTavuk }),
      P({ name: 'Muhteşem 4’lü Klasik', ingredients: 'Ateş Klasik + patates + tatlı + ayran ya da kola', description: 'Ateş Klasik, patates, içecek ve günün tatlısı.', variants: [v('Ayran ile', 400, 350), v('Kola ile', 420, 415)], allergens: A.durumTavuk }),
      P({ name: 'Muhteşem 4’lü Special', ingredients: 'Ateş Special + patates + tatlı + ayran ya da kola', description: 'Ateş Special, patates, içecek ve tatlı ile tam bir öğün.', variants: [v('Ayran ile', 400, 350), v('Kola ile', 420, 415)], allergens: A.durumTavuk }),
      P({ name: 'Muhteşem 4’lü Gurme', ingredients: 'Ateş Gurme + patates + tatlı + ayran ya da kola', description: 'Kaşarlı Ateş Gurme, patates, içecek ve tatlı.', variants: [v('Ayran ile', 450, 400), v('Kola ile', 480, 465)], allergens: A.durumTavukPeynir }),
      P({ name: 'Muhteşem 4’lü Zurna', ingredients: 'Ateş Zurna + patates + tatlı + ayran ya da kola', description: 'Ateş Zurna, patates, içecek ve tatlı; en doyurucu menü.', variants: [v('Ayran ile', 450, 350), v('Kola ile', 480, 415)], allergens: A.durumTavuk }),
    ],
  },
  {
    id: 'et_klasik', name: 'Et Klasik Dürüm', note: 'Yaprak yaprak kesilen et döner, lavaşta.',
    items: [
      P({ name: 'Ateş Et Klasik', ingredients: 'Turşu, soğan, özel sos, domates', description: 'Ocakbaşı lezzetinde et döner, soğan ve domatesle lavaşa sarılır.', variants: sizesEK([345, 415, 465], [165, 215, 265]), allergens: A.durumEt, tags: ['populer'] }),
      P({ name: 'Ateş Et Gurme', ingredients: 'Turşu, soğan, özel sos, domates, kaşar', description: 'Et döner ve eriyen kaşarın buluştuğu sıcacık dürüm.', variants: sizesEK([395, 465, 515], [190, 240, 290]), allergens: A.durumEt, tags: ['peynirli'] }),
      P({ name: 'Ateş Et Atom', ingredients: 'Turşu, soğan, özel sos, domates, kaşar, cheddar', description: 'Kaşar ve cheddarla zenginleşen, en dolu et dürümümüz.', variants: sizesEK([415, 485, 535], [215, 265, 315]), allergens: A.durumEt, tags: ['peynirli'] }),
    ],
  },
  {
    id: 'et_zurna', name: 'Et Zurna Dürüm', note: 'Uzun zurna lavaşta bol et döner.',
    items: [
      P({ name: 'Ateş Et Zurna', ingredients: 'Turşu, soğan, özel sos, domates', description: 'Zurna lavaşta bol et döner; soğan, domates ve özel sosla.', variants: sizesEZ([415, 485, 535], [215, 265, 315]), allergens: A.durumEt }),
      P({ name: 'Ateş Et Zurna Gurme', ingredients: 'Turşu, soğan, özel sos, domates, kaşar', description: 'Kaşarlı et döner, uzun zurna lavaşta.', variants: sizesEZ([465, 535, 585], [240, 290, 340]), allergens: A.durumEt, tags: ['peynirli'] }),
      P({ name: 'Ateş Et Zurna Atom', ingredients: 'Turşu, soğan, özel sos, domates, kaşar, cheddar', description: 'Kaşar ve cheddarlı et zurna; büyük iştahlar için.', variants: sizesEZ([485, 545, 605], [265, 315, 365]), allergens: A.durumEt, tags: ['peynirli'] }),
    ],
  },
  {
    id: 'et_gobit', name: 'Et Gobit', note: 'Gobit ekmeğinize soğan, patates ve sos isteğe göre ilave edilir.',
    items: [
      P({ name: 'Ateş Et Gobit', ingredients: 'Turşu, soğan, domates', description: 'Taze gobit ekmeğinde bol et döner, soğan ve domatesle.', variants: sizesEK([345, 415, 465], [165, 215, 315]), allergens: ['gluten', 'sut', 'susam'], image: '/assets/img/food/et-gobit.webp' }),
      P({ name: 'Ateş Et Gobit Gurme', ingredients: 'Turşu, soğan, domates, kaşar', description: 'Kaşarla eriyen et döner, gobit ekmeği arasında.', variants: sizesEK([395, 465, 515], [190, 240, 290]), allergens: ['gluten', 'sut', 'susam'], tags: ['peynirli'], image: '/assets/img/food/et-gobit.webp' }),
      P({ name: 'Ateş Et Gobit Atom', ingredients: 'Turşu, domates, kaşar, cheddar, soğan', description: 'Kaşar ve cheddarlı et döner; ekmek arası en güçlü lezzet.', variants: sizesEK([415, 485, 535], [215, 265, 315]), allergens: ['gluten', 'sut', 'susam'], tags: ['peynirli'], image: '/assets/img/food/et-gobit.webp' }),
    ],
  },
  {
    id: 'et_porsiyon', name: 'Et Porsiyon', note: 'Porsiyonlar ikramlarıyla birlikte servis edilir.',
    items: [
      P({ name: 'Et İskender', ingredients: 'Pide, yoğurt, salata, köz domates, köz biber ikramımızdır', description: 'Tereyağlı pide üzerinde et döner, domates sosu ve yoğurtla; klasik Bursa usulü sunum.', variants: [v('110 gr', 485, 500), v('160 gr', 615, 550)], allergens: A.porsiyon, tags: ['populer'], image: '/assets/img/food/et-iskender.webp' }),
      P({ name: 'Et Pilav Üstü', ingredients: 'Lavaş, salata, patates, köz domates, köz biber ikramımızdır', description: 'Tereyağlı pilav üzerinde et döner, yanında patates ve köz sebzeler.', variants: [v('110 gr', 485, 500), v('160 gr', 615, 550)], allergens: A.porsiyon, image: '/assets/img/food/et-pilav.webp' }),
      P({ name: 'Et Servis', ingredients: 'Lavaş, salata, patates, köz domates, köz biber ikramımızdır', description: 'Tabakta et döner; lavaş, patates, salata ve köz sebzelerle.', variants: [v('110 gr', 485, 500), v('160 gr', 615, 550)], allergens: A.porsiyon, image: '/assets/img/food/et-servis.webp' }),
    ],
  },
  {
    id: 'en_sevilenler', name: 'En Sevilenler', note: 'Et dönerin en çok tercih edilen tabakları.',
    items: [
      P({ name: 'Ateş Et Bomba', ingredients: 'Turşu, maydanoz, mayonez, kaşar, cheddar', description: 'Et döner, kaşar ve cheddarla kızartılıp dilimlenir; patates ve soslarla sunulur.', variants: [v('Porsiyon', 495, 345)], allergens: A.durumEtMayo, tags: ['populer', 'peynirli'], image: '/assets/img/food/et-bomba.webp' }),
      P({ name: 'Ateş Et Efsane', ingredients: 'Turşu, maydanoz, mayonez, kaşar', description: 'Kaşarlı et döner dürüm dilimleri, patates kızartması ve soslarla.', variants: [v('Porsiyon', 475, 345)], allergens: A.durumEtMayo, tags: ['peynirli'], image: '/assets/img/food/et-efsane.webp' }),
    ],
  },
  {
    id: 'et_menuler', name: 'Et Menüler', note: 'Avantajlı menüler: içeceğinizi ayran ya da kola olarak seçin.',
    items: [
      P({ name: 'Et Gobit Menü', ingredients: 'Ateş Et Gobit + cips + ayran ya da kola', description: 'Ateş Et Gobit, çıtır cips ve soğuk içecek bir arada.', variants: [v('Ayran ile', 445, 560, true), v('Kola ile', 465, 610, true)], allergens: ['gluten', 'sut', 'susam'], image: '/assets/img/food/et-gobit.webp' }),
      P({ name: 'Avantaj 3’lü Et Klasik', ingredients: 'Ateş Et Klasik + patates + ayran ya da kola', description: 'Ateş Et Klasik dürüm, patates kızartması ve içecek.', variants: [v('Ayran ile', 445, 345), v('Kola ile', 465, 405)], allergens: A.durumEt }),
      P({ name: 'Avantaj 3’lü Et Gurme', ingredients: 'Ateş Et Gurme + patates + ayran ya da kola', description: 'Kaşarlı Ateş Et Gurme, patates ve içecek.', variants: [v('Ayran ile', 495, 395), v('Kola ile', 515, 455)], allergens: A.durumEt }),
      P({ name: 'Avantaj 3’lü Et Zurna', ingredients: 'Ateş Et Zurna + patates + ayran ya da kola', description: 'Bol porsiyon Ateş Et Zurna, patates ve içecek.', variants: [v('Ayran ile', 495, 345), v('Kola ile', 515, 400)], allergens: A.durumEt }),
      P({ name: 'Avantaj 3’lü Et Atom', ingredients: 'Ateş Et Atom + patates + ayran ya da kola', description: 'Kaşar ve cheddarlı Ateş Et Atom, patates ve içecek.', variants: [v('Ayran ile', 515, 410), v('Kola ile', 535, 470)], allergens: A.durumEt }),
      P({ name: 'Muhteşem 4’lü Et Klasik', ingredients: 'Ateş Et Klasik + patates + tatlı + ayran ya da kola', description: 'Ateş Et Klasik, patates, içecek ve tatlı.', variants: [v('Ayran ile', 495, 360), v('Kola ile', 515, 425)], allergens: A.durumEt }),
      P({ name: 'Muhteşem 4’lü Et Gurme', ingredients: 'Ateş Et Gurme + patates + tatlı + ayran ya da kola', description: 'Kaşarlı Ateş Et Gurme, patates, içecek ve tatlı.', variants: [v('Ayran ile', 555, 410), v('Kola ile', 585, 470)], allergens: A.durumEt }),
      P({ name: 'Muhteşem 4’lü Et Zurna', ingredients: 'Ateş Et Zurna + patates + tatlı + ayran ya da kola', description: 'Ateş Et Zurna, patates, içecek ve tatlı ile tam bir öğün.', variants: [v('Ayran ile', 555, 360), v('Kola ile', 585, 425)], allergens: A.durumEt }),
      P({ name: 'Muhteşem 4’lü Et Atom', ingredients: 'Ateş Et Atom + patates + tatlı + ayran ya da kola', description: 'Ateş Et Atom, patates, içecek ve tatlı; menünün en doyurucusu.', variants: [v('Ayran ile', 585, 460), v('Kola ile', 610, 520)], allergens: A.durumEt }),
    ],
  },
  {
    id: 'patates', name: 'Patates', note: 'Günlük taze doğranan patatesler.',
    items: [
      P({ name: 'Patates Kızartması', ingredients: 'Taze patates, tuz', description: 'Günlük taze doğranıp kızartılan, dışı çıtır içi yumuşak patates.', variants: [v('Küçük Boy', 80, 200), v('Orta Boy', 120, 310), v('Büyük Boy', 160, 450)], allergens: [], image: '/assets/img/food/patates.webp' }),
    ],
  },
  {
    id: 'icecekler', name: 'İçecekler', note: '',
    items: [
      P({ name: 'Yayık Ayran', ingredients: 'Yoğurt, su, tuz', description: 'Köpüklü, serinletici yayık ayranı; dönerin en iyi eşlikçisi.', variants: [v('Bardak', 60, 110, true)], allergens: ['sut'] }),
      P({ name: 'Şalgam', ingredients: 'Mor havuç, bulgur ekşisi, tuz', description: 'Adana usulü, ekşimsi ve ferahlatıcı şalgam suyu.', variants: [v('Şişe', 60, 25, true)], allergens: ['gluten'] }),
      P({ name: 'Kola', ingredients: '', description: 'Buz gibi Coca Cola, kutu.', variants: [v('Kutu', 90, 139, true)] }),
      P({ name: 'Fanta', ingredients: '', description: 'Portakal aromalı gazlı içecek, kutu.', variants: [v('Kutu', 90, 130, true)] }),
      P({ name: 'Sprite', ingredients: '', description: 'Limon ve misket limonu aromalı gazlı içecek, kutu.', variants: [v('Kutu', 90, 100, true)] }),
      P({ name: 'Fuse Tea', ingredients: '', description: 'Soğuk çay; şeftali ya da limon aromalı.', variants: [v('Şişe', 90, 95, true)] }),
      P({ name: 'Sade Soda', ingredients: '', description: 'Doğal mineralli maden suyu.', variants: [v('Şişe', 40, 0, true)] }),
      P({ name: 'Meyveli Soda', ingredients: '', description: 'Meyve aromalı mineralli maden suyu.', variants: [v('Şişe', 60, 70, true)] }),
      P({ name: 'Su', ingredients: '', description: 'Doğal kaynak suyu, 0,5 lt.', variants: [v('Şişe', 20, 0, true)] }),
    ],
  },
  {
    id: 'tatlilar', name: 'Tatlılar', note: '',
    items: [
      P({ name: 'Puding', ingredients: 'Süt, şeker, kakao, nişasta', description: 'Kakaolu, ipeksi kıvamda soğuk puding.', variants: [v('Kase', 60, 250, true)], allergens: ['sut'] }),
      P({ name: 'Kazandibi', ingredients: 'Süt, şeker, pirinç unu, nişasta', description: 'Tabanı karamelize edilmiş geleneksel sütlü tatlı.', variants: [v('Porsiyon', 60, 300, true)], allergens: ['sut', 'gluten'] }),
      P({ name: 'Sütlaç', ingredients: 'Süt, pirinç, şeker', description: 'Fırında üzeri kızarmış, tarçınla servis edilen sütlaç.', variants: [v('Kase', 60, 280, true)], allergens: ['sut'] }),
      P({ name: 'Muhallebi', ingredients: 'Süt, şeker, pirinç unu', description: 'Hafif ve serinletici klasik muhallebi.', variants: [v('Kase', 60, 240, true)], allergens: ['sut'] }),
    ],
  },
];

for (const c of categories) c.visible = true;

const menu = {
  version: 1,
  updatedAt: new Date().toISOString(),
  settings: {
    name: 'Ateş Döner',
    branch: 'Güllük',
    tagline: 'Hatay’ın efsane soslu döneri',
    since: '2009',
    notice: '',
    address: 'Güllük, Milas, Muğla',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Ate%C5%9F+D%C3%B6ner+G%C3%BCll%C3%BCk',
    instagram: 'atesdonergulluk',
    phones: ['0252 522 40 30', '0532 170 34 48'],
    website: 'atesdoner.com.tr',
    mealCards: [],
    footnotes: [
      'Tüm ürünlerimiz günlük taze olarak hazırlanmaktadır. Katkı ve koruyucu içermez.',
      'Gramajlar pişmiş ürün ağırlığıdır.',
      'Dürümlerin içerisine isteğe göre yeşillik ilave edilir.',
      'Ürünlerimiz gluten vb. alerjen madde içerebilir. Alerjiniz varsa lütfen sipariş öncesi personelimize bildiriniz.',
      'Kalori değerleri yaklaşık değerlerdir.',
      'Fiyat geçişlerinde önceden bildirmeden değiştirme hakkımız saklıdır.',
    ],
  },
  categories,
};

writeFileSync(new URL('../data/menu.json', import.meta.url), JSON.stringify(menu, null, 2) + '\n');
console.log('categories', categories.length, 'items', categories.reduce((s, c) => s + c.items.length, 0));
