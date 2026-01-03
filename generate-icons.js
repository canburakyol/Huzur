
import { Jimp } from 'jimp';
import path from 'path';

async function generateIcons() {
    const iconPath = 'assets/icon.png';
    const androidResPath = 'android/app/src/main/res';

    const sizes = [
        { name: 'mipmap-mdpi', size: 48 },
        { name: 'mipmap-hdpi', size: 72 },
        { name: 'mipmap-xhdpi', size: 96 },
        { name: 'mipmap-xxhdpi', size: 144 },
        { name: 'mipmap-xxxhdpi', size: 192 }
    ];

    try {
        const image = await Jimp.read(iconPath);

        for (const config of sizes) {
            const resized = image.clone().resize({ w: config.size, h: config.size });

            // Standard Icon
            const outPath = path.join(androidResPath, config.name, 'ic_launcher.png');
            await resized.write(outPath);
            console.log(`Generated ${outPath}`);

            // Round Icon (Just using the same for now, ideally should be masked)
            const outPathRound = path.join(androidResPath, config.name, 'ic_launcher_round.png');
            await resized.write(outPathRound);
            console.log(`Generated ${outPathRound}`);
        }
        console.log('Icon generation complete!');
    } catch (err) {
        console.error('Error generating icons:', err);
    }
}

generateIcons();
