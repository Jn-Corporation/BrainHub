// PWA Setup
(function () {

    // Manifest
    if (!document.querySelector('link[rel="manifest"]')) {
        const manifest = document.createElement("link");
        manifest.rel = "manifest";
        manifest.href = "/manifest.json";
        document.head.appendChild(manifest);
    }

    // Theme Color
    let themeMeta = document.querySelector('meta[name="theme-color"]');

    if (!themeMeta) {
        themeMeta = document.createElement("meta");
        themeMeta.name = "theme-color";
        themeMeta.content = "#6366f1";
        document.head.appendChild(themeMeta);
    }

    // Mobile App Capable
    const mobileCapable = document.createElement("meta");
    mobileCapable.name = "mobile-web-app-capable";
    mobileCapable.content = "yes";
    document.head.appendChild(mobileCapable);

    const appleCapable = document.createElement("meta");
    appleCapable.name = "apple-mobile-web-app-capable";
    appleCapable.content = "yes";
    document.head.appendChild(appleCapable);

    // Safe Area CSS
    if (!document.getElementById("brainhub-safe-area")) {
        const style = document.createElement("style");

        style.id = "brainhub-safe-area";

        style.textContent = `
            html{
                -webkit-tap-highlight-color: transparent;
                touch-action: manipulation;
            }

            body{
                padding-top: env(safe-area-inset-top);
                overscroll-behavior:none;
                -webkit-text-size-adjust:100%;
                text-size-adjust:100%;
            }

            button,
            a,
            input{
                touch-action: manipulation;
            }
        `;

        document.head.appendChild(style);
    }

    // Service Worker
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("/sw.js")
                .then(() => console.log("SW Registered"))
                .catch(err => console.error(err));
        });
    }

})();