
async function checkRobots() {
    try {
        const response = await fetch('https://kuran.diyanet.gov.tr/robots.txt');
        const text = await response.text();
        console.log(text);
    } catch (e) {
        console.log('Error:', e.message);
    }
}

checkRobots();
