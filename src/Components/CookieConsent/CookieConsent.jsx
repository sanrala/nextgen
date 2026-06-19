import React, { useEffect, useState } from "react";

const STORAGE_KEY = "nextgen_cookie_preferences";
const COOKIE_NAME = "nextgen_cookie_consent";

const defaultPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function saveConsent(preferences) {
  const consent = {
    ...preferences,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; path=/; max-age=15552000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("nextgen-cookie-consent", { detail: consent }));
}

function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    const storedConsent = localStorage.getItem(STORAGE_KEY);

    if (!storedConsent) {
      setIsVisible(true);
      return;
    }

    try {
      const parsedConsent = JSON.parse(storedConsent);
      setPreferences({
        ...defaultPreferences,
        analytics: Boolean(parsedConsent.analytics),
        marketing: Boolean(parsedConsent.marketing),
      });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setIsVisible(true);
    }
  }, []);

  const closeBanner = (nextPreferences) => {
    saveConsent(nextPreferences);
    setPreferences(nextPreferences);
    setIsVisible(false);
    setIsSettingsOpen(false);
  };

  const togglePreference = (preferenceName) => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      [preferenceName]: !currentPreferences[preferenceName],
    }));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="cookie-consent" role="dialog" aria-live="polite" aria-label="Gestion des cookies">
      <div className="cookie-consent__content">
        <div className="cookie-consent__text">
          <span className="cookie-consent__eyebrow">Confidentialite</span>
          <h2>Gestion des cookies</h2>
          <p>
            Nous utilisons des cookies essentiels au fonctionnement du site, ainsi que des cookies de mesure
            d'audience et de personnalisation avec votre accord.
          </p>
        </div>

        {isSettingsOpen && (
          <div className="cookie-consent__settings">
            <label className="cookie-consent__option cookie-consent__option--disabled">
              <span>
                <strong>Cookies necessaires</strong>
                <small>Indispensables au fonctionnement du site.</small>
              </span>
              <span className="cookie-consent__switch">
                <input type="checkbox" checked readOnly />
                <span className="cookie-consent__slider"></span>
              </span>
            </label>

            <label className="cookie-consent__option">
              <span>
                <strong>Mesure d'audience</strong>
                <small>Nous aide a comprendre l'utilisation du site.</small>
              </span>
              <span className="cookie-consent__switch">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={() => togglePreference("analytics")}
                />
                <span className="cookie-consent__slider"></span>
              </span>
            </label>

            <label className="cookie-consent__option">
              <span>
                <strong>Personnalisation</strong>
                <small>Permet d'adapter certains contenus et recommandations.</small>
              </span>
              <span className="cookie-consent__switch">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={() => togglePreference("marketing")}
                />
                <span className="cookie-consent__slider"></span>
              </span>
            </label>
          </div>
        )}

        <div className="cookie-consent__actions">
          <button type="button" className="cookie-consent__button cookie-consent__button--ghost" onClick={() => closeBanner(defaultPreferences)}>
            Refuser
          </button>
          <button type="button" className="cookie-consent__button cookie-consent__button--ghost" onClick={() => setIsSettingsOpen((isOpen) => !isOpen)}>
            {isSettingsOpen ? "Masquer" : "Personnaliser"}
          </button>
          {isSettingsOpen ? (
            <button type="button" className="cookie-consent__button cookie-consent__button--primary" onClick={() => closeBanner(preferences)}>
              Enregistrer
            </button>
          ) : (
            <button
              type="button"
              className="cookie-consent__button cookie-consent__button--primary"
              onClick={() => closeBanner({ necessary: true, analytics: true, marketing: true })}
            >
              Tout accepter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
