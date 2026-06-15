import { useEffect } from "react";

function Banner() {

  useEffect(() => {
    // 1. Config DOIT être avant le script
    window.igBannerConfig = {
      lang: "fr",
      igr: "gamer-707207",
      banners: ["ig-banner-home"]
    };

    // 2. Création du script
    const script = document.createElement("script");
    script.src = "https://www.instant-gaming.com/api/banner/partner/loader.js";
    script.defer = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="bann-img"
    
    >
      <div className="ig-banner-home"
   
      ></div>
    </section>
  );
}

export default Banner;