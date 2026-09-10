import Reveal from "@/components/site/Reveal";

const stats = [
  { value: "18+", label: "Yıllık deneyim" },
  { value: "400+", label: "Tamamlanan uygulama" },
  { value: "%100", label: "Ölçüye özel üretim" },
];

export default function About() {
  return (
    <section className="section" id="hakkimizda" aria-labelledby="hakkimizda-baslik">
      <div className="container">
        <div className="about__grid">
          <Reveal className="about__col--sticky">
            <span className="eyebrow">04 — Hakkımızda</span>
            <h2 className="about__title" id="hakkimizda-baslik">
              Yaşam alanlarını yalnızca mobilyalarla değil, doğru tasarım
              anlayışıyla şekillendiriyoruz.
            </h2>
          </Reveal>

          <Reveal delay={80}>
            <div className="about__text">
              <p className="lead">
                Eren Mobilya Tasarım; mutfak, yatak odası, banyo, vestiyer
                ve TV ünitesini ölçüye özel üretir. Her ünite,
                konulacağı mekânın oranları ve ışığı düşünülerek planlanır.
              </p>
              <p>
                Malzeme seçimini görünürden değil, dayanıklılıktan başlatıyoruz:
                neme dayanıklı gövdeler, doğal ahşap kaplamalar, mat ve parlak
                lake yüzeyler, sessiz kapanan mekanizmalar. Detaylar sade kalsın
                diye, işçilik görünmeyen yerde de aynı özenle sürüyor.
              </p>
              <p>
                Süreç yerinde keşif ve ölçüyle başlıyor; 3B görselleştirmeyle
                mekânınızı üretimden önce birebir görüyorsunuz. Teslimatta
                montaj ve yerleşim de bize ait. Konutun yanında güzellik
                merkezi, klinik ve ofis gibi ticari projelerde de anahtar teslim
                çalışıyoruz.
              </p>
            </div>

            <dl className="about__stats">
              {stats.map((stat) => (
                <div className="about__stat" key={stat.label}>
                  <dt>{stat.value}</dt>
                  <dd>{stat.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
