import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function Hakkimizda() {
  return (
    <div>
      {/* Navigation Bar */}
      <Navbar />

      {/* Page Header */}
      <section className={styles.pageHeader}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className={styles.pageTitle}>Hakkımızda</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className={styles.contentSection}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Company Story */}
              <div className={styles.contentBlock}>
                <h2 className={styles.sectionTitle}>Hikayemiz</h2>
                <p className={styles.text}>
                  EvDekor, 2010 yılında Ankara'da kurulmuş bir ev dekorasyonu ve mobilya firmasıdır. 
                  14 yıllık deneyimimiz ile müşterilerimizin hayallerindeki evi yaratmalarına yardımcı oluyoruz.
                </p>
                <p className={styles.text}>
                  Kaliteli ürünler, uygun fiyatlar ve mükemmel müşteri hizmeti anlayışımızla sektörde 
                  güvenilir bir marka haline geldik. Her geçen gün büyüyen ürün yelpazemiz ile 
                  evlerinizi daha güzel hale getirmenin keyfini yaşıyoruz.
                </p>
              </div>

              {/* Mission & Vision */}
              <div className="row">
                <div className="col-md-6">
                  <div className={styles.contentBlock}>
                    <h3 className={styles.blockTitle}>🎯 Misyonumuz</h3>
                    <p className={styles.text}>
                      Kaliteli mobilya ve dekorasyon ürünleri ile müşterilerimizin yaşam alanlarını 
                      daha konforlu, şık ve işlevsel hale getirmek.
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className={styles.contentBlock}>
                    <h3 className={styles.blockTitle}>🌟 Vizyonumuz</h3>
                    <p className={styles.text}>
                      Türkiye'nin en güvenilir ev dekorasyonu markası olarak, her evde kalite ve 
                      estetiği buluşturmak.
                    </p>
                  </div>
                </div>
              </div>




            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
} 