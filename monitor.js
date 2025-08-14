(function(){
    if (!performance.memory) {
        console.warn("performance.memory không khả dụng trong tab này (có thể do Guest/Incognito hoặc chưa bật flag).");
    }

    let lastTime = performance.now();
    let frameCount = 0;

    function measureFPS(time) {
        frameCount++;
        if (time - lastTime >= 1000) {
            const fps = frameCount;
            frameCount = 0;
            lastTime = time;

            let ramInfo = '';
            if (performance.memory) {
                ramInfo = ` | RAM: ${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB / ${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`;
            }
            console.log(`[${new Date().toLocaleTimeString()}] FPS: ${fps}${ramInfo}`);
        }
        requestAnimationFrame(measureFPS);
    }

    measureFPS();
})();
