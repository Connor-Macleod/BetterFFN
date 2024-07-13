import config from './pageConfig.js';
let wakeLock = null
export default ()=>{
    if (config.id){
        const pagejs = require(`./pages/${config.id}.js`)
        const pagecss = require(`./styles/${config.id}.less`)

        pagejs.default(config);

        const styles = document.createElement('style')
        styles.innerHTML = pagecss
        document.head.appendChild(styles)
        if (config.wakeLock){
            try {
                wakeLock = navigator.wakeLock.request("screen");
            } catch (err) {
                // The wake lock request fails - usually system-related, such as low battery.

                console.log(`${err.name}, ${err.message}`);
            }
        } else {
            if (wakeLock !== null) {
                wakeLock.release().then(() => {
                    wakeLock = null;
                })
            }
        }
    }


}
