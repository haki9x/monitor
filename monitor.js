(async () => {
    // Thay URL GitHub RAW của bạn
    const uiUrl = 'https://raw.githubusercontent.com/haki9x/monitor/main/monitor-ui.js';
    const coreUrl = 'https://raw.githubusercontent.com/haki9x/monitor/main/monitor-core.js';

    try {
        const [uiCode, coreCode] = await Promise.all([
            fetch(uiUrl).then(res => res.text()),
            fetch(coreUrl).then(res => res.text())
        ]);

        // Inject Core trước
        const coreScript = document.createElement('script');
        coreScript.textContent = coreCode;
        document.documentElement.appendChild(coreScript);

        // Inject UI
        const uiScript = document.createElement('script');
        uiScript.textContent = uiCode;
        document.documentElement.appendChild(uiScript);

        console.log("✅ Monitor loaded from GitHub");
    } catch (err) {
        console.error("❌ Load monitor failed", err);
    }
})();
